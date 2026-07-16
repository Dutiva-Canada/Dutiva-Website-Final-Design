import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

function renderMd(text: string) {
  return render(<div data-testid="md">{renderMarkdown(text)}</div>)
}

describe('renderMarkdown', () => {
  it('renders **bold** as <strong> without the asterisks', () => {
    const { getByText, container } = renderMd('I am your **Dutiva AI Advisor** here')
    const strong = getByText('Dutiva AI Advisor')
    expect(strong.tagName).toBe('STRONG')
    expect(container.textContent).toBe('I am your Dutiva AI Advisor here')
    expect(container.textContent).not.toContain('*')
  })

  it('renders *italic* and _italic_ as <em>', () => {
    const star = renderMd('this is *very* important')
    expect(within(star.container).getByText('very').tagName).toBe('EM')
    const underscore = renderMd('this is _very_ important')
    expect(within(underscore.container).getByText('very').tagName).toBe('EM')
  })

  it('renders `inline code` as <code>', () => {
    const { getByText } = renderMd('use the `max_tokens` field')
    expect(getByText('max_tokens').tagName).toBe('CODE')
  })

  it('leaves intra-word underscores literal (no emphasis)', () => {
    const { container, queryByText } = renderMd('the max_tokens value')
    expect(container.textContent).toBe('the max_tokens value')
    expect(queryByText('tokens')).toBeNull()
  })

  it('renders headings as emphasized text with the # markers stripped', () => {
    const { getByText, container } = renderMd('## Termination checklist')
    const heading = getByText('Termination checklist')
    expect(heading.tagName).toBe('SPAN')
    expect(heading.className).toContain('font-semibold')
    expect(container.textContent).not.toContain('#')
  })

  it('links only safe schemes and keeps unsafe ones literal', () => {
    const safe = renderMd('see [the ESA](https://example.com/esa) guide')
    const anchor = within(safe.container).getByText('the ESA').closest('a')
    expect(anchor).not.toBeNull()
    expect(anchor?.getAttribute('href')).toBe('https://example.com/esa')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')

    const unsafe = renderMd('click [here](javascript:alert(1)) now')
    expect(unsafe.container.querySelector('a')).toBeNull()
    expect(unsafe.container.textContent).toContain('[here](javascript:alert(1))')
  })

  it('nests emphasis inside bold', () => {
    const { getByText } = renderMd('**bold and *italic* inside**')
    const strong = getByText(/bold and/).closest('strong')
    expect(strong).not.toBeNull()
    expect(getByText('italic').tagName).toBe('EM')
  })

  it('degrades an unterminated delimiter to literal text (mid-stream)', () => {
    const { container } = renderMd('Hello! I am your **Dutiva AI Adviso')
    expect(container.textContent).toBe('Hello! I am your **Dutiva AI Adviso')
    expect(container.querySelector('strong')).toBeNull()
  })

  it('preserves newlines as literal characters for pre-wrap', () => {
    const { container } = renderMd('line one\nline two')
    expect(container.textContent).toBe('line one\nline two')
  })

  it('renders plain text unchanged', () => {
    const { container } = renderMd('No formatting here, just a sentence.')
    expect(container.textContent).toBe('No formatting here, just a sentence.')
    expect(container.querySelector('strong, em, code, a')).toBeNull()
  })
})
