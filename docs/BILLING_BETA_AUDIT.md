# Stripe billing & beta-signup audit

**Date:** 2026-07-27
**Scope:** the paid-signup path (`/pricing` → Stripe Checkout → entitlement) and
the beta waiting-list path (landing `#start` form).
**Method:** repo source review, plus the live Supabase project
(`khtwpxnvziiyplaflwru`) and the live Vercel project (`dutiva-website`, which
deploys `main` of this repo to `dutiva.ca`). Every claim below is grounded in
one of those two, and the evidence is named inline.

## Verdict

**Neither path works today.** A customer cannot complete a payment, and a beta
signup is discarded by the browser rather than recorded.

The *code* in this repo is largely sound — signature verification, RLS, and the
plan-resolution hardening are genuinely well built. The failures are all at the
seams: code that was never deployed, a schema that was never migrated, and a
form that was never wired to the backend that already exists for it.

Supporting evidence that this is not theoretical:

| Live check | Result |
| --- | --- |
| `select count(*) from auth.users` | **1** (the internal account) |
| `select count(*) from public.beta_signups` | **0** |
| `create-checkout-session` in deployed Edge Functions | **absent** |
| `create-portal-session` in deployed Edge Functions | **absent** |
| `to_regclass('public.stripe_webhook_events')` | **null** |

---

## Blockers — payment cannot complete

### B1. The checkout Edge Functions are not deployed

`PricingPage.handleCheckout` calls
`supabase.functions.invoke('create-checkout-session')`
(`src/features/marketing/pages/PricingPage.tsx:312`), and "Manage billing" calls
`create-portal-session` (`:342`). Neither function exists in the Supabase
project — the deployed list contains `stripe-webhook`, `advisor-chat`, the
support functions and others, but not these two.

Every checkout attempt therefore resolves to a `FunctionsHttpError`, is caught
at `:327`, and the customer sees *"Could not start checkout. Please try again or
contact support@dutiva.ca."* There is no way to reach Stripe from the site.

Fix: `supabase functions deploy create-checkout-session create-portal-session`,
then set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_{STARTER,GROWTH,PRO}_MONTHLY` and
`SITE_URL` as function secrets. Both need JWT verification **on** (they
authenticate the caller themselves); `stripe-webhook` must stay **off**, which
it currently is.

### B2. Nobody but one internal address can create an account

`src/features/app/auth/allowedEmail.ts` hard-codes a single address, and
`AuthProvider.signInWithEmail` refuses to even send a magic link to anything
else (`AuthProvider.tsx:49`). `RequireAdminSession` then bounces every other
session away from `/app` (`RequireAdminSession.tsx:42`).

Because `handleCheckout` sends any signed-out visitor to `/app/welcome`
(`PricingPage.tsx:288`), the funnel is closed at its first step: a prospect
clicks *Start Growth*, lands on the sign-in gate, enters their address, and is
told the workspace is restricted. `auth.users` holding exactly one row is that
outcome measured rather than inferred.

This is a deliberate invite-only posture, so the fix is a product decision, not
a bug fix — but as long as it stands, the pricing page is selling something no
visitor can buy.

### B3. The "Pro" plan cannot be provisioned at all

The site sells Pro at $99/mo (`src/config/plans.ts:59`). Production disagrees in
two independent places:

- `profiles_plan_check` in the live database allows
  `free | starter | growth | advanced | enterprise`. **`pro` is not a legal
  value.** Repo migration `0013_add_billing_profiles.sql` defines the correct
  set, but it was never applied to this project (`stripe_webhook_events`,
  created by the same migration, doesn't exist either).
- The **deployed** `stripe-webhook` still carries the older plan vocabulary
  (`starter | growth | advanced | enterprise`) and knows nothing of
  `STRIPE_PRICE_PRO_MONTHLY`.

So a completed Pro checkout resolves to `growth` in the deployed webhook and
writes a Growth entitlement — the customer pays $99 and receives the $49 tier.
Had the repo's newer webhook been deployed instead, the write would attempt
`plan: 'pro'`, be rejected by the check constraint, and — because the update's
error is never inspected (`stripe-webhook/index.ts:119`) — fail silently while
returning `{received: true}` to Stripe. Charged, no entitlement, no alert.

### B4. Beta signups are written to `localStorage` and nowhere else

`BetaSignup.tsx` validates the address, fakes a 700 ms "sending" delay, pushes
the email into `localStorage['dutiva-beta-signups']`, and renders the success
card (`BetaSignup.tsx:69-77`). No network call is made. The visitor is told
they're on the list; nobody at Dutiva ever learns they exist. The "you're
already signed up" branch (`:63`) only knows about that one browser.

What makes this the most fixable item on the list: **the backend already
exists and is deployed.** `create-beta-signup` is live (`verify_jwt: false`,
public by design) and is more careful than the form it's waiting for — honeypot
field, per-IP and per-email rate limits over `beta_signup_intake` storing only
salted hashes, strict validation, a unique index on `lower(email)` whose
violation is deliberately reported as success so the endpoint can't be used to
test list membership, and rows queued into `support_notifications` for both an
operator alert and a bilingual confirmation to the signer. `public.beta_signups`
is there too, with `email / company / province / language / source` columns that
match the form's fields exactly.

Two notes for whoever wires it:

- The function **requires `consent === true`** and returns 422 otherwise. The
  current form has only a passive privacy sentence (`:188`), so a real consent
  checkbox has to be added — that is the CASL express-consent record, not a
  formality.
- Send `source: 'landing'` and the active `language`, and include the
  `contact_fax` honeypot input the function expects.

---

## Significant issues

### S1. The deployed webhook is not the code in this repo

Deployed `stripe-webhook` is version 8 (~2026-06-08) and is the older
implementation from the predecessor repo. Improvements sitting unshipped in
`main`:

- **Plan defaulting.** Deployed code falls back to `plan: "growth"` when it
  recognizes neither the metadata nor the price — an unrecognized checkout
  silently grants a paid tier. The repo version defaults to `'free'`
  (`billing-event.ts:63`). Ship this.
- **Price over metadata.** Deployed code prefers `metadata.plan` over the
  actually-purchased price; the repo version reverses it so the price is
  authoritative. Not exploitable today (metadata is set server-side), but it is
  the difference between "safe" and "safe by construction".
- **Filter injection.** Deployed code interpolates the checkout email into a
  PostgREST `.or()` filter string. The repo version replaced it with a
  parameterized `.eq()` (`stripe-webhook/index.ts:60-63`) precisely to close
  this. Still live.

### S2. Webhook idempotency is inert in production

`stripe-webhook/index.ts:96` inserts into `public.stripe_webhook_events` to
de-duplicate deliveries. That table does not exist, so the insert errors, the
handler logs a warning and continues (`:104`), and every Stripe retry is
reprocessed. The writes are mostly idempotent so the blast radius is small
today, but the guard is providing no protection at all. Applying migration 0013
restores it.

### S3. `line_items` is never present on `checkout.session.completed`

`inferCheckoutPrice` reads `session.line_items` (`billing-event.ts:41`), which
Stripe does not include in webhook payloads — it requires an expansion that
webhooks don't perform. The lookup therefore always misses on the checkout path,
and the plan comes from metadata regardless of which version is deployed. The
price-authoritative design only actually takes effect on the
`customer.subscription.*` events, which do carry `items.data[0].price`.

To make the checkout path match its intent, retrieve the session with
`expand[]=line_items` before resolving the plan, or simply rely on the
subscription event and treat the checkout event as customer-linking only.

---

## Smaller findings

- **Annual billing is a dead end.** The toggle advertises "2 months free" and
  renders annual pricing, then refuses at click time with *"Annual billing is
  coming soon"* (`PricingPage.tsx:297`). A live pricing page quoting a price
  that cannot be purchased. Either wire the annual price IDs or drop the toggle
  until they exist.
- **Nothing handles the return from Stripe.** `success_url` is
  `/pricing?checkout=success&plan=…` (`create-checkout-session/index.ts:143`),
  but `PricingPage` never reads the `checkout` parameter. A customer who has
  just paid lands back on an unchanged pricing page with no confirmation — and,
  if the webhook hasn't landed yet, still shown as free.
- **`SITE_URL` defaults to a redirected host.** The default is
  `https://www.dutiva.ca`, which `vercel.json` 308-redirects to the apex domain.
  Query strings survive the hop, so it works, but every Stripe return takes an
  unnecessary redirect. Set `SITE_URL=https://dutiva.ca`.
