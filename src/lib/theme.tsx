import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { readPref, writePref } from './prefs'
import { ThemeContext } from './themeContext'
import type { Theme } from './themeContext'

const THEME_KEY = 'dutiva-theme'

function readTheme(): Theme {
  const storedTheme = readPref(THEME_KEY, '')
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Theme state must be hydration-safe: public pages are prerendered with the
 * default ('dark'), so the first client render has to match it — the stored
 * preference is adopted in a mount effect instead of the useState
 * initializer. There is no visual flash: the page's colors come from the
 * `data-theme` attribute, which the index.html inline script already set
 * before first paint; only React-driven bits (the toggle icon) update after
 * mount. Re-stamping the stored value on mount is a visual no-op (the inline
 * script read the same preference), so nothing flashes.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = readTheme()
    document.documentElement.dataset.theme = stored
    setTheme(stored)
  }, [])

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    writePref(THEME_KEY, next)
    setTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      writePref(THEME_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext value={{ theme, setTheme: applyTheme, toggleTheme }}>{children}</ThemeContext>
  )
}
