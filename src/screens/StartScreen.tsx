import { rubric } from '../lib/rubric'
import { Disclaimer } from '../components/Disclaimer'

interface Props {
  answered: number
  onStart: () => void
  onResume: () => void
}

export function StartScreen({ answered, onStart, onResume }: Props) {
  const total = rubric.items.length
  const hasProgress = answered > 0

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
        <span className="grid size-7 place-items-center rounded-lg bg-stone-900 text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        Austin Inspection Practice Test
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl">
          Would you pass your health inspection today?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-600">
          Walk your kitchen with the same {total}‑item, 100‑point form Austin inspectors use. See your score and
          exactly what to fix <span className="font-semibold text-stone-800">before</span> it goes on the public record.
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          {[
            [String(total), 'items'],
            [String(rubric.areas.length), 'stations'],
            ['~15', 'minutes'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <dt className="sr-only">{label}</dt>
              <dd className="tabular text-2xl font-bold text-stone-900">{value}</dd>
              <dd className="text-sm text-stone-500">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 space-y-3">
          {hasProgress ? (
            <>
              <button
                onClick={onResume}
                className="h-14 w-full rounded-2xl bg-stone-900 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.99]"
              >
                Resume inspection · {answered}/{total} checked
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Start over? This clears all your answers.')) onStart()
                }}
                className="h-12 w-full rounded-2xl text-base font-semibold text-stone-600 ring-1 ring-inset ring-stone-300 transition hover:bg-white"
              >
                Start over
              </button>
            </>
          ) : (
            <button
              onClick={onStart}
              className="h-14 w-full rounded-2xl bg-stone-900 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.99]"
            >
              Start self-inspection
            </button>
          )}
        </div>

        <ol className="mt-10 space-y-3 text-[15px] text-stone-600">
          {[
            'Go station by station and mark each item In, Out, or N/A.',
            'Watch your score drop from 100 as violations add up.',
            'Get your fix list, ranked by what costs you the most points.',
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-stone-200 text-xs font-bold text-stone-700">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Disclaimer />
    </main>
  )
}