- **Domain-wide paywall bypass.** `bypassesPaywall` grants full access to any
  `@dutiva.ca` address (`adminAccess.ts:35`), duplicated by hand into both Edge
  Functions. Correct while signup is closed; worth revisiting as an explicit
  allowlist when it opens, and the hand-sync of three copies is a standing drift
  risk.
- **`pricing_cta_signin_first` is defined but never rendered** — signed-out
  visitors are redirected instead of prompted.

---

## What is already right

Worth stating plainly, because it is the majority of the code:

- `verify-signature.ts` is a correct manual implementation of Stripe's scheme —
  HMAC-SHA-256 over `${timestamp}.${body}`, a length-aware constant-time
  compare, and a 300 s replay window. No third-party crypto dependency.
- `stripe-webhook` is deployed with `verify_jwt: false`, which is what lets
  Stripe reach it at all — an easy thing to get wrong.
- `profiles` has RLS enabled with a select-only policy scoped to `auth.uid()`;
  all billing writes go through the service role inside functions.
- The checkout function never trusts a client-supplied price: plans are
  allowlisted and mapped to server-side price-ID env vars.
- `create-beta-signup`'s anti-abuse design — hashed rate-limit keys, honeypot,
  and treating a duplicate as a success so the endpoint can't confirm list
  membership — is careful work.

---

## Suggested order of work

1. Wire `BetaSignup.tsx` to `create-beta-signup`, with a consent checkbox
   (B4) — the backend is already live, so this is the shortest path from
   "losing every lead" to "capturing them".
2. Apply migration `0013` to production, or reconcile it against the live
   schema (B3, S2). Decide whether the fourth tier is `pro` or `advanced` and
   make the plan catalogue, the constraint, and the webhook agree.
3. Deploy `stripe-webhook` from `main` (S1) and the two checkout functions
   (B1), with their secrets.
4. Decide the invite-only question (B2). Until it changes, consider hiding or
   relabelling the paid CTAs so the page doesn't promise a purchase it can't
   take.
5. Handle `?checkout=success` and either finish or withdraw annual billing.

Steps 2 and 3 must land together: deploying the newer webhook against the
current constraint converts B3 from a wrong-plan bug into a silent-failure bug.
