/**
 * Internal-account billing bypass — ported from the production dutiva-website
 * repo's `src/lib/enterpriseAccess.ts`, which gates its Stripe paywall the
 * same way. Kept as a small standalone module because it answers a
 * different question than workspace sign-in access (AuthContext's
 * `authorized`, backed by the `current_user_is_workspace_member` Postgres
 * function): "does this account skip billing" vs. "may this account sign
 * into the workspace at all". These have genuinely different criteria —
 * bypassing billing is @dutiva.ca staff only; signing in is the admin
 * account or anyone on the beta list — so they're independent enforcement
 * points and shouldn't be conflated.
 */
const ADMIN_EMAILS = ['martin.constantineau@dutiva.ca']

function normalizeEmail(email?: string | null): string {
  return String(email ?? '')
    .trim()
    .toLowerCase()
}

/** Explicitly listed internal accounts — always treated as fully entitled. */
export function isAdminEmail(email?: string | null): boolean {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}

/**
 * Any @dutiva.ca staff account. Prefer this over the explicit list when
 * checking "is this internal Dutiva staff" in new code — the explicit list
 * exists for the one account that must bypass billing even if the domain
 * check were ever narrowed.
 */
export function isInternalDutivaAccount(email?: string | null): boolean {
  return normalizeEmail(email).endsWith('@dutiva.ca')
}

/** True if this account should skip the paywall entirely. */
export function bypassesPaywall(email?: string | null): boolean {
  return isAdminEmail(email) || isInternalDutivaAccount(email)
}
