import { useState } from 'react'
import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi, LText } from '@/i18n/core'
import { pickL } from '@/i18n/core'
import { useTheme } from '@/lib/themeContext'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { settingsMessages as M } from '@/i18n/messages/settings'

/**
 * Settings view — port of the prototype's largest static view
 * (`App v2.dc.html` markup 1267–1435, `buildSettingsView()` 3539–3622).
 *
 * Appearance/Language segments drive the real ThemeProvider / LangProvider;
 * preference toggles flip local state (prototype `settingsPrefs`); the
 * Calendar-sync integration starts in its error state and Retry clears it
 * with a toast, exactly like `retryIntegration()`.
 */

type PrefKey =
  'emailDigest' | 'riskAlerts' | 'autoEscalate' | 'weeklyDigest' | 'aiContext' | 'aiCitations'

/* Prototype initial state (line 2406). */
const initialPrefs: Record<PrefKey, boolean> = {
  emailDigest: true,
  riskAlerts: true,
  autoEscalate: false,
  weeklyDigest: true,
  aiContext: true,
  aiCitations: true,
}

interface ToggleSpec {
  key: PrefKey
  label: Bi
  sub: Bi
}

const notificationToggles: ToggleSpec[] = [
  {
    key: 'emailDigest',
    label: M.settings_toggle_email_digest,
    sub: M.settings_toggle_email_digest_sub,
  },
  {
    key: 'riskAlerts',
    label: M.settings_toggle_risk_alerts,
    sub: M.settings_toggle_risk_alerts_sub,
  },
  {
    key: 'autoEscalate',
    label: M.settings_toggle_auto_escalate,
    sub: M.settings_toggle_auto_escalate_sub,
  },
  {
    key: 'weeklyDigest',
    label: M.settings_toggle_weekly_digest,
    sub: M.settings_toggle_weekly_digest_sub,
  },
]

const aiToggles: ToggleSpec[] = [
  { key: 'aiContext', label: M.settings_toggle_ai_context, sub: M.settings_toggle_ai_context_sub },
  {
    key: 'aiCitations',
    label: M.settings_toggle_ai_citations,
    sub: M.settings_toggle_ai_citations_sub,
  },
]

const provinces: Bi[] = [
  M.settings_prov_ontario,
  M.settings_prov_bc,
  M.settings_prov_quebec,
  M.settings_prov_alberta,
  M.settings_prov_federal,
]

const team: { name: LText; role: Bi; initials: string }[] = [
  { name: 'Riley Summers', role: M.settings_role_owner, initials: 'RS' },
  { name: 'Fatima Haddad', role: M.settings_role_hr, initials: 'FH' },
  { name: 'Dana Okonkwo', role: M.settings_role_manager, initials: 'DO' },
  { name: 'Marcus Bell', role: M.settings_role_finance, initials: 'MB' },
  { name: M.settings_team_counsel_name, role: M.settings_team_counsel_role, initials: 'PC' },
  { name: M.settings_team_pending_name, role: M.settings_team_pending_role, initials: '…' },
]

/* Roles & permissions matrix (buildSettingsView `roles`). */
const F = M.settings_perm_full
const V = M.settings_perm_view
const N = M.settings_perm_none
const T = M.settings_perm_team
const AS = M.settings_perm_assigned
const roleRows: { role: Bi; a: Bi; b: Bi; c: Bi; d: Bi }[] = [
  { role: M.settings_role_owner, a: F, b: F, c: F, d: F },
  { role: M.settings_role_hr, a: F, b: F, c: F, d: F },
  { role: M.settings_role_manager, a: T, b: N, c: N, d: T },
  { role: M.settings_role_finance, a: V, b: F, c: N, d: N },
  { role: M.settings_role_legal, a: V, b: N, c: AS, d: N },
  { role: M.settings_role_viewer, a: V, b: N, c: N, d: N },
]

const retentionRows: { t: Bi; v: Bi }[] = [
  { t: M.settings_retention_employment, v: M.settings_retention_employment_v },
  { t: M.settings_retention_cases, v: M.settings_retention_cases_v },
  { t: M.settings_retention_accommodation, v: M.settings_retention_accommodation_v },
  { t: M.settings_retention_advisor, v: M.settings_retention_advisor_v },
]

