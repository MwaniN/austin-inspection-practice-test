import { useEffect, useState } from 'react'
import { Disclaimer } from '../components/Disclaimer'
import { rubric, type Answers, type Item, type Severity } from '../lib/rubric'
import type { ScoreSummary } from '../lib/scoring'
import { bandStyle, severityStyle } from '../lib/ui'

interface Props {
  summary: ScoreSummary
  answers: Answers
  sample: boolean
  onBack: () => void
  onRestart: () => void
}

const SEVERITIES: Severity[] = ['priority', 'priority_foundation', 'core']
const areaName: Record<string, string> = Object.fromEntries(rubric.areas.map((a) => [a.id, a.name]))

export function VerdictScreen({ summary, answers, sample, onBack, onRestart }: Props) {
  const { score, pointsLost, passed, band, failed } = summary
  const style = bandStyle[band.label]
  const shown = useCountDown(score)

  const counts = { in: 0, out: 0, na: 0 }
  for (const a of Object.values(answers)) counts[a]++

  const groups = SEVERITIES.map((sev) => {
    const items = failed.filter((i) => i.severity === sev)
    return { sev, items, points: items.reduce((s, i) => s + i.points, 0) }
  }).filter((g) => g.items.length > 0)
  const priority = groups.find((g) => g.sev === 'priority')

  const [today] = useState(() =>
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  let headline: string
  let detail: string
  if (failed.length === 0) {
    headline = 'Perfect score.'
    detail = 'Nothing to fix. This is what a clean inspection looks like.'
  } else if (passed) {
    headline = "You'd pass."
    detail = `You lost ${pointsLost} point${pointsLost === 1 ? '' : 's'} on ${failed.length} item${failed.length === 1 ? '' : 's'}. ${rubric.scoring.pass_min} or higher passes in Austin.`
  } else {
    headline = "You'd fail."
    detail = rubric.scoring.fail_note
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),2rem)] print:px-0 print:pt-0">
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="-ml-2 flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.83 10l3.94 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
              clipRule="evenodd"
            />
          </svg>
          Edit answers
        </button>
      </div>

      <p className="hidden text-sm text-stone-500 print:block">
        Austin Inspection Practice Test · {sample ? 'Sample report' : 'Self-inspection'}, {today}
      </p>

      {sample && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-200">
          <p className="text-sm leading-snug text-sky-900">
            <span className="font-semibold">Sample results</span> for a made-up kitchen, not your answers.
          </p>
          <button
            onClick={onRestart}
            className="shrink-0 rounded-lg bg-sky-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 print:hidden"
          >
            Start my own
          </button>
        </div>
      )}

      {/* Score hero */}
      <section className="mt-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-7 print:shadow-none">
        <p className="text-sm font-semibold text-stone-500">{sample ? 'Sample score' : 'Your practice score'}</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2" aria-label={`${score} out of 100`}>
            <span className={`tabular text-7xl leading-none font-bold tracking-tight ${style.text}`}>{shown}</span>
            <span className="text-xl font-medium text-stone-400">/ 100</span>
          </div>
          <span
            className={`mb-1 rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}
          >
            {band.label} band
          </span>
        </div>

        <ScoreGauge score={shown} />

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">{headline}</h1>
        <p className="mt-1 text-[15px] leading-relaxed text-stone-600">{detail}</p>
        {priority && (
          <p className="mt-3 rounded-xl bg-stone-50 p-3 text-[15px] leading-relaxed text-stone-700">
            Fixing your {priority.items.length} Priority item{priority.items.length === 1 ? '' : 's'} alone would bring
            you to <span className="tabular font-semibold text-stone-900">{score + priority.points}</span>
            {!passed && score + priority.points >= rubric.scoring.pass_min ? ', enough to pass.' : '.'}
          </p>
        )}
      </section>

      {/* Answer tally */}
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {(
          [
            ['In', counts.in, 'text-emerald-700'],
            ['Out', counts.out, 'text-rose-700'],
            ['N/A', counts.na, 'text-stone-600'],
          ] as const
        ).map(([label, n, color]) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 print:shadow-none">
            <dt className="text-sm text-stone-500">{label}</dt>
            <dd className={`tabular text-2xl font-bold ${color}`}>{n}</dd>
          </div>
        ))}
      </dl>

      {/* Fix list */}
      {groups.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Your fix list</h2>
          <p className="mt-1 text-[15px] text-stone-600">
            Ranked by what costs you the most points. Start at the top.
          </p>

          <div className="mt-5 space-y-7">
            {groups.map(({ sev, items, points }) => {
              const label = rubric.severity_labels[sev]
              return (
                <section key={sev}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 font-semibold text-stone-900">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${severityStyle[sev]}`}
                      >
                        {label.short}
                      </span>
                      {label.label}
                    </h3>
                    <span className="tabular text-sm text-stone-500">
                      {items.length} item{items.length === 1 ? '' : 's'} · −{points} pts
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{label.correct_within}</p>
                  <ol className="mt-3 space-y-3">
                    {items.map((item) => (
                      <FixCard key={item.id} item={item} rank={failed.indexOf(item) + 1} />
                    ))}
                  </ol>
                </section>
              )
            })}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mt-10 space-y-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.99]"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path
              fillRule="evenodd"
              d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.305 1.984A1.75 1.75 0 0 1 14.084 19H5.915a1.75 1.75 0 0 1-1.73-2.016L4.492 15H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.127-.153L5 6.25v-3.5Zm8.5 3.397a41.533 41.533 0 0 0-7 0V2.75a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v3.397ZM6.608 12.5a.25.25 0 0 0-.247.212l-.693 4.5a.25.25 0 0 0 .247.288h8.17a.25.25 0 0 0 .246-.288l-.692-4.5a.25.25 0 0 0-.247-.212H6.608Z"
              clipRule="evenodd"
            />
          </svg>
          Print or save as PDF
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="h-12 rounded-2xl text-[15px] font-semibold text-stone-700 ring-1 ring-inset ring-stone-300 transition hover:bg-white"
          >
            Edit answers
          </button>
          <button
            onClick={() => {
              if (sample || window.confirm('Start a new inspection? This clears all your answers.')) onRestart()
            }}
            className="h-12 rounded-2xl text-[15px] font-semibold text-stone-700 ring-1 ring-inset ring-stone-300 transition hover:bg-white"
          >
            Start over
          </button>
        </div>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-stone-500">{rubric.scoring.bands_note}</p>
      <Disclaimer />
    </main>
  )
}

