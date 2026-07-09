import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { pickL } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { useTheme } from '@/lib/themeContext'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { common } from '@/i18n/messages/common'
import { settingsMessages as M } from '@/i18n/messages/settings'
import {
  aiToggles,
  auditEvents,
  initialPrefs,
  notificationToggles,
  provinces,
  retentionRows,
  roleRows,
  securityRows,
  team,
} from './settingsData'
import type { ChipTone, PrefKey } from './settingsData'
import { Card, Section, StatusChip, ToggleRow, segClass } from './settingsPrimitives'

/**
 * Settings view — port of the prototype's largest static view
 * (`App v2.dc.html` markup 1267–1435, `buildSettingsView()` 3539–3622).
 *
 * Appearance/Language segments drive the real ThemeProvider / LangProvider;
 * preference toggles flip local state (prototype `settingsPrefs`); the
 * Calendar-sync integration starts in its error state and Retry clears it
 * with a toast, exactly like `retryIntegration()`. Content tables live in
 * settingsData.ts; shared building blocks in settingsPrimitives.tsx.
 */

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
            <div
              role="tablist"
              aria-label={x(M.settings_appearance)}
              className="flex gap-[6px] rounded-[12px] border border-border bg-surface px-[16px] py-[14px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={theme !== 'dark'}
                onClick={() => setTheme('light')}
                className={segClass(theme !== 'dark')}
              >
                {x(M.settings_theme_light)}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={theme === 'dark'}
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
            <div
              role="tablist"
              aria-label={x(M.settings_language)}
              className="flex gap-[6px] rounded-[12px] border border-border bg-surface px-[16px] py-[14px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={lang === 'en'}
                onClick={() => setLang('en')}
                className={segClass(lang === 'en')}
              >
                English
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lang === 'fr'}
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
                {x(common.disclaimer_full)}
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