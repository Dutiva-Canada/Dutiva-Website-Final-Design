import { render } from '@testing-library/react'
import type { RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LangProvider } from '@/i18n/LangProvider'
import { ThemeProvider } from '@/lib/theme'
import { AppProviders } from '@/features/app/AppProviders'

interface RenderAppOptions {
  /** Initial URL, e.g. '/app/cases/case1'. Defaults to '/app/home'. */
  route?: string
  /**
   * Route pattern the component is mounted at (for params), e.g.
   * '/app/cases/:caseId'. Defaults to '*' (matches anything).
   */
  path?: string
  /** Router state for the initial entry (navigation contracts). */
  state?: unknown
}

/**
 * Render a workspace view/component inside the full provider stack
 * (theme, i18n, toasts, rail, search, doc studio) and a MemoryRouter.
 * RailProvider calls useNavigate, so the router must wrap AppProviders.
 */
export function renderApp(
  ui: ReactElement,
  { route = '/app/home', path = '*', state }: RenderAppOptions = {},
): RenderResult {
  return render(
    <ThemeProvider>
      <LangProvider>
        <MemoryRouter initialEntries={[state === undefined ? route : { pathname: route, state }]}>
          <AppProviders>
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
          </AppProviders>
        </MemoryRouter>
      </LangProvider>
    </ThemeProvider>,
  )
}