/** Horizontal 0–100 scale with the illustrative bands, the pass line, and a marker at the score. Display only. */
function ScoreGauge({ score }: { score: number }) {
  const pass = rubric.scoring.pass_min
  const segment: Record<string, string> = { Red: 'bg-rose-200', Yellow: 'bg-amber-200', Green: 'bg-emerald-200' }
  return (
    <div className="mt-6" aria-hidden>
      <div className="relative h-3">
        <div className="absolute inset-0 flex overflow-hidden rounded-full">
          {[...rubric.scoring.bands]
            .sort((a, b) => a.min - b.min)
            .map((b) => (
              <div
                key={b.label}
                className={segment[b.label]}
                style={{ width: `${(b.max === 100 ? 100 : b.max + 1) - b.min}%` }}
              />
            ))}
        </div>
        <div
          className="absolute -top-1 -bottom-1 w-1 -translate-x-1/2 rounded-full bg-stone-900"
          style={{ left: `${Math.min(99, Math.max(1, score))}%` }}
        />
      </div>
      <div className="relative mt-1.5 h-4 text-xs text-stone-500">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2 font-medium text-stone-700" style={{ left: `${pass}%` }}>
          {pass} pass line
        </span>
        <span className="absolute right-0">100</span>
      </div>
    </div>
  )
}

function FixCard({ item, rank }: { item: Item; rank: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="break-inside-avoid rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5 print:shadow-none">
      <div className="flex items-start gap-3">
        <span className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="leading-snug font-semibold text-stone-900">{item.title}</h4>
            <span className="tabular shrink-0 text-sm font-semibold text-rose-700">−{item.points} pt{item.points === 1 ? '' : 's'}</span>
          </div>
          <p className="text-sm text-stone-500">{areaName[item.area]}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-700">{item.fix}</p>

          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 print:hidden"
            aria-expanded={open}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`size-4 transition-transform ${open ? 'rotate-90' : ''}`}
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                clipRule="evenodd"
              />
            </svg>
            What the rule says
          </button>
          <div
            className={`mt-2 space-y-1.5 rounded-xl bg-stone-50 p-3 text-sm leading-relaxed text-stone-700 ${open ? '' : 'hidden print:block'}`}
          >
            <p>{item.plain_language}</p>
            <p className="text-xs text-stone-400">
              Form item #{item.id} · {item.code_ref}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}

/** Animates from 100 down to the score once, unless the user prefers reduced motion. */
function useCountDown(target: number) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [value, setValue] = useState(100)
  useEffect(() => {
    if (reduced) return
    const from = 100
    const start = performance.now()
    const duration = 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced])
  return reduced ? target : value
}
