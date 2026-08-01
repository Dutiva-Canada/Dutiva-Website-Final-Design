import type { Flow } from '../flowModel'
import { dutyToAccommodateFlow } from './dutyToAccommodate'

/**
 * Every guided flow the product ships. Adding one here gives it a route at
 * `/app/workflows/<slug>` and a card on the Workflows view — see
 * docs/FOUR_RING_FRAMEWORK.md before authoring.
 */
export const flows: Flow[] = [dutyToAccommodateFlow]

export const flowBySlug = new Map(flows.map((f) => [f.slug, f]))
