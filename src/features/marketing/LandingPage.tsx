import './landing.css'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { TrustStrip } from './sections/TrustStrip'
import { HowItWorks } from './sections/HowItWorks'
import { Workflows } from './sections/Workflows'
import { Product } from './sections/Product'
import { Modules } from './sections/Modules'
import { WhyDutiva } from './sections/WhyDutiva'
import { Coverage } from './sections/Coverage'
import { Pricing } from './sections/Pricing'
import { Guides } from './sections/Guides'
import { BetaSignup } from './sections/BetaSignup'
import { Footer } from './sections/Footer'

/**
 * Marketing landing page (dutiva.ca) — ported from
 * `Landing Page (redesign) v2.dc.html`. Section order mirrors the prototype:
 * hero → trust strip → how → workflows → Document Studio → one workspace →
 * why Dutiva → coverage → pricing → guides → beta signup → footer.
 */
export function LandingPage() {
  return (
    <div className="surface-marketing dutiva-surface min-h-screen text-text">
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Workflows />
        <Product />
        <Modules />
        <WhyDutiva />
        <Coverage />
        <Pricing />
        <Guides />
        <BetaSignup />
      </main>
      <Footer />
    </div>
  )
}
