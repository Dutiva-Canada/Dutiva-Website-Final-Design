# Magic-link sign-in — how it works and how to configure Supabase

The `/app` workspace is invite-only and signs in with a Supabase **magic link**
(passwordless email OTP). There is no password path. The single allowed account
is defined in `src/features/app/auth/allowedEmail.ts`.

## The intended flow

1. On `/app/welcome`, the user enters their email. `AuthProvider.signInWithEmail`
   calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo:
   \`${window.location.origin}/app/auth/confirm\` } })`.
2. Supabase emails a link. The user clicks it and lands on
   **`/app/auth/confirm`** with a one-time `token_hash` in the query string.
3. `AuthConfirm` (`src/features/app/auth/AuthConfirm.tsx`) calls
   `verifyOtp({ token_hash, type })` **in the browser**, which mints the
   session and navigates to `/app/home`.

Verifying in the browser (rather than via Supabase's default
`/auth/v1/verify` GET link) is deliberate: email-provider link scanners
(Gmail/Outlook) prefetch URLs, and a GET verify link spends its one-time token
the moment a scanner touches it — the classic *"Email link is invalid or has
expired."* A `token_hash` + `verifyOtp` link is only spent when JavaScript runs,
which scanners don't do. It also needs no PKCE code-verifier, so a link opened
on a different device than it was requested from still works.

## Required Supabase dashboard configuration

The code above only works if the Supabase project is configured to match.
These live in **Authentication** in the Supabase dashboard, **not** in this
repo, so they must be set once per project. If they drift, the magic link
silently misbehaves (see Symptoms below).

### 1. URL Configuration → Redirect URLs (allow-list)

`emailRedirectTo` is only honored if the URL is on the allow-list. **If it is
not, Supabase silently falls back to the Site URL** — which is why a click can
dump the user on the marketing home page, still signed out. Add every origin
the app is served from, with the confirm path:

```
https://dutiva.ca/app/auth/confirm
http://localhost:5173/app/auth/confirm        # local dev (vite)
https://*.vercel.app/app/auth/confirm         # preview deployments
```

### 2. URL Configuration → Site URL

```
https://dutiva.ca
```

This is the fallback target and should be the canonical apex origin (the app
already 301s `www.dutiva.ca` → `dutiva.ca` in `vercel.json`).

### 3. Email Templates → Magic Link

Change the template body so the link points at the confirm route with a
`token_hash`, instead of the default `{{ .ConfirmationURL }}`:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink">
  Sign in to Dutiva
</a>
```

`{{ .RedirectTo }}` resolves to the `emailRedirectTo` we pass
(`…/app/auth/confirm`). Using `{{ .ConfirmationURL }}` instead keeps the
scanner-prefetch failure mode described above.

## Client-side safety net

Even with the config correct, a redirect can still land on the site root (an
older email, an implicit-flow fragment, a not-yet-allow-listed preview origin).
An inline script in `index.html` catches any auth artifact
(`token_hash` / `access_token` / `error…`) that lands on a non-`/app` URL and
forwards it — query and fragment intact — to `/app/auth/confirm`. This makes the
link resilient, but it is a net, not a substitute for the config above (it can't
stop a scanner from burning a `{{ .ConfirmationURL }}` token before the click).

## Symptoms → cause

| What the user sees | Most likely cause |
| --- | --- |
| Click lands on `dutiva.ca` home page, still signed out | Confirm URL missing from **Redirect URLs**, so Supabase used the **Site URL**. Fix §1 (the safety net now also forwards these). |
| "Email link is invalid or has expired" without clicking, or on first click | Template still uses `{{ .ConfirmationURL }}`; a scanner burned the token. Fix §3. |
| No email arrives | Email not the allowed account (`allowedEmail.ts`), or SMTP/rate limits in Supabase Auth. |
| Confirm page shows "couldn't confirm" | Token genuinely expired/reused, or `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` not set in the deployment. |

## Environment variables

The browser client (`src/lib/supabaseClient.ts`) needs, at build time:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_…
```

Without them, `supabase` is `null`, sign-in is disabled, and auth-gated features
degrade to their signed-out state.
