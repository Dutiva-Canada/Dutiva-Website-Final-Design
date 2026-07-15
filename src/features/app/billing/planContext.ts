import { createContext, useContext } from 'react'
import type { PlanId } from '@/config/plans'

export interface PlanContextValue {
  plan: PlanId
  subscriptionStatus: string
  stripeCustomerId: string | null
  /** @dutiva.ca / explicitly listed internal account — always fully entitled, never billed. */
  isAdmin: boolean
  loading: boolean
}

export const PlanContext = createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used within a PlanProvider')
  return ctx
}
