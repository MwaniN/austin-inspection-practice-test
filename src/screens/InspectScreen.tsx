import { useEffect, useRef } from 'react'
import { ItemCard } from '../components/ItemCard'
import { ScoreBar } from '../components/ScoreBar'
import { itemsByArea, type Answer, type Answers } from '../lib/rubric'
import type { ScoreSummary } from '../lib/scoring'
import type { Action } from '../lib/store'

interface Props {
  areaIndex: number
  answers: Answers
  summary: ScoreSummary
  dispatch: (a: Action) => void
}

export function InspectScreen({ areaIndex, answers, summary, dispatch }: Props) {
  const { area, items } = itemsByArea[areaIndex]
  const isLast = areaIndex === itemsByArea.length - 1
  const unanswered = items.filter((i) => answers[i.id] === undefined)
  const blocked = unanswered.length > 0
  // Furthest station you may open: every station before it must be fully answered.
  const firstIncomplete = itemsByArea.findIndex(({ items }) => items.some((i) => answers[i.id] === undefined))
  const reachable = firstIncomplete === -1 ? itemsByArea.length - 1 : firstIncomplete

  // Start each station at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [areaIndex])

  return (
    <div className="min-h-dvh">
      <ScoreBar summary={summary} onHome={() => dispatch({ type: 'home' })} />
      <AreaStepper current={areaIndex} reachable={reachable} answers={answers} onPick={(index) => dispatch({ type: 'goArea', index })} />

      <main className="mx-auto max-w-2xl px-4 pb-32">
        <div className="pt-5 pb-4">
          <p className="text-sm font-semibold text-stone-500">
            Station {areaIndex + 1} of {itemsByArea.length}
          </p>
          <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-stone-900">{area.name}</h2>
          <p className="mt-1 text-[15px] text-stone-600">{area.blurb}</p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              answer={answers[item.id]}
              onAnswer={(answer: Answer) => dispatch({ type: 'answer', id: item.id, answer })}
            />
          ))}
        </div>

        {unanswered.length > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-stone-200">
            <p className="text-sm text-stone-600">
              <span className="tabular font-semibold text-stone-900">{unanswered.length}</span>{' '}
              {unanswered.length === 1 ? 'item' : 'items'} at this station {unanswered.length === 1 ? 'is' : 'are'} still
              unanswered.
            </p>
            <button
              onClick={() => showItem(unanswered[0].id)}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-stone-800 ring-1 ring-inset ring-stone-300 transition hover:bg-stone-50"
            >
              Show me
            </button>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 px-1 text-sm font-medium text-emerald-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"
              />
            </svg>
            All {items.length} items at this station answered.
          </p>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 py-3">
          <button
            onClick={() => dispatch({ type: 'goArea', index: areaIndex - 1 })}
            disabled={areaIndex === 0}
            className="h-12 rounded-xl px-5 text-[15px] font-semibold text-stone-700 ring-1 ring-inset ring-stone-300 transition hover:bg-stone-50 disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (blocked) showItem(unanswered[0].id)
              else if (isLast) dispatch({ type: 'finish' })
              else dispatch({ type: 'goArea', index: areaIndex + 1 })
            }}
            className={`h-12 flex-1 rounded-xl text-[15px] font-semibold transition active:scale-[0.99] ${
              blocked ? 'bg-stone-200 text-stone-600' : 'bg-stone-900 text-white shadow-sm hover:bg-stone-800'
            }`}
          >
            {blocked
              ? `Answer ${unanswered.length} more to continue`
              : isLast
                ? 'See my results'
                : `Next: ${itemsByArea[areaIndex + 1].area.name}`}
          </button>
        </div>
      </nav>
    </div>
  )
}

/** Scroll to an item's card and briefly outline it so the eye lands on it. */
function showItem(id: number) {
  const el = document.getElementById(`item-${id}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.animate(
    [{ boxShadow: '0 0 0 3px rgb(28 25 23 / 0.7)' }, { boxShadow: '0 0 0 3px rgb(28 25 23 / 0)' }],
    { duration: 1400, delay: 350, easing: 'ease-out' },
  )
}

function AreaStepper({
  current,
  reachable,
  answers,
  onPick,
}: {
  current: number
  reachable: number
  answers: Answers
  onPick: (i: number) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [current])

  return (
    <div className="border-b border-stone-200 bg-stone-100">
      <div className="no-scrollbar mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2.5">
        {itemsByArea.map(({ area, items }, i) => {
          const done = items.filter((it) => answers[it.id] !== undefined).length
          const complete = done === items.length
          const outs = items.filter((it) => answers[it.id] === 'out').length
          const active = i === current
          const locked = i > reachable
          return (
            <button
              key={area.id}
              ref={active ? activeRef : undefined}
              onClick={() => onPick(i)}
              disabled={locked}
              title={locked ? 'Answer every item in the earlier stations first' : undefined}
              aria-current={active ? 'step' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-1 ring-inset transition ${
                active
                  ? 'bg-stone-900 text-white ring-stone-900'
                  : locked
                    ? 'cursor-not-allowed bg-transparent text-stone-400 ring-stone-200'
                    : complete
                      ? 'bg-white text-stone-700 ring-stone-200'
                      : 'bg-transparent text-stone-600 ring-stone-300 hover:bg-white'
              }`}
            >
              {locked && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {complete && !active && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-emerald-600" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {area.name}
              {outs > 0 && (
                <span className={`tabular rounded-full px-1.5 text-xs font-semibold ${active ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}`}>
                  {outs}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
