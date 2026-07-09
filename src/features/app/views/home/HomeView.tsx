import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
import { homeMessages as M } from '@/i18n/messages/home'
import { ChatComposer } from '@/features/app/advisor/ChatComposer'
import { HomeBriefHero } from './HomeBriefHero'
import { HomeCompliancePanel } from './HomeCompliancePanel'
import { HomeActNowSection, HomeThisWeekSection, HomeWatchingSection } from './HomePriorityQueue'
import { HomeWorkflowCatalog } from './HomeWorkflowCatalog'
import { HomeWorkflowsMobileList, HomeWorkflowsRailCard } from './HomeWorkflowsCard'
import type { AdvisorStartFlowNavState } from '@/features/app/views/advisor/advisorNav'
import { useHomeActions } from './useHomeActions'

/**
 * Home — Command Centre (prototype `App v2.dc.html` markup 335–547,
 * `buildHomeView()` in its default "brief" hero emphasis). Order: AdvisorBrief
 * hero (with MetricChips) → PriorityQueue (Act now / mobile WorkflowCards /
 * This week / Watching) → WorkflowLauncher → right rail (CompliancePrediction
 * + desktop WorkflowCards) → AdvisorComposer.
 */
export function HomeView() {
  const { x } = useI18n()
  const navigate = useNavigate()
  const runAction = useHomeActions()

  /* Prototype `onHomeSend` — free-typed text keeps keyword routing (no key). */
  const sendToAdvisor = (text: string) => {
    navigate('/app/advisor', { state: { prompt: text } satisfies AdvisorStartFlowNavState })
  }

  return (
    <div className="flex-1 overflow-y-auto pt-[18px] pr-[14px] pb-[96px] pl-[14px] sm:pt-[26px] sm:pr-[32px] sm:pb-[60px] sm:pl-[32px]">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="mb-[16px]">
          <div className="mb-[6px] text-[10.5px] font-bold tracking-[0.09em] text-gold-dot uppercase">
            {x(M.home_date_label)}
          </div>
          <h1 className="m-0 mb-[4px] font-display text-[23px] font-semibold text-text">
            {x(M.home_greeting)}
          </h1>
          <p className="m-0 text-[13.5px] text-text-muted">{x(M.home_sub)}</p>
        </div>

        <HomeBriefHero onAction={runAction} />

        <div className="flex flex-wrap items-start gap-[18px]">
          {/* PriorityQueue column */}
          <div className="flex min-w-0 flex-[1.6_1_460px] flex-col gap-[16px]">
            <HomeActNowSection onAction={runAction} />
            <HomeWorkflowsMobileList onAction={runAction} />
            <HomeThisWeekSection onAction={runAction} />
            <HomeWatchingSection onAction={runAction} />
            <HomeWorkflowCatalog onAction={runAction} />
          </div>

          {/* Right rail: CompliancePrediction + WorkflowCards (desktop) */}
          <div className="flex max-w-[380px] min-w-[280px] flex-[1_1_290px] flex-col gap-[14px]">
            <HomeCompliancePanel onAction={runAction} />
            <HomeWorkflowsRailCard onAction={runAction} />
          </div>
        </div>

        {/* AdvisorComposer */}
        <div className="mx-auto mt-[24px] max-w-[760px]">
          <div className="rounded-[14px] shadow-[0_10px_30px_-16px_rgba(27,36,48,0.18)]">
            <ChatComposer
              variant="chat"
              placeholder={x(M.home_composer_placeholder)}
              onSend={sendToAdvisor}
            />
          </div>
          <div className="mt-[8px] text-center text-[11px] text-text-faint">
            {x(M.home_disclaimer_short)}
          </div>
        </div>
      </div>
    </div>
  )
}
