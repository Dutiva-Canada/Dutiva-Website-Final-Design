/**
 * The single account allowed to sign in and reach the workspace. Not a
 * general @dutiva.ca team allowlist — the app used to admit any team email;
 * now it's invite-only for one person until there's a real admin-managed
 * invite flow. Mirrored server-side in supabase/migrations (guidance/
 * law-updates RLS) and supabase/functions/advisor-chat — all three checks
 * must stay in sync since each is an independent enforcement point.
 */
export const ALLOWED_SIGN_IN_EMAIL = 'martin.constantineau@dutiva.ca'

export function isAllowedSignInEmail(email: string): boolean {
  return email.trim().toLowerCase() === ALLOWED_SIGN_IN_EMAIL
}
