import { useEffect, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { guidanceMessages as M } from '@/i18n/messages/guidance'
import { authMessages as A } from '@/i18n/messages/auth'
import { useAuth } from '../auth/authContext'
import { AuthSignInForm } from '../auth/AuthSignInForm'
import { fetchGuidanceSources, fetchRecentLawUpdates } from './api'
import type { GuidanceSource, LawUpdate } from './api'

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; sources: GuidanceSource[]; updates: LawUpdate[] }

/**
 * Real backend data — no prototype counterpart. Signed out: a magic-link
 * sign-in form. Signed in: guidance_sources + recent law_updates, read
 * directly from Supabase (RLS requires an authenticated session for both).
 */
export function GuidanceSourcesPanel() {
  const { x } = useI18n()
  const { status: authStatus, signOut } = useAuth()
  const [load, setLoad] = useState<LoadState>({ status: 'idle' })

  useEffect(() => {
    if (authStatus !== 'signed-in') {
      setLoad({ status: 'idle' })
      return
    }
    let cancelled = false
    setLoad({ status: 'loading' })
    Promise.all([fetchGuidanceSources(), fetchRecentLawUpdates()])
      .then(([sources, updates]) => {
        if (!cancelled) setLoad({ status: 'ready', sources, updates })
      })
      .catch((error: unknown) => {
        console.error('guidance: failed to load live legal sources', error)
        if (!cancelled) setLoad({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [authStatus])

  return (
    <div className="mt-[28px] rounded-[12px] border border-border bg-surface px-[20px] py-[18px]">
      <div className="flex items-center justify-between gap-[12px]">
        <div>
          <div className="text-[14px] font-semibold text-text">{x(M.guidance_panel_title)}</div>
          <p className="mt-[2px] text-[12px] text-text-muted">{x(M.guidance_panel_beta)}</p>
        </div>
        {authStatus === 'signed-in' && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 cursor-pointer rounded-[8px] border border-border bg-transparent px-[12px] py-[7px] text-[12.5px] font-semibold text-text-2"
          >
            {x(A.auth_sign_out)}
          </button>
        )}
      </div>

      {authStatus === 'signed-out' && (
        <div className="mt-[16px] flex flex-col gap-[10px]">
          <p className="text-[13px] text-text-2">{x(M.guidance_signin_prompt)}</p>
          <AuthSignInForm idPrefix="guidance" />
        </div>
      )}

      {authStatus === 'sent-link' && (
        <p className="mt-[16px] text-[13px] text-text-2">{x(A.auth_link_sent)}</p>
      )}

      {authStatus === 'loading' && (
        <div className="mt-[16px] flex items-center gap-[8px] text-[13px] text-text-muted">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          {x(M.guidance_loading)}
        </div>
      )}

      {authStatus === 'signed-in' && load.status === 'loading' && (
        <div className="mt-[16px] flex items-center gap-[8px] text-[13px] text-text-muted">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          {x(M.guidance_loading)}
        </div>
      )}

      {authStatus === 'signed-in' && load.status === 'error' && (
        <p className="mt-[16px] text-[13px] text-risk-fg">{x(M.guidance_load_error)}</p>
      )}

      {authStatus === 'signed-in' && load.status === 'ready' && (
        <div className="mt-[16px] flex flex-col gap-[18px]">
          <section>
            <div className="mb-[8px] text-[12px] font-bold text-text-3">
              {x(M.guidance_sources_heading)}
            </div>
            {load.sources.length === 0 ? (
              <p className="text-[12.5px] text-text-muted">{x(M.guidance_empty_sources)}</p>
            ) : (
              <ul className="flex flex-col gap-[8px]">
                {load.sources.map((source) => (
                  <li
                    key={source.id}
                    className="flex items-start justify-between gap-[10px] rounded-[10px] border border-inset px-[14px] py-[10px]"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-text">{source.title}</div>
                      {source.jurisdiction && (
                        <div className="mt-[2px] text-[11.5px] text-text-muted">
                          {source.jurisdiction}
                        </div>
                      )}
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={source.title}
                        className="mt-[2px] shrink-0 text-text-3"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-[8px] text-[12px] font-bold text-text-3">
              {x(M.guidance_law_updates_heading)}
            </div>
            {load.updates.length === 0 ? (
              <p className="text-[12.5px] text-text-muted">{x(M.guidance_empty_updates)}</p>
            ) : (
              <ul className="flex flex-col gap-[8px]">
                {load.updates.map((update) => (
                  <li key={update.id} className="rounded-[10px] border border-inset px-[14px] py-[10px]">
                    <div className="text-[13px] font-semibold text-text">
                      {update.lawName}
                      <span className="ml-[6px] font-normal text-text-muted">
                        · {update.jurisdiction}
                      </span>
                    </div>
                    {update.changeSummary && (
                      <p className="mt-[3px] text-[12.5px] text-text-2">{update.changeSummary}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
