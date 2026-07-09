import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { ReportsView } from './ReportsView'

describe('ReportsView', () => {
  afterEach(() => {
    localStorage.removeItem('dutiva-lang')
  })

  it('renders the subtitle, headcount bars, and compliance trend', () => {
    const { container } = renderApp(<ReportsView />, { route: '/app/reports' })

    expect(screen.getByText('Workforce and compliance overview.')).toBeInTheDocument()

    /* Headcount card: 34 + 21 + 12 + 9 + 6 = 82 across five bars. */
    expect(screen.getByText('Headcount by province')).toBeInTheDocument()
    expect(screen.getByText('82 total employees')).toBeInTheDocument()
    for (const p of ['ON', 'BC', 'QC', 'AB', 'Federal']) {
      expect(screen.getByText(p)).toBeInTheDocument()
    }

    /* Trend card: latest score line + the six-point polyline. */
    expect(screen.getByText('Compliance score trend')).toBeInTheDocument()
    expect(screen.getByText('Now at 82/100, up from 74 six months ago')).toBeInTheDocument()
    const polyline = container.querySelector('polyline')
    expect(polyline).not.toBeNull()
    const expectedPoints = [74, 76, 79, 78, 81, 82]
      .map((v, i) => i * (240 / 5) + ',' + (60 - (v / 100) * 60))
      .join(' ')
    expect(polyline).toHaveAttribute('points', expectedPoints)
  })

  it('renders the French strings when the language preference is fr', () => {
    localStorage.setItem('dutiva-lang', 'fr')
    renderApp(<ReportsView />, { route: '/app/reports' })

    expect(screen.getByText('Aperçu de l’effectif et de la conformité.')).toBeInTheDocument()
    expect(screen.getByText('Effectif par province')).toBeInTheDocument()
    expect(screen.getByText('82 employés au total')).toBeInTheDocument()
    expect(screen.getByText('Fédéral')).toBeInTheDocument()
    expect(screen.getByText('Tendance du score de conformité')).toBeInTheDocument()
  })
})
