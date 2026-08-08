# HTTP security headers

Set in `vercel.json` on every route (`/:path*`), added 2026-08-08 after the
security audit found none present. Two postures: an **enforcing** set that
is zero-risk, and a **Content-Security-Policy in Report-Only** so the
resource policy can be verified against the live app before it can block
anything.

## Enforcing now

| Header | Value | Closes |
| --- | --- | --- |
| `X-Frame-Options` | `DENY` | Clickjacking — nothing legitimately frames `dutiva.ca` or the `/app` workspace. |
| `Content-Security-Policy` | `frame-ancestors 'none'; object-src 'none'; base-uri 'self'` | Modern-browser clickjacking + `<object>`/`<embed>` + `<base>` hijack. Only the safe directives are enforced; resource directives live in the Report-Only policy below. |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing on user-influenced blobs. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Path/query leakage to third parties. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | SSL-strip / downgrade. (No `preload` yet — that commits every subdomain to HTTPS permanently; add it and submit to hstspreload.org when ready.) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Powerful features the app never uses; opts out of Topics. |

## Report-Only, pending promotion

`Content-Security-Policy-Report-Only` carries the full resource policy. In
Report-Only it **never blocks** — browsers only log violations to the
console — so it is safe to ship un-verified. The allowed origins:

- **self** — the app's own bundle and API calls.
- **Supabase** `khtwpxnvziiyplaflwru.supabase.co` (+ `wss:` for realtime) — REST, auth, edge functions.
- **Google Fonts** — `fonts.googleapis.com` (stylesheet), `fonts.gstatic.com` (fonts).
- **GA4** — `googletagmanager.com`, `google-analytics.com`, `region1.google-analytics.com` (consent-gated).
- **CAPTCHA** — Turnstile (`challenges.cloudflare.com`) and hCaptcha (`js.hcaptcha.com`, `newassets.hcaptcha.com`, `api.hcaptcha.com`).

`script-src` and `style-src` currently include `'unsafe-inline'` because the
app ships inline bootstrap scripts (the fragment-forwarder in `index.html`)
and React inline style attributes.

### To promote to enforcing

1. Deploy, then do a full signed-in click-through (marketing pages, sign-in,
   Advisor, Document Studio, support, a Stripe checkout redirect) with the
   console open. Note every CSP violation.
2. Add any legitimately-missing origin to the corresponding directive.
3. To drop `'unsafe-inline'` from `script-src` (the real hardening win),
   replace the inline `index.html` scripts with hashed or external ones, or
   move to nonces — then remove `'unsafe-inline'` and re-test.
4. Rename the header key `Content-Security-Policy-Report-Only` →
   `Content-Security-Policy` (merging its directives into the enforcing
   policy). Keep `frame-ancestors`/`object-src`/`base-uri` as they are.

Until step 4, the resource policy is observed, not enforced — the enforcing
table above is what actively protects the app.
