/**
 * Internal-account billing bypass, shared by the two Stripe edge functions
 * (create-checkout-session, create-portal-session). Mirrors
 * src/lib/billing/adminAccess.ts, which stays a separate copy on purpose —
 * Deno edge functions can't import from src/, so that boundary is a real
 * constraint, not an oversight. This file exists so the two functions that
 * *can* share code don't hand-copy it against each other instead.
 */
const ADMIN_EMAILS = ['martin.constantineau@dutiva.ca']

export function bypassesPaywall(email: string | null | undefined): boolean {
  const normalized = String(email ?? '')
    .trim()
    .toLowerCase()
  return ADMIN_EMAILS.includes(normalized) || normalized.endsWith('@dutiva.ca')
}
