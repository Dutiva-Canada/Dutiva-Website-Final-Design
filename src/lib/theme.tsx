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

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const updateTheme = useCallback((next: Theme) => {
    writePref(THEME_KEY, next)
    setTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      writePref(THEME_KEY, next)
      return next
    })
  }, [])

  return <ThemeContext value={{ theme, setTheme: updateTheme, toggleTheme }}>{children}</ThemeContext>
}
