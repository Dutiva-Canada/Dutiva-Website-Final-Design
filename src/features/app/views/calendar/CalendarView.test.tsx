import { describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { CalendarView } from './CalendarView'

function renderCalendar() {
  return renderApp(
    <>
      <CalendarView />
      <AdvisorRail />
    </>,
    { route: '/app/calendar' },
  )
}

describe('CalendarView', () => {
  it('renders the month header, weekday labels, today cell, and event chips', () => {
    renderCalendar()

    expect(screen.getByText('July 2026')).toBeInTheDocument()
    for (const d of ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']) {
      expect(screen.getByText(d)).toBeInTheDocument()
    }

    /* July 2026 starts on a Wednesday and has 31 days. */
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()

    /* Fixture events appear as a grid chip and again in the Upcoming list. */
    expect(screen.getAllByText('Probation ends — Priya Nair')).toHaveLength(2)
    expect(screen.getAllByText('Law 25 PIA due — HRIS vendor')).toHaveLength(2)

    /* Upcoming list: heading + date chips. */
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Jul 8')).toBeInTheDocument()
    expect(screen.getByText('Jul 31')).toBeInTheDocument()
  })

  it('opens the Advisor rail with the event detail when an event is clicked', () => {
    renderCalendar()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const [gridChip] = screen.getAllByRole('button', {
      name: 'Counsel response due — Termination case',
    })
    expect(gridChip).toBeDefined()
    fireEvent.click(gridChip!)

    const dialog = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(within(dialog).getByText('Counsel response due — Termination case')).toBeInTheDocument()
  })
})
