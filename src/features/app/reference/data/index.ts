import type { ReferenceGuide } from '../guideModel'
import { functionalLimitationsGuide } from './functionalLimitations'
import { parentalLeaveGuide } from './parentalLeave'

/**
 * Every in-product reference guide. Adding one here gives it a route at
 * `/app/knowledge/<slug>` and a card at the top of the Knowledge view — see
 * docs/FOUR_RING_FRAMEWORK.md before authoring.
 */
export const referenceGuides: ReferenceGuide[] = [functionalLimitationsGuide, parentalLeaveGuide]

export const guideBySlug = new Map(referenceGuides.map((g) => [g.slug, g]))
