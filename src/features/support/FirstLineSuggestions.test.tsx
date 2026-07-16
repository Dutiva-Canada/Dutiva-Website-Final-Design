import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { FirstLineSuggestions } from './FirstLineSuggestions'

describe('FirstLineSuggestions', () => {
  it('shows the human-handled note for a sensitive category', () => {
    renderApp(<FirstLineSuggestions query="I found a vulnerability" category="security" />)
    expect(screen.getByRole('note')).toHaveTextContent(
      'This type of request is always handled by a person',
    )
    // No article suggestions are offered for human-only categories.
    expect(screen.queryByText(/Before you send/)).toBeNull()
  })

  it('suggests matching Help Centre articles for an eligible category', () => {
    renderApp(
      <FirstLineSuggestions query="generate a document from a template" category="product_question" />,
    )
    expect(screen.getByText(/Before you send/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Generating a document from a template/ })
    expect(link).toHaveAttribute('href', '/help/generate-a-document')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders nothing before the query is meaningful', () => {
    renderApp(<FirstLineSuggestions query="ab" category="product_question" />)
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.queryByText(/Before you send/)).toBeNull()
  })
})
