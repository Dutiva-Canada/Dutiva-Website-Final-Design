import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { renderApp } from '@/test/renderApp'
import type { AdvisorSearchNavState } from '@/features/app/search/searchCorpus'
import { TasksView } from './TasksView'

/** Records where a row click navigated to (route + chatId router state). */
function LocationProbe() {
  const location = useLocation()
  const state = location.state as AdvisorSearchNavState | null
  return (
    <div data-testid="location">
      {location.pathname}|{state?.chatId ?? ''}
    </div>
  )
}

function renderTasks() {
  return renderApp(
    <>
      <TasksView />
      <LocationProbe />
    </>,
    { route: '/app/tasks' },
  )
}

describe('TasksView', () => {
  it('renders the open count and the fixture checklist rows', () => {
    renderTasks()

    /* 5 of the 6 fixture tasks are open (tk3 is done). */
    expect(screen.getByText('5 open')).toBeInTheDocument()

    /* Row content: title, meta line, linked case, blocked + evidence notes. */
    expect(
      screen.getByText('Review termination notice exposure — Jordan Mensah'),
    ).toBeInTheDocument()
    expect(screen.getByText('Today · Owner: Riley Summers · Ontario')).toBeInTheDocument()
    expect(screen.getAllByText('Linked: Termination — Jordan Mensah')).toHaveLength(2)
    expect(screen.getByText('Linked: Remote work policy refresh')).toBeInTheDocument()
    expect(screen.getByText('Waits on: counsel response (due Jul 10)')).toBeInTheDocument()
    expect(
      screen.getByText('Evidence: French onboarding package filed to the case'),
    ).toBeInTheDocument()

    /* Status + priority chips. */
    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getAllByText('Open')).toHaveLength(4)
    expect(screen.getAllByText('high')).toHaveLength(2)
    expect(screen.getAllByText('medium')).toHaveLength(2)
    expect(screen.getAllByText('low')).toHaveLength(2)
  })

  it('toggles a task done and updates the open count and strikethrough', () => {
    renderTasks()

    const [firstToggle] = screen.getAllByRole('button', { name: 'Toggle task done' })
    expect(firstToggle).toBeDefined()
    fireEvent.click(firstToggle!)

    expect(screen.getByText('4 open')).toBeInTheDocument()
    expect(screen.getByText('Review termination notice exposure — Jordan Mensah')).toHaveClass(
      'line-through',
    )
    expect(screen.getAllByText('Done')).toHaveLength(2)

    /* Toggle back re-opens it. */
    fireEvent.click(firstToggle!)
    expect(screen.getByText('5 open')).toBeInTheDocument()
  })

  it('opens the linked Advisor conversation when a row body is clicked', () => {
    renderTasks()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open linked conversation for Review termination notice exposure — Jordan Mensah',
      }),
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/app/advisor|c1')
  })
})
