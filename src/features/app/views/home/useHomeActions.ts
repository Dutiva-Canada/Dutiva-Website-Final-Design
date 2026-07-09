import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { useRail } from '@/features/app/rail/railContext'
import { useDocStudio } from '@/features/app/docstudio/docStudioContext'
import { employeeDetails, employees } from '@/data'
import type { AdvisorStartFlowNavState } from '@/features/app/views/advisor/advisorNav'
import type { HomeAction } from './homeData'

/**
 * Money formatting for the pay rail card — prototype uses
 * `'$' + n.toLocaleString()`; FR follows the Canadian-French convention
 * (non-breaking-space thousands group, trailing `$`).
 */
function money(amount: number): Bi {
  const grouped = amount.toLocaleString('en-US')
  return bi(`$${grouped}`, `${grouped.replace(/,/g, ' ')} $`)
}

/**
 * Resolve the Home view's declarative actions (`homeData.ts`) into real
 * navigation, Document Studio and Advisor-rail calls — the port of the
 * prototype's `openCase` / `selectChat` / `handleGenerateDoc` / `startFlow`
 * / `askAboutComp` / `askAboutWellbeing` wiring in `buildPriorities()` and
 * `buildHomeView()`.
 */
export function useHomeActions(): (action: HomeAction) => void {
  const navigate = useNavigate()
  const { openRail, closeRail } = useRail()
  const { openDocStudio } = useDocStudio()

  /* Prototype `askAboutComp(emp)` — pay-review rail. FR is self-authored for
     the body copy (the prototype opens this rail with EN-only strings). */
  const openCompRail = useCallback(
    (employeeId: string) => {
      const emp = employees.find((e) => e.id === employeeId)
      const det = employeeDetails[employeeId]
      if (!emp || !det) return
      const delta = Math.round(((det.salary - det.market) / det.market) * 100)
      const below = delta < -4
      const base = money(det.salary)
      const market = money(det.market)
      const deltaLabel = `(${delta >= 0 ? '+' : ''}${delta}%)`
      openRail(
        bi(`${emp.name} — pay`, `${emp.name} — rémunération`),
        {
          text: below
            ? bi(
                `${emp.name}’s base is sitting below the market midpoint for this role and province. Here’s the picture.`,
                `Le salaire de base de ${emp.name} se situe sous le point milieu du marché pour ce poste et cette province. Voici le portrait.`,
              )
            : bi(
                `${emp.name}’s pay is within a healthy band for the role and province.`,
                `La rémunération de ${emp.name} se situe dans une fourchette saine pour le poste et la province.`,
              ),
          cards: [
            {
              tone: below ? 'warning' : 'success',
              title: below
                ? bi('Below market midpoint', 'Sous le point milieu du marché')
                : bi('Within market band', 'Dans la fourchette du marché'),
              body: bi(
                `Base ${base.en} vs market midpoint ${market.en} ${deltaLabel}. Pay-equity obligations apply across genders for substantially similar work. Review recommended — additional comparator data is required before any change, and Dutiva does not determine pay-equity compliance conclusively.`,
                `Salaire de base de ${base.fr} contre un point milieu du marché de ${market.fr} ${deltaLabel}. Les obligations d’équité salariale s’appliquent au travail substantiellement similaire entre les genres. Révision recommandée — des données de comparaison supplémentaires sont requises avant tout changement, et Dutiva ne détermine pas de façon concluante la conformité en équité salariale.`,
              ),
              citations: [
                {
                  label: bi(
                    'Pay Equity Act (federal / ON)',
                    'Loi sur l’équité salariale (fédéral / Ont.)',
                  ),
                },
              ],
              actions: [
                {
                  label: bi('Open compensation tab', 'Ouvrir l’onglet Rémunération'),
                  primary: true,
                  onClick: () => {
                    closeRail()
                    navigate(`/app/employees/${emp.id}`, { state: { tab: 'compensation' } })
                  },
                },
              ],
            },
          ],
        },
        {
          chips: [emp.province, emp.role, bi('Compensation review', 'Examen de la rémunération')],
          initials: emp.initials,
        },
      )
    },
    [openRail, closeRail, navigate],
  )

  /* Prototype `askAboutWellbeing(emp)` — supportive, non-diagnostic rail. */
  const openWellbeingRail = useCallback(
    (employeeId: string) => {
      const emp = employees.find((e) => e.id === employeeId)
      if (!emp) return
      const firstName = emp.name.split(' ')[0] ?? emp.name
      openRail(
        bi(`${emp.name} — wellbeing`, `${emp.name} — bien-être`),
        {
          text: bi(
            `Here’s what I’m seeing in ${firstName}’s recent check-ins. I’ll keep this non-diagnostic.`,
            `Voici ce que j’observe dans les derniers suivis de ${firstName}. Je resterai non diagnostique.`,
          ),
          cards: [
            {
              tone: 'info',
              title: bi('Handle with care', 'À traiter avec délicatesse'),
              body: bi(
                'Frame any conversation around workload and support, not medical questions. If a medical cause surfaces, it may trigger a duty to inquire about accommodation.',
                'Orientez toute conversation vers la charge de travail et le soutien, pas vers des questions médicales. Si une cause médicale émerge, elle peut déclencher une obligation de s’informer sur l’accommodement.',
              ),
              citations: [
                {
                  label: bi(
                    'Human rights — duty to accommodate',
                    'Droits de la personne — obligation d’accommodement',
                  ),
                },
              ],
              actions: [
                {
                  label: bi('Draft a check-in message', 'Rédiger un message de suivi'),
                  primary: true,
                  onClick: () => {
                    closeRail()
                    navigate('/app/communications')
                  },
                },
              ],
            },
          ],
        },
        {
          chips: [emp.province, emp.role, bi('Wellbeing', 'Bien-être')],
          initials: emp.initials,
        },
      )
    },
    [openRail, closeRail, navigate],
  )

  return useCallback(
    (action: HomeAction) => {
      switch (action.kind) {
        case 'route':
          navigate(action.to)
          break
        case 'chat':
          navigate('/app/advisor', { state: { chatId: action.chatId } })
          break
        case 'doc':
          openDocStudio(action.templateKey)
          break
        case 'flow':
          /* Bi prompt + explicit key — live language toggles re-localize the
             seeded bubble, and the flow never depends on keyword routing. */
          navigate('/app/advisor', {
            state: {
              prompt: action.prompt,
              flowKey: action.flowKey,
            } satisfies AdvisorStartFlowNavState,
          })
          break
        case 'comp-rail':
          openCompRail(action.employeeId)
          break
        case 'wellbeing-rail':
          openWellbeingRail(action.employeeId)
          break
      }
    },
    [navigate, openDocStudio, openCompRail, openWellbeingRail],
  )
}
