/**
 * The accounts allowed to sign in and reach the workspace. Not a general
 * @dutiva.ca team allowlist — the app used to admit any team email; now it's
 * invite-only for specific people until there's a real admin-managed invite
 * flow. Mirrored server-side in supabase/migrations (guidance/law-updates
 * RLS) and supabase/functions/advisor-chat — all three checks must stay in
 * sync since each is an independent enforcement point.
 *
 * martin.constantineau05@gmail.com is a TEMPORARY addition for Stripe
 * checkout verification (non-@dutiva.ca, so it doesn't hit the paywall
 * bypass) — remove it once that test is done.
 */
export const ALLOWED_SIGN_IN_EMAILS = [
  'martin.constantineau@dutiva.ca',
  'martin.constantineau05@gmail.com',
]

export function isAllowedSignInEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return ALLOWED_SIGN_IN_EMAILS.includes(normalized)
}
