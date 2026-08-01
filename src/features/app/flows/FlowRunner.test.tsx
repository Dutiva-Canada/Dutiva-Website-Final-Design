import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { FlowRunner } from './FlowRunner'

/**
 * The runner's own behaviour. The engine's rules are tested against a fixture
 * graph in `flowEngine.test.ts`; what matters here is that the component is
 * wired to them — that a click advances, that back returns, and that a
 * completed run surfaces the documents rather than stopping at advice.
 *
 * Driven through the shipped duty-to-accommodate flow rather than a fixture,
 * because the wiring worth guarding is the wiring users hit.
 */
const renderFlow = (slug = 'duty-to-accommodate') =>
  renderApp(<FlowRunner />, { route: `/app/workflows/${slug}`, path: '/app/workflows/:slug' })

describe('FlowRunner', () => {
  it('opens on the flow’s first step', () => {
    renderFlow()
    expect(screen.getByRole('heading', { level: 1, name: 'Duty to accommodate' })).toBeVisible()
    expect(
      screen.getByRole('heading', { level: 2, name: 'What has happened so far?' }),
    ).toBeVisible()
  })

  it('advances when an option is chosen', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /Someone has asked for a change/ }))
    expect(
      screen.getByRole('heading', { level: 2, name: 'Gather what you are entitled to' }),
    ).toBeVisible()
  })

  it('returns to a clean choice when stepping back', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /Someone has asked for a change/ }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    /* Both branches offered again — a retained answer would read as decided. */
    expect(screen.getByRole('button', { name: /Someone has asked for a change/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Nobody has asked/ })).toBeVisible()
  })

  it('hides Back on the first step and restores it after advancing', async () => {
    const user = userEvent.setup()
    renderFlow()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Someone has asked for a change/ }))
    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible()
  })

  it('ends at an outcome that names the documents to produce', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /Someone has asked for a change/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' })) // gather
    await user.click(screen.getByRole('button', { name: 'Continue' })) // explore
    await user.click(screen.getByRole('button', { name: /we have something that works/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' })) // implement

    expect(screen.getByRole('heading', { level: 2, name: 'Accommodation in place' })).toBeVisible()
    /* The handoff is the point — a flow that ends in advice leaves nothing on
       the file. */
    expect(screen.getByRole('link', { name: /Accommodation request response/ })).toHaveAttribute(
      'href',
      '/app/documents/templates/T22',
    )
    expect(screen.getByRole('link', { name: /Accommodation plan/ })).toHaveAttribute(
      'href',
      '/app/documents/templates/T23',
    )
  })

  it('shows the path taken once complete', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /follows a workplace injury/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' })) // injury_path
    await user.click(screen.getByRole('button', { name: 'Continue' })) // gather
    await user.click(screen.getByRole('button', { name: 'Continue' })) // explore
    await user.click(screen.getByRole('button', { name: /nothing we found works/ }))
    await user.click(screen.getByRole('button', { name: /cost or a safety risk/ }))

    expect(screen.getByRole('heading', { level: 2, name: /Undue hardship/ })).toBeVisible()
    /* The record is what gets copied onto the file, so it has to carry both
       the questions and the answers — a list of step titles alone would not
       show why the refusal was reached. */
    const path = screen.getByText('The path you took').parentElement?.textContent ?? ''
    expect(path).toContain('What has happened so far?')
    expect(path).toContain('It follows a workplace injury')
    expect(path).toContain('Test it before you call it hardship')
  })

  it('restarts to the first step', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /Someone has asked for a change/ }))
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(
      screen.getByRole('heading', { level: 2, name: 'What has happened so far?' }),
    ).toBeVisible()
  })

  it('tells the user when the slug is not a flow', () => {
    renderFlow('not-a-flow')
    expect(screen.getByText('That process does not exist.')).toBeVisible()
  })
})
