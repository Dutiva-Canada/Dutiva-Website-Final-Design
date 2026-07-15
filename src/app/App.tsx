import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { router } from './router'

/**
 * Language providers live inside the route tree (URL-scoped on the public
 * surface, preference-scoped on /app — see routes.tsx), so App only carries
 * the theme.
 */
export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