const securityRows: { t: Bi; v: Bi }[] = [
  { t: M.settings_security_2fa, v: M.settings_security_2fa_v },
  { t: M.settings_security_sso, v: M.settings_security_sso_v },
  { t: M.settings_security_timeout, v: M.settings_security_timeout_v },
  { t: M.settings_security_residency, v: M.settings_security_residency_v },
]

type ChipTone = 'risk' | 'warning' | 'success' | 'info'

/* Prototype `statusChipStyle(tone)`. */
const chipToneClass: Record<ChipTone, string> = {
  risk: 'bg-risk-bg text-risk-fg',
  warning: 'bg-warn-bg text-warn-fg',
  success: 'bg-ok-bg text-ok-fg',
  info: 'bg-accent-soft text-accent',
}

function StatusChip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-[100px] px-[10px] py-[3px] text-[12px] font-semibold whitespace-nowrap ${chipToneClass[tone]}`}
    >
      {children}
    </span>
  )
}

const auditEvents: { kind: Bi; tone: ChipTone; text: Bi; when: Bi }[] = [
  {
    kind: M.settings_audit_kind_restricted,
    tone: 'warning',
    text: M.settings_audit_ev1_text,
    when: M.settings_audit_ev1_when,
  },
  {
    kind: M.settings_audit_kind_document,
    tone: 'info',
    text: M.settings_audit_ev2_text,
    when: M.settings_audit_ev2_when,
  },
  {
    kind: M.settings_audit_kind_export,
    tone: 'info',
    text: M.settings_audit_ev3_text,
    when: M.settings_audit_ev3_when,
  },
  {
    kind: M.settings_audit_kind_legal,
    tone: 'warning',
    text: M.settings_audit_ev4_text,
    when: M.settings_audit_ev4_when,
  },
  {
    kind: M.settings_audit_kind_case,
    tone: 'info',
    text: M.settings_audit_ev5_text,
    when: M.settings_audit_ev5_when,
  },
  {
    kind: M.settings_audit_kind_comp,
    tone: 'warning',
    text: M.settings_audit_ev6_text,
    when: M.settings_audit_ev6_when,
  },
  {
    kind: M.settings_audit_kind_permissions,
    tone: 'risk',
    text: M.settings_audit_ev7_text,
    when: M.settings_audit_ev7_when,
  },
  {
    kind: M.settings_audit_kind_retention,
    tone: 'risk',
    text: M.settings_audit_ev8_text,
    when: M.settings_audit_ev8_when,
  },
]

/* Section eyebrow + content (markup: 13px/700 text-3 label, 10px below). */
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-[10px] text-[13px] font-bold text-text-3">{label}</div>
      {children}
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[12px] border border-border bg-surface ${className}`}>
      {children}
    </div>
  )
}

/* Prototype seg() — segmented control button (line 4908). */
function segClass(on: boolean): string {
  return `cursor-pointer rounded-[6px] border-none px-[11px] py-[5px] font-sans text-[12px] font-semibold transition-colors duration-150 ${
    on ? 'bg-surface text-text' : 'bg-transparent text-text-muted'
  }`
}

