/* oxlint-disable react/only-export-components -- route table, not a component
   module: the lazy() wrappers here don't participate in fast refresh. */
import { Suspense, lazy } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { ForcedLangProvider } from '@/i18n/ForcedLangProvider'
import type { Lang } from '@/i18n/core'
import { langOfPath, seoRoute } from '@/seo/routes'
import type { SeoRouteId } from '@/seo/routes'
import { appViewRoutes } from './appViews'

/* Route-level code splitting: marketing visitors never download the app
   workspace, and vice versa. Suspense fallbacks stay empty — each surface
   paints its own bg via the surface classes, so there is nothing to flash. */
const LandingPage = lazy(() =>
  import('@/features/marketing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
/* Marketing subpages (dutiva.ca content migration) — split per route like the views. */
/* prettier-ignore */ const AboutPage = lazy(() => import('@/features/marketing/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
/* prettier-ignore */ const FaqPage = lazy(() => import('@/features/marketing/pages/FaqPage').then((m) => ({ default: m.FaqPage })))
/* prettier-ignore */ const BlogIndexPage = lazy(() => import('@/features/marketing/pages/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })))
/* prettier-ignore */ const TemplateUsagePage = lazy(() => import('@/features/marketing/pages/TemplateUsagePage').then((m) => ({ default: m.TemplateUsagePage })))
/* prettier-ignore */ const KnownLimitationsPage = lazy(() => import('@/features/marketing/pages/KnownLimitationsPage').then((m) => ({ default: m.KnownLimitationsPage })))
/* prettier-ignore */ const LegalHubPage = lazy(() => import('@/features/marketing/pages/LegalHubPage').then((m) => ({ default: m.LegalHubPage })))
/* prettier-ignore */ const PolicyPage = lazy(() => import('@/features/marketing/pages/PolicyPage').then((m) => ({ default: m.PolicyPage })))
/* prettier-ignore */ const HelpCenterPage = lazy(() => import('@/features/marketing/pages/HelpCenterPage').then((m) => ({ default: m.HelpCenterPage })))
/* prettier-ignore */ const HelpArticlePage = lazy(() => import('@/features/marketing/pages/HelpArticlePage').then((m) => ({ default: m.HelpArticlePage })))
/* prettier-ignore */ const ContactPage = lazy(() => import('@/features/marketing/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
/* prettier-ignore */ const PricingShell = lazy(() => import('@/features/marketing/pages/PricingShell').then((m) => ({ default: m.PricingShell })))
/* prettier-ignore */ const TemplatesPage = lazy(() => import('@/features/marketing/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })))
/* prettier-ignore */ const GuidesIndexPage = lazy(() => import('@/features/marketing/pages/GuidesIndexPage').then((m) => ({ default: m.GuidesIndexPage })))
/* prettier-ignore */ const NotFoundPage = lazy(() => import('@/features/marketing/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
/* App surface (providers + shell) — one lazy chunk, see appSurface.tsx. */
/* prettier-ignore */ const AppWelcome = lazy(() => import('./appSurface').then((m) => ({ default: m.AppWelcome })))
/* prettier-ignore */ const AppAuthConfirm = lazy(() => import('./appSurface').then((m) => ({ default: m.AppAuthConfirm })))
/* prettier-ignore */ const Workspace = lazy(() => import('./appSurface').then((m) => ({ default: m.Workspace })))

/**
 * Layout wrapper for the public marketing surface: the URL decides the
 * language (see ForcedLangProvider), one wrapper per locale tree.
 */
function PublicShell({ lang }: { readonly lang: Lang }) {
  return (
    <ForcedLangProvider lang={lang}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </ForcedLangProvider>
  )
}

/**
 * Public routes for one locale, with pathnames from the SEO route registry
 * (src/seo/routes.ts) — English at the site's original unprefixed URLs,
 * French under /fr with localized slugs. The registry is the single source
 * of truth; adding a page means adding it there first.
 */
function publicRoutes(lang: Lang): RouteObject {
  const p = (id: SeoRouteId) => seoRoute(id).path[lang]
  return {
    element: <PublicShell lang={lang} />,
    children: [
      { path: p('home'), element: <LandingPage /> },
      { path: p('about'), element: <AboutPage /> },
      { path: p('faq'), element: <FaqPage /> },
      { path: p('blog'), element: <BlogIndexPage /> },
      { path: p('pricing'), element: <PricingShell /> },
      { path: p('templates'), element: <TemplatesPage /> },
      { path: p('guides'), element: <GuidesIndexPage /> },
      { path: p('templateUsage'), element: <TemplateUsagePage /> },
      { path: p('knownLimitations'), element: <KnownLimitationsPage /> },
      { path: p('legal'), element: <LegalHubPage /> },
      /* :slug is the locale's own slug (FR uses the localized frSlug). */
      { path: `${p('legal')}/:slug`, element: <PolicyPage /> },
      { path: p('help'), element: <HelpCenterPage /> },
      { path: `${p('help')}/:slug`, element: <HelpArticlePage /> },
      { path: p('contact'), element: <ContactPage /> },
    ],
  }
}

/** Catch-all: a real 404 page (noindex), localized by URL prefix. The static
    host serves dist/404.html with a 404 status for unknown URLs; this route
    covers client-side navigations to broken links. */
function NotFoundRoute() {
  const { pathname } = useLocation()
  return (
    <ForcedLangProvider lang={langOfPath(pathname)}>
      <Suspense fallback={null}>
        <NotFoundPage />
      </Suspense>
    </ForcedLangProvider>
  )
}

/**
 * Route map (see CONVENTIONS.md):
 *   /  /about /faq /blog /pricing /templates /guides
 *   /guides/template-usage /known-limitations /legal /legal/:slug
 *   /help /help/:slug /contact   public marketing surface (English)
 *   /fr /fr/a-propos …     the same pages in French (localized slugs,
 *                          see src/seo/routes.ts)
 *   /app/welcome           app entry stage — sign-in gate (invite-only)
 *   /app/auth/confirm      magic-link landing — verifies the token, then enters
 *   /app                   workspace shell → redirects to /app/home
 *                          (gated: RequireAdminSession bounces anyone who
 *                          isn't the one allowed account back to /app/welcome)
 *   /app/<view>            the 16 workspace views
 *   /app/cases/:caseId     case detail
 *   /app/employees/:employeeId  employee profile
 *   *                      404 (noindex)
 */
export const routes: RouteObject[] = [
  publicRoutes('en'),
  publicRoutes('fr'),
  {
    path: '/app/welcome',
    element: (
      <Suspense fallback={null}>
        <AppWelcome />
      </Suspense>
    ),
  },
  {
    path: '/app/auth/confirm',
    element: (
      <Suspense fallback={null}>
        <AppAuthConfirm />
      </Suspense>
    ),
  },
  {
    path: '/app',
    element: (
      <Suspense fallback={null}>
        <Workspace />
      </Suspense>
    ),
    children: [{ index: true, element: <Navigate to="/app/home" replace /> }, ...appViewRoutes],
  },
  { path: '*', element: <NotFoundRoute /> },
]
