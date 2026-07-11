import { defineMessages } from '../core'

/**
 * Advisor view (full-page AI chat) — UI-chrome strings for the advisor home
 * empty state, the in-view thread list, the transcript chrome, and the chat
 * composer/footer.
 *
 * EN verbatim from `App v2.dc.html` (`buildI18n()`, `buildAdvisorHomeWidgets`,
 * `renderVals`); FR from the prototype's `buildI18n()` fr table, `frDict()`
 * and inline `L(en, fr)` pairs. FR strings with no source in the prototype
 * are marked [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 */
export const advisorViewMessages = defineMessages({
  /* ── Advisor home (empty state) ─────────────────────────────────────────── */
  advisorview_greeting: { en: 'Good to see you, Riley.', fr: 'Bonjour, Riley.' },
  advisorview_digest_sub: {
    en: "Here's what Advisor noticed since yesterday.",
    fr: 'Voici ce que Conseiller a remarqué depuis hier.',
  },
  advisorview_daily_brief: { en: "Advisor's daily brief", fr: 'Bilan quotidien du Conseiller' },
  advisorview_priorities_title: { en: 'Priorities today', fr: 'Priorités du jour' },
  advisorview_signals_label: { en: 'signals', fr: 'signaux' },
  advisorview_why: { en: 'Why', fr: 'Pourquoi' },

  /* Metric tiles (prototype `buildAdvisorHomeWidgets`, inline L pairs). */
  advisorview_metric_compliance: { en: 'Compliance score', fr: 'Score de conformité' },
  advisorview_metric_risk: { en: 'Open risk items', fr: 'Éléments à risque ouverts' },
  advisorview_metric_cases: { en: 'Active cases', fr: 'Dossiers actifs' },
  advisorview_metric_signals: { en: 'Support signals', fr: 'Signaux de soutien' },
  /* Trend lines live in advisorHomeData.ts as interpolated bi() values. */

  /* ── Composer + footer ──────────────────────────────────────────────────── */
  advisorview_composer_home: {
    en: 'Ask Advisor anything about your team…',
    fr: 'Demandez au Conseiller à propos de votre équipe…',
  },
  advisorview_composer_msg: { en: 'Message Advisor…', fr: 'Écrire au Conseiller…' },

  /* ── Thread list ────────────────────────────────────────────────────────── */
  advisorview_new_conversation: { en: 'New conversation', fr: 'Nouvelle conversation' },
  advisorview_threads_aria: { en: 'Conversations', fr: 'Conversations' }, // [FR self-authored]
  advisorview_group_pinned: { en: 'Pinned', fr: 'Épinglé' },
  advisorview_group_today: { en: 'Today', fr: 'Aujourd’hui' },
  advisorview_group_week: { en: 'Previous 7 days', fr: '7 derniers jours' },
  advisorview_group_older: { en: 'Older', fr: 'Plus anciennes' },

  /* ── Transcript chrome ──────────────────────────────────────────────────── */
  advisorview_generate: { en: 'Generate', fr: 'Générer' }, // [FR self-authored]

  /* Escalation toast (prototype `handleFollowup` → pushToast). */
  advisorview_toast_counsel: {
    en: 'Case shared with employment counsel',
    fr: 'Dossier partagé avec le conseiller juridique en emploi', // [FR self-authored]
  },

  /* Real advisor-chat backend failure (no prototype counterpart). */
  advisorview_real_chat_error: {
    en: 'The AI Advisor is temporarily unavailable.',
    fr: 'L’Advisor IA est temporairement indisponible.',
  },
  advisorview_real_chat_retry_prompt: {
    en: 'You can type your question again to retry.',
    fr: 'Vous pouvez retaper votre question pour réessayer.',
  },
})
