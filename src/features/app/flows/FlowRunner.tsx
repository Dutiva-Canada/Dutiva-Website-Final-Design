import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ChevronRight, Circle, FileText, RotateCcw } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { Disclaimer } from '@/components/Disclaimer'
import { flowsMessages as M } from '@/i18n/messages/flows'
import { templateByTid } from '@/features/app/documents/data'
import { customTemplateByTid } from '@/features/app/documents/customTemplates'
import { flowBySlug } from './data'
import {
  advance,
  back,
  currentStep,
  flowRecord,
  isComplete,
  progress,
  startRun,
} from './flowEngine'
import type { FlowRun } from './flowEngine'
import { isOutcome } from './flowModel'
import type { Flow } from './flowModel'

/**
 * Runs a guided flow — the surface Ring 2's decision-tree tools needed
 * (docs/FOUR_RING_FRAMEWORK.md).
 *
 * All state is the `FlowRun` from the engine, held here and never mutated;
 * every transition goes through `advance` / `back` so the rules live in one
 * tested place rather than in event handlers.
 *
 * Nothing is persisted. A run is a thinking tool, and what belongs on the
 * file is the document the outcome hands off to — which is why the completed
 * view leads with those rather than offering to save this.
 */

/* Same dual resolution as DocStudioProvider: doclib first, then the ported
   legacy templates. */
const templateFor = (tid: string) => templateByTid.get(tid) ?? customTemplateByTid.get(tid)

export function FlowRunner() {
  const { slug } = useParams<{ slug: string }>()
  const flow = slug === undefined ? undefined : flowBySlug.get(slug)
  if (!flow) return <FlowMissing />
  /* Keyed so switching flows resets the run rather than carrying a path from
     one graph into another, where its step ids mean nothing. */
  return <FlowBody key={flow.slug} flow={flow} />
}

function FlowMissing() {
  const { x } = useI18n()
  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[720px]">
        <p className="text-[14px] text-text-2">{x(M.flows_not_found)}</p>
        <Link
          to="/app/workflows"
          className="mt-[12px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-accent"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          {x(M.flows_back_to_workflows)}
        </Link>
      </div>
    </div>
  )
}

