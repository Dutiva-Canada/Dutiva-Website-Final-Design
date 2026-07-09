import { defineMessages } from '../core'

/**
 * Tasks view — UI-chrome strings ported from `App v2.dc.html`
 * (`buildTasksView()` inline `L(en, fr)` pairs + `buildI18n()` tasks_empty*).
 * FR strings with no source in the prototype are marked [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(tasksMessages.key)`.
 */
export const tasksMessages = defineMessages({
  /* Header count — "{n} open" (buildTasksView openLabel). */
  tasks_open_label: { en: 'open', fr: 'ouvertes' },

  /* Row meta line (buildTasksView ownerLbl / linkedLbl). */
  tasks_owner: { en: 'Owner', fr: 'Responsable' },
  tasks_linked_prefix: { en: 'Linked: ', fr: 'Lié : ' },

  /* Status chip (buildTasksView statusLabel). */
  tasks_status_done: { en: 'Done', fr: 'Terminé' },
  tasks_status_blocked: { en: 'Blocked', fr: 'Bloqué' },
  tasks_status_open: { en: 'Open', fr: 'Ouvert' },

  /* Empty state (buildI18n tasks_empty / tasks_empty_sub). */
  tasks_empty: { en: 'You’re all caught up.', fr: 'Vous êtes à jour.' },
  tasks_empty_sub: {
    en: 'New tasks from Advisor will appear here.',
    fr: 'Les nouvelles tâches du Conseiller apparaîtront ici.',
  },

  /* A11y labels (prototype markup aria-labels; EN verbatim). */
  tasks_toggle_aria: {
    en: 'Toggle task done',
    fr: 'Basculer l’état de la tâche', // [FR self-authored]
  },
  tasks_open_chat_aria: {
    en: 'Open linked conversation for {title}',
    fr: 'Ouvrir la conversation liée pour {title}', // [FR self-authored]
  },
})
