# Support Analytics

> **D2 — decided 2026-08-06.** Full support funnel, workspace-scoped (not
> user-scoped), 90-day raw retention with forever aggregates, first-party
> Supabase sink pinned to ca-central-1. GA4 plumbing is built but inert
> pending a consent banner (needs a design handoff).

## 1. What this is

Support analytics measures the full support funnel: Help Centre searches,
article views, helpfulness votes, ticket submissions, and ticket status
changes. The privacy model was decided before any code was written —
TODO.md D2 explicitly deferred this work to the owner because "collecting
customer-behaviour data shouldn't be designed speculatively."

### Decisions

| Question | Decision | Rationale |
| --- | --- | --- |
| Scope | Full support funnel | Help Centre + deflection + ticket outcomes. The seam (`recordHelpfulness`) was already there; extending it to the full funnel is marginal work once the sink exists. |
| Identification | Workspace-scoped | Anonymous Help Centre events carry a daily-rotated opaque visitor id. Authenticated ticket events carry `workspace_id` (the organization), never `user_id`. Lets you say "Northgate searched X 12 times" without naming the person. |
| Retention | 90 days raw, forever aggregate | Raw rows kept 90 days for debugging, then auto-deleted by the daily rollup job. Daily aggregates kept indefinitely — they no longer identify an individual in a reasonably foreseeable way (per the Data Retention Policy § Anonymization). |
| Sink | Both (phased) | Supabase edge function for product/deflection events that need joining to tickets (first-party, ca-central-1, no third-party cookies). GA4 for marketing-side page analytics — plumbing is built, but inert until a consent banner ships (needs a design handoff). |

## 2. Privacy model

### What is collected

| Event type | Fields | Identification |
| --- | --- | --- |
| `helpfulness_vote` | `article_slug`, `vote_value` ('yes'/'no') | Anonymous (daily visitor id) |
| `help_search` | `search_query` (max 200 chars), `search_result_count` | Anonymous (daily visitor id) |
| `help_article_view` | `article_slug` | Anonymous (daily visitor id) |
| `ticket_submitted` | `ticket_reference`, `ticket_category`, `ticket_source` | Workspace-scoped (`workspace_id`) |
| `ticket_status_changed` | `ticket_reference`, `ticket_category`, `ticket_source` (new status) | Workspace-scoped (`workspace_id`) |

All events also carry `locale` ('en' or 'fr') and `occurred_at`.

### What is NOT collected

- **No user ids.** Ever. The `anonymous_visitor_id` is a daily-rotated random
  UUID in localStorage — it can't be joined to an account.
- **No ticket body text.** We store the `public_reference` (e.g. `SUP-00042`),
  not the ticket uuid — so analytics can't be joined back to the ticket body
  without already having admin DB access.
- **No document contents, chat transcripts, employee records, or HR case
  details.** The Cookie Policy already commits to this; the schema enforces
  it by not having fields for it.
- **No IP addresses.** The edge function doesn't log or store them.
- **No third-party cookies** (for the Supabase sink). GA4 is separate and
  gated on consent.

### Legal basis

