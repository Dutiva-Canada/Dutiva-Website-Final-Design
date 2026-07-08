import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { LangProvider } from '@/i18n/LangProvider'
import { SearchProvider } from './SearchProvider'
import { useSearch } from './searchContext'
import { SearchOverlay } from './SearchOverlay'
import { filterSearchEntries, searchEntries } from './searchCorpus'

function OpenTrigger() {
  const { openSearch } = useSearch()
  return (
    <button type="button" onClick={openSearch}>
      open-search
    </button>
  )
}

function LocationProbe() {
  const location = useLocation()
  return (
    <>
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </>
  )
}

function renderHarness() {
  return render(
    <LangProvider>
      <SearchProvider>
        <MemoryRouter initialEntries={['/app/home']}>
          <OpenTrigger />
          <SearchOverlay />
          <LocationProbe />
        </MemoryRouter>
      </SearchProvider>
    </LangProvider>,
  )
}

async function openOverlay(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'open-search' }))
}

describe('searchCorpus', () => {
  it('indexes every entity domain', () => {
    const kinds = new Set(searchEntries.map((e) => e.kind))
    expect(kinds).toEqual(
      new Set([
        'person',
        'case',
        'chat',
        'document',
        'comms',
        'task',
        'compliance',
        'policy',
        'knowledge',
      ]),
    )
  })

  it('matches a query across entity kinds', () => {
    const ids = filterSearchEntries('all', 'jordan', 'en').map((e) => e.id)
    expect(ids).toContain('emp-e1') // Person
    expect(ids).toContain('case-case1') // Case
    expect(ids).toContain('c1') // Conversation
    expect(ids).toContain('task-tk1') // Task
    expect(ids).toContain('ci-ci1') // Compliance
  })

  it('restricts results to the active tab', () => {
    const caseEntries = filterSearchEntries('cases', '', 'en')
    expect(caseEntries.length).toBeGreaterThan(0)
    expect(caseEntries.every((e) => e.kind === 'case')).toBe(true)

    const docEntries = filterSearchEntries('documents', 'termination', 'en')
    expect(docEntries.map((e) => e.id)).toContain('doc-Termination Letter')
    expect(docEntries.every((e) => e.kind === 'document')).toBe(true)
  })

  it('matches against the current language strings', () => {
    const fr = filterSearchEntries('all', 'cessation d’emploi', 'fr').map((e) => e.id)
    expect(fr).toContain('case-case1')
    const en = filterSearchEntries('all', 'cessation d’emploi', 'en').map((e) => e.id)
    expect(en).not.toContain('case-case1')
  })
})

describe('SearchOverlay', () => {
  it('renders nothing until opened, then focuses the input and shows pinned chats', async () => {
    const user = userEvent.setup()
    renderHarness()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await openOverlay(user)
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus()
    /* 'Pinned' is both the section label and the row's kind label; the pinned
       chat title also appears in the (unfiltered) results list below. */
    expect(screen.getAllByText('Pinned').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Terminating Jordan Mensah — Ontario').length).toBeGreaterThan(0)
  })

  it('filters results across kinds as you type and hides the pinned section', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.keyboard('Jordan')
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument()
    expect(screen.getByText('Person')).toBeInTheDocument()
    expect(screen.getByText('Case')).toBeInTheDocument()
    expect(screen.getByText('Conversation')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
    expect(screen.getByText('Compliance')).toBeInTheDocument()
    expect(screen.getByText('Jordan Mensah')).toBeInTheDocument()
  })

  it('shows only the active tab’s kind and the restricted badge on sensitive cases', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.click(screen.getByRole('button', { name: 'Cases' }))
    expect(screen.getAllByText('Case').length).toBeGreaterThan(0)
    expect(screen.queryByText('Person')).not.toBeInTheDocument()
    expect(screen.queryByText('Conversation')).not.toBeInTheDocument()
    /* case1 is a Termination — sensitiveCaseTypes → lock badge. */
    expect(screen.getAllByText('Restricted').length).toBeGreaterThan(0)
  })

  it('opens the first result on Enter and closes the overlay', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.keyboard('Priya')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('pathname')).toHaveTextContent('/app/employees/e2')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('moves the active row with ArrowDown before opening on Enter', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    /* "Jordan" results, in All-tab order: person e1, case case1, chat c1, … */
    await user.keyboard('Jordan')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('pathname')).toHaveTextContent('/app/cases/case1')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates chat results to the Advisor with the chatId in router state', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.keyboard('policy refresh')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('pathname')).toHaveTextContent('/app/advisor')
    expect(screen.getByTestId('state')).toHaveTextContent('{"chatId":"c3"}')
  })

  it('closes on Escape without navigating and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('pathname')).toHaveTextContent('/app/home')
    expect(screen.getByRole('button', { name: 'open-search' })).toHaveFocus()
  })

  it('shows the empty state for a query with no matches', async () => {
    const user = userEvent.setup()
    renderHarness()
    await openOverlay(user)

    await user.keyboard('xyzq')
    expect(screen.getByText('No results for “xyzq”')).toBeInTheDocument()
    expect(
      screen.getByText('Try a name, case, document, task, policy, or obligation.'),
    ).toBeInTheDocument()
  })
})
