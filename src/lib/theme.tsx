import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { readPref, writePref } from './prefs'
import { ThemeContext } from './themeContext'
import type { Theme } from './themeContext'

const THEME_KEY = 'dutiva-theme'

function readTheme(): Theme {
  return readPref(THEME_KEY, 'dark') === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    writePref(THEME_KEY, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      writePref(THEME_KEY, next)
      return next
    })
  }, [])

  return <ThemeContext value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext>
}