The first-party support analytics sink is covered by the existing Privacy
Policy ("measure aggregate feature usage, troubleshoot errors, prevent
abuse, enforce rate limits, and monitor service performance") and the
Terms of Service. It does not require a consent banner because it is
first-party (no third-party cookies), data stays in Canada (ca-central-1),
and the collection is within the legitimate purpose of operating and
improving the service. The Privacy Policy, Cookie Policy, and Data
Retention Policy have been updated to concretely describe what is now
collected.

GA4 is a different matter — it's a third-party subprocessor that sets
cookies, so it requires consent under Quebec Law 25. The consent banner
does not exist yet; until it ships, GA4 is inert.

## 3. Architecture

```
Client (browser)
  ├─ trackEvent() ──→ queue (max 10 events or 2s debounce)
  │                     │
  │                     ↓ pagehide / threshold
  │                  fetch(keepalive) → support-analytics-event edge function
  │                                          │ (ca-central-1, service-key insert)
  │                                          ↓
  │                                  support_analytics_events (raw, 90-day)
  │                                          │
  │                                          ↓ daily rollup (01:00 UTC, pg_cron)
  │                                  support_analytics_daily (aggregate, forever)
  │
  └─ loadGa4() ──→ gated on VITE_GA_MEASUREMENT_ID + hasAnalyticsConsent()
                     (inert until consent banner ships)
```

### Components

- **Migration `0047`**: `support_analytics_events` (raw), `support_analytics_daily`
  (aggregate), `support_analytics_rollup()` (daily rollup + retention),
  `support_analytics_status()` (operational visibility), pg_cron schedule.
- **`_shared/supportAnalytics.ts`**: Pure event validation — `parseEvent()`
  validates and normalizes an incoming event payload. Same discipline as
  `scheduledCalls.ts` and `lawUpdateDigest.ts` (no I/O, callers pass `now`).
- **`support-analytics-event` edge function**: Receives a batch of events,
  validates each with `parseEvent()`, inserts valid ones into
  `support_analytics_events`. Pinned to ca-central-1 via
  `forceFunctionRegion`. Inert without `SUPABASE_SERVICE_ROLE_KEY`.
- **`src/features/support/analytics/supportAnalytics.ts`**: Client module —
  `trackEvent()` queues events, `flush()` sends them as a batch via
  `fetch(keepalive)`, `installAnalyticsFlush()` registers a `pagehide`
  flush. Same inert-unless-configured discipline as `errorReporting`:
  inactive in dev, tests, and when `VITE_SUPABASE_URL` is unset.
- **`src/features/support/analytics/visitorId.ts`**: Daily-rotated opaque
  visitor id in localStorage. Same storage-availability guard as
  `helpFeedback.ts`.
- **`src/features/marketing/analytics/consent.ts`**: Consent state for GA4.
  `hasAnalyticsConsent()` returns `false` until the (future) consent banner
  sets it.
- **`src/features/marketing/analytics/ga4.ts`**: GA4 loader. Gated on both
  `VITE_GA_MEASUREMENT_ID` and `hasAnalyticsConsent()`. Inert until both
  pass.

### Wiring points

| Event | Wired at | Trigger |
| --- | --- | --- |
| `helpfulness_vote` | `HelpfulnessWidget.tsx` | Vote button click |
| `help_search` | `HelpCenterPage.tsx` | Debounced (1s) after search input changes |
| `help_article_view` | `HelpArticlePage.tsx` | `useEffect` on article slug |
| `ticket_submitted` (app) | `SupportRequestForm.tsx` | After successful `createSupportTicket` |
| `ticket_submitted` (public) | `PublicSupportForm.tsx` | After successful `createPublicSupportTicket` |
| `ticket_status_changed` | `SupportAdminTicket.tsx` | After successful admin status change |

## 4. Querying the data

### Raw events (last 90 days)

```sql
-- Helpfulness votes by article, last 30 days
select article_slug, vote_value, count(*)
from public.support_analytics_events
where event_type = 'helpfulness_vote'
  and occurred_at > now() - interval '30 days'
group by article_slug, vote_value
order by article_slug;

-- Top search queries with zero results (content gap signal)
select search_query, count(*) as searches, search_result_count
from public.support_analytics_events
where event_type = 'help_search'
  and search_result_count = 0
  and occurred_at > now() - interval '30 days'
group by search_query, search_result_count
order by searches desc
limit 20;

-- Ticket submission rate by category and source
select ticket_category, ticket_source, count(*)
from public.support_analytics_events
where event_type = 'ticket_submitted'
  and occurred_at > now() - interval '30 days'
group by ticket_category, ticket_source
order by count(*) desc;
```

### Daily aggregates (forever)

```sql
-- Daily helpfulness trend
select day, sum(helpfulness_yes) as yes_votes, sum(helpfulness_no) as no_votes
from public.support_analytics_daily
where event_type = 'helpfulness_vote'
group by day
order by day desc
limit 30;

-- Deflection signal: searches vs ticket submissions over time
select day,
  sum(event_count) filter (where event_type = 'help_search') as searches,
  sum(event_count) filter (where event_type = 'ticket_submitted') as tickets
from public.support_analytics_daily
group by day
order by day desc
limit 30;
```

### Operational status

```sql
select * from public.support_analytics_status();
```

## 5. Owner deployment steps

The migration is applied and the edge function is committed. What's left:

1. **Deploy the `support-analytics-event` edge function.** Merging the PR
   does not deploy it (AGENTS.md's two-halves rule). Deploy via the Supabase
   dashboard or CLI.

2. **No Vault secret needed.** Unlike the law-update digest and call
   scheduler, this edge function is invoked directly by the client (not via
   pg_cron), so it uses the standard Supabase service role key that's
   already configured as `SUPABASE_SERVICE_ROLE_KEY` in the edge function
   environment.

3. **Verify after deploy.** Open a Help Centre article in production, vote,
   and check:
   ```sql
   select * from public.support_analytics_events order by occurred_at desc limit 5;
   ```

4. **GA4 (optional, separate step).** Set `VITE_GA_MEASUREMENT_ID` at build
   time AND ship the consent banner (needs a design handoff). Without the
   banner, GA4 stays inert even with a measurement ID configured — the
   consent gate is structural, not optional.

## 6. What this does NOT do

- **No consent banner.** The first-party Supabase sink doesn't need one
  (first-party, no third-party cookies, covered by existing Terms). GA4
  does, and the banner is a separate deliverable that needs a design
  handoff per AGENTS.md.
- **No analytics dashboard.** The data is queryable via SQL (§4). An admin
  dashboard is a separate product decision — the data model supports it,
  but building one speculatively would repeat the mistake D2 was created to
  prevent.
- **No deflection attribution.** The events are recorded (search → article
  view → no ticket), but attributing "this search deflected a ticket" is
  an analytical query on the data, not a feature to build — the data is
  there, the interpretation is an operator task.
- **No real-time streaming.** Events are batched (max 10 or 2s debounce)
  and flushed on page unload. This is sufficient for aggregate analytics;
  real-time monitoring is a different concern (and the error reporting
  sink already covers crash monitoring).
