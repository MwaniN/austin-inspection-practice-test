import { useEffect, useRef, useState } from 'react'
import type { ScoreSummary } from '../lib/scoring'
import { bandStyle } from '../lib/ui'

interface Props {
  summary: ScoreSummary
  onHome: () => void
}

/** Sticky header: live score, band, and overall progress. */
export function ScoreBar({ summary, onHome }: Props) {
  const { score, pointsLost, band, answered, total } = summary
  const style = bandStyle[band.label]
  const pop = usePopOnChange(score)

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
        <button
          onClick={onHome}
          className="-ml-2.5 grid size-11 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          aria-label="Back to start"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.83 10l3.94 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex items-baseline gap-1.5" aria-live="polite">
          <span key={pop} className={`tabular text-3xl font-bold tracking-tight ${style.text} ${pop ? 'animate-pop' : ''}`}>
            {score}
          </span>
          <span className="text-sm font-medium text-stone-400">/ 100</span>
        </div>

        <div className="flex flex-col">
          <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}>
            {band.label}
          </span>
          <span className="tabular mt-0.5 text-xs text-stone-500">
            {pointsLost > 0 ? `−${pointsLost} pts` : 'No points lost'}
          </span>
        </div>

        <div className="ml-auto text-right">
          <div className="tabular text-sm font-semibold text-stone-800">
            {answered}
            <span className="font-normal text-stone-400">/{total}</span>
          </div>
          <div className="text-xs text-stone-500">checked</div>
        </div>
      </div>
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-stone-800 transition-[width] duration-300"
          style={{ width: `${(answered / total) * 100}%` }}
          role="progressbar"
          aria-valuenow={answered}
          aria-valuemax={total}
          aria-label="Items checked"
        />
      </div>
    </header>
  )
}

/** Returns a counter that bumps whenever `value` changes (used to retrigger the pop animation). */
function usePopOnChange(value: number) {
  const [n, setN] = useState(0)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setN((x) => x + 1)
    }
  }, [value])
  return n
}