function FlowBody({ flow }: { readonly flow: Flow }) {
  const { x } = useI18n()
  const [run, setRun] = useState<FlowRun>(() => startRun(flow))

  const step = currentStep(flow, run)
  const done = isComplete(flow, run)
  const pct = Math.round(progress(flow, run) * 100)

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[720px]">
        <Link
          to="/app/workflows"
          className="mb-[14px] inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-text-muted"
        >
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          {x(M.flows_back_to_workflows)}
        </Link>

        <h1 className="font-display text-[22px] leading-[1.3] font-bold text-text">
          {x(flow.title)}
        </h1>
        <p className="mt-[6px] text-[13px] leading-[1.55] text-text-2">{x(flow.summary)}</p>

        <div
          role="progressbar"
          aria-label={x(M.flows_progress_aria)}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-[18px] h-[5px] w-full overflow-hidden rounded-full bg-inset"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-[20px] rounded-[14px] border border-border bg-surface px-[22px] py-[20px]">
          <h2 className="font-display text-[17px] leading-[1.35] font-bold text-text">
            {x(step.title)}
          </h2>
          <p className="mt-[8px] text-[13.5px] leading-[1.6] text-text-2">{x(step.body)}</p>

          {step.kind === 'task' && (
            <ul className="mt-[14px] flex flex-col gap-[8px]">
              {step.points.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-[9px] text-[13px] leading-[1.55] text-text-2"
                >
                  <Circle
                    size={6}
                    strokeWidth={0}
                    fill="currentColor"
                    className="mt-[7px] shrink-0 text-gold-dot"
                    aria-hidden="true"
                  />
                  <span>{x(point)}</span>
                </li>
              ))}
            </ul>
          )}

          {step.caution !== undefined && (
            <div className="mt-[14px] flex items-start gap-[8px] rounded-[10px] border border-gold-border bg-gold-bg px-[13px] py-[10px]">
              <AlertTriangle
                size={14}
                strokeWidth={1.9}
                className="mt-px shrink-0 text-gold-fg"
                aria-hidden="true"
              />
              <div className="text-[12.5px] leading-[1.55] text-gold-fg">
                <span className="font-bold">{x(M.flows_watch_for)}: </span>
                {x(step.caution)}
              </div>
            </div>
          )}

          {step.kind === 'choice' && (
            <div className="mt-[16px] flex flex-col gap-[9px]">
              {step.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRun(advance(flow, run, option.id))}
                  className="flex cursor-pointer items-start gap-[10px] rounded-[11px] border border-border bg-bg-soft px-[15px] py-[13px] text-left font-sans"
                >
                  <ChevronRight
                    size={15}
                    strokeWidth={2.1}
                    className="mt-[2px] shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-text">
                      {x(option.label)}
                    </span>
                    {option.detail !== undefined && (
                      <span className="mt-[3px] block text-[12.5px] leading-[1.5] text-text-muted">
                        {x(option.detail)}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step.kind === 'task' && (
            <button
              type="button"
              onClick={() => setRun(advance(flow, run))}
              className="mt-[16px] cursor-pointer rounded-[9px] border-none bg-navy px-[16px] py-[9px] font-sans text-[13px] font-bold text-white"
            >
              {x(M.flows_continue)}
            </button>
          )}

          {done && <OutcomeActions flow={flow} run={run} />}
        </div>

        <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
          {run.path.length > 1 && (
            <button
              type="button"
              onClick={() => setRun(back(run))}
              className="inline-flex cursor-pointer items-center gap-[6px] rounded-[8px] border border-border bg-surface px-[12px] py-[7px] font-sans text-[12.5px] font-semibold text-text"
            >
              <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
              {x(M.flows_back)}
            </button>
          )}
          <button
            type="button"
            onClick={() => setRun(startRun(flow))}
            className="inline-flex cursor-pointer items-center gap-[6px] rounded-[8px] border border-border bg-surface px-[12px] py-[7px] font-sans text-[12.5px] font-semibold text-text-muted"
          >
            <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
            {x(M.flows_restart)}
          </button>
        </div>

        {done && <PathTaken flow={flow} run={run} />}

        <Disclaimer variant="block" className="mt-[18px]" />
      </div>
    </div>
  )
}

/** The documents the outcome hands off to — what actually goes on the file. */
function OutcomeActions({ flow, run }: { readonly flow: Flow; readonly run: FlowRun }) {
  const { x } = useI18n()
  const step = currentStep(flow, run)
  if (!isOutcome(step)) return null
  const tids = step.documents ?? []
  if (tids.length === 0) return null

  return (
    <div className="mt-[18px] border-t border-inset pt-[16px]">
      <div className="text-[11.5px] font-bold tracking-[0.04em] text-text-muted uppercase">
        {x(M.flows_next_documents)}
      </div>
      <div className="mt-[10px] flex flex-col gap-[8px]">
        {tids.map((tid) => {
          const template = templateFor(tid)
          if (!template) return null
          return (
            <Link
              key={tid}
              to={`/app/documents/templates/${template.tid}`}
              className="flex items-center gap-[10px] rounded-[10px] border border-border bg-bg-soft px-[14px] py-[11px]"
            >
              <FileText
                size={15}
                strokeWidth={1.9}
                className="shrink-0 text-gold-fg"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 text-[13px] font-semibold text-text">
                {x(template.name)}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-accent">
                {x(M.flows_open_template)}
              </span>
            </Link>
          )
        })}
      </div>
      <p className="mt-[10px] text-[11.5px] leading-[1.55] text-text-muted">
        {x(M.flows_record_note)}
      </p>
    </div>
  )
}

/** The run's path, so the reasoning can be copied onto the file. */
function PathTaken({ flow, run }: { readonly flow: Flow; readonly run: FlowRun }) {
  const { x } = useI18n()
  const record = flowRecord(flow, run)

  return (
    <div className="mt-[18px] rounded-[12px] border border-border bg-surface px-[18px] py-[16px]">
      <div className="text-[11.5px] font-bold tracking-[0.04em] text-text-muted uppercase">
        {x(M.flows_your_path)}
      </div>
      <ol className="mt-[10px] flex flex-col gap-[8px]">
        {record.entries.map((entry, i) => (
          <li key={`${entry.step.id}-${i}`} className="text-[12.5px] leading-[1.55] text-text-2">
            <span className="font-semibold text-text">{x(entry.step.title)}</span>
            {entry.chosen && <span> — {x(entry.chosen.label)}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