/* Prototype buildToggleStyle / buildToggleKnobStyle (lines 3533–3538). */
function ToggleSwitch({
  on,
  label,
  onToggle,
}: {
  on: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-[100px] border-none transition-colors duration-150 ${
        on ? 'bg-navy' : 'bg-border'
      }`}
    >
      <div
        className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[left] duration-150 ${
          on ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}

function ToggleRow({
  spec,
  on,
  onToggle,
}: {
  spec: ToggleSpec
  on: boolean
  onToggle: () => void
}) {
  const { x } = useI18n()
  return (
    <div className="flex items-center justify-between gap-[14px] border-t border-inset px-[18px] py-[14px]">
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-text">{x(spec.label)}</div>
        <div className="mt-[2px] text-[12px] text-text-muted">{x(spec.sub)}</div>
      </div>
      <ToggleSwitch on={on} label={x(spec.label)} onToggle={onToggle} />
    </div>
  )
}

export function SettingsView() {
  const { x, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToasts()

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(initialPrefs)
  const [integrationError, setIntegrationError] = useState(true)

  const toggleSetting = (key: PrefKey) => {
    setPrefs((s) => ({ ...s, [key]: !s[key] }))
  }

  const retryIntegration = () => {
    setIntegrationError(false)
    showToast(M.settings_toast_reconnected, 'ok')
  }

  const integrations: { t: Bi; status: Bi; tone: ChipTone; error: boolean }[] = [
    { t: M.settings_int_esign, status: M.settings_int_connected_f, tone: 'success', error: false },
    {
      t: M.settings_int_payroll,
      status: M.settings_int_connected_m,
      tone: 'success',
      error: false,
    },
    {
      t: M.settings_int_calendar,
      status: integrationError ? M.settings_int_error : M.settings_int_connected_f,
      tone: integrationError ? 'risk' : 'success',
      error: integrationError,
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto flex max-w-[700px] flex-col gap-[26px]">
        {/* Appearance + Language */}
        <div className="flex flex-wrap gap-[16px]">
          <div className="min-w-[220px] flex-1">
            <div className="mb-[10px] text-[13px] font-bold text-text-3">
              {x(M.settings_appearance)}
            </div>
            <div className="flex gap-[6px] rounded-[12px] border border-border bg-surface px-[16px] py-[14px]">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={segClass(theme !== 'dark')}
              >
                {x(M.settings_theme_light)}
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={segClass(theme === 'dark')}
              >
                {x(M.settings_theme_dark)}
              </button>
            </div>
          </div>
          <div className="min-w-[220px] flex-1">
            <div className="mb-[10px] text-[13px] font-bold text-text-3">
              {x(M.settings_language)}
            </div>
            <div className="flex gap-[6px] rounded-[12px] border border-border bg-surface px-[16px] py-[14px]">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={segClass(lang === 'en')}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={segClass(lang === 'fr')}
              >
                Français
              </button>
            </div>
          </div>
        </div>

        {/* Data & privacy — Law 25 note */}
        <Section label={x(M.settings_privacy)}>
          <div className="flex items-start gap-[10px] rounded-[12px] border border-(--accent-soft-border) bg-accent-soft px-[16px] py-[14px]">
            <ShieldCheck
              size={18}
              strokeWidth={1.7}
              className="mt-[1px] shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="text-[13px] leading-[1.55] text-text-2">
              {x(M.settings_privacy_note)}
            </span>
          </div>
        </Section>

        {/* Workspace */}
        <Section label={x(M.settings_workspace)}>
          <div className="flex flex-col gap-[12px] rounded-[12px] border border-border bg-surface px-[20px] py-[18px]">
            <div>
              <span className="text-[12px] text-text-muted">{x(M.settings_company)}</span>
              <div className="text-[14px] font-semibold text-text">Northgate Logistics Inc.</div>
            </div>
            <div>
              <span className="text-[12px] text-text-muted">{x(M.settings_provinces_of_op)}</span>
              <div className="mt-[6px] flex flex-wrap gap-[6px]">
                {provinces.map((prov, i) => (
                  <span
                    key={i}
                    className="rounded-[100px] bg-inset px-[11px] py-[4px] text-[12.5px] font-semibold text-text-2"
                  >
                    {x(prov)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[12px] text-text-muted">{x(M.settings_locations)}</span>
              <div className="mt-[2px] text-[13.5px] font-semibold text-text">
                {x(M.settings_locations_value)}
              </div>
            </div>
          </div>
        </Section>

        {/* Users & team */}
        <Section label={x(M.settings_team)}>
          <Card>
            {team.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-[12px] border-t border-inset px-[18px] py-[13px]"
              >
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
                  {m.initials}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-text">{pickL(m.name, lang)}</div>
                  <div className="text-[12px] text-text-muted">{x(m.role)}</div>
                </div>
              </div>
            ))}
          </Card>
        </Section>

        {/* Notifications */}
        <Section label={x(M.settings_notifications)}>
          <Card>
            {notificationToggles.map((spec) => (
              <ToggleRow
                key={spec.key}
                spec={spec}
                on={prefs[spec.key]}
                onToggle={() => toggleSetting(spec.key)}
              />
            ))}
          </Card>
        </Section>

        {/* AI & Advisor */}
        <Section label={x(M.settings_ai)}>
          <Card>
            {aiToggles.map((spec) => (
              <ToggleRow
                key={spec.key}
                spec={spec}
                on={prefs[spec.key]}
                onToggle={() => toggleSetting(spec.key)}
              />
            ))}
            <div className="border-t border-inset px-[18px] py-[14px]">
              <div className="mb-[6px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
                {x(M.settings_disclaimer_label)}
              </div>
              <div className="text-[12.5px] leading-[1.55] text-text-2">
                {x(M.settings_disclaimer_full)}
              </div>
              <div className="mt-[6px] text-[11.5px] text-text-faint">
                {x(M.settings_disclaimer_note)}
              </div>
            </div>
          </Card>
        </Section>

        {/* Roles & permissions */}
        <Section label={x(M.settings_roles)}>
          <Card>
            <div className="overflow-x-auto">
              <div className="min-w-[540px]">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr_1fr] gap-[8px] bg-inset px-[18px] py-[10px] text-[10.5px] font-bold tracking-[0.03em] text-text-muted uppercase">
                  <div>{x(M.settings_col_role)}</div>
                  <div>{x(M.settings_col_records)}</div>
                  <div>{x(M.settings_col_comp)}</div>
                  <div>{x(M.settings_col_cases)}</div>
                  <div>{x(M.settings_col_signals)}</div>
                </div>
                {roleRows.map((ro, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr_1fr] items-center gap-[8px] border-t border-inset px-[18px] py-[11px] text-[12.5px]"
                  >
                    <div className="font-semibold text-text">{x(ro.role)}</div>
                    <div className="text-text-2">{x(ro.a)}</div>
                    <div className="text-text-2">{x(ro.b)}</div>
                    <div className="text-text-2">{x(ro.c)}</div>
                    <div className="text-text-2">{x(ro.d)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-inset px-[18px] py-[10px] text-[11px] text-text-faint">
              {x(M.settings_roles_note)}
            </div>
          </Card>
        </Section>

        {/* Data retention */}
        <Section label={x(M.settings_retention)}>
          <Card>
            {retentionRows.map((rt, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-[14px] border-t border-inset px-[18px] py-[12px]"
              >
                <div className="text-[13px] font-semibold text-text">{x(rt.t)}</div>
                <div className="text-right text-[12.5px] text-text-2">{x(rt.v)}</div>
              </div>
            ))}
            <div className="border-t border-inset px-[18px] py-[10px] text-[11px] text-text-faint">
              {x(M.settings_retention_note)}
            </div>
          </Card>
        </Section>

        {/* Security */}
        <Section label={x(M.settings_security)}>
          <Card>
            {securityRows.map((sec, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-[14px] border-t border-inset px-[18px] py-[12px]"
              >
                <div className="text-[13px] font-semibold text-text">{x(sec.t)}</div>
                <div className="text-right text-[12.5px] text-text-2">{x(sec.v)}</div>
              </div>
            ))}
          </Card>
        </Section>

        {/* Integrations & billing */}
        <Section label={x(M.settings_integrations)}>
          <Card>
            {integrations.map((ig, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-[14px] border-t border-inset px-[18px] py-[12px]"
              >
                <div className="text-[13px] font-semibold text-text">{x(ig.t)}</div>
                <div className="flex items-center gap-[8px]">
                  <StatusChip tone={ig.tone}>{x(ig.status)}</StatusChip>
                  {ig.error && (
                    <button
                      type="button"
                      onClick={retryIntegration}
                      className="cursor-pointer rounded-[8px] border-none bg-accent-soft px-[12px] py-[6px] font-sans text-[12px] font-bold text-accent"
                    >
                      {x(M.settings_int_retry)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-[14px] border-t border-inset px-[18px] py-[12px]">
              <div className="text-[13px] font-semibold text-text">{x(M.settings_billing)}</div>
              <button
                type="button"
                onClick={() => showToast(M.settings_toast_billing, 'ok')}
                className="cursor-pointer rounded-[8px] border border-border bg-surface px-[12px] py-[6px] font-sans text-[12px] font-bold text-text"
              >
                {x(M.settings_billing_btn)}
              </button>
            </div>
          </Card>
        </Section>

        {/* Audit log */}
        <Section label={x(M.settings_audit)}>
          <Card>
            {auditEvents.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-[12px] border-t border-inset px-[18px] py-[11px]"
              >
                <StatusChip tone={ev.tone}>{x(ev.kind)}</StatusChip>
                <div className="min-w-0 flex-1 text-[12.5px] leading-[1.5] text-text-2">
                  {x(ev.text)}
                </div>
                <span className="shrink-0 text-[11.5px] text-text-faint">{x(ev.when)}</span>
              </div>
            ))}
            <div className="border-t border-inset px-[18px] py-[10px] text-[11px] text-text-faint">
              {x(M.settings_audit_note)}
            </div>
          </Card>
        </Section>
      </div>
    </div>
  )
}
