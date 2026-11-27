import { useState } from 'react'
import type { Answer, Item } from '../lib/rubric'
import { rubric } from '../lib/rubric'
import { severityStyle } from '../lib/ui'

interface Props {
  item: Item
  answer: Answer | undefined
  onAnswer: (a: Answer) => void
}

const OPTIONS: { value: Answer; label: string; active: string }[] = [
  { value: 'in', label: 'Looks good', active: 'bg-emerald-600 text-white ring-emerald-600 shadow-sm' },
  { value: 'out', label: 'Needs fix', active: 'bg-rose-600 text-white ring-rose-600 shadow-sm' },
  { value: 'na', label: 'N/A', active: 'bg-stone-600 text-white ring-stone-600 shadow-sm' },
]

export function ItemCard({ item, answer, onAnswer }: Props) {
  const [open, setOpen] = useState(false)
  const sev = rubric.severity_labels[item.severity]
  const options = OPTIONS.filter((o) => o.value !== 'na' || item.allows_na)
  const isOut = answer === 'out'

  return (
    <article
      className={`rounded-2xl bg-white p-4 shadow-sm ring-1 transition-colors sm:p-5 ${
        isOut ? 'ring-rose-300' : 'ring-stone-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-stone-900">{item.title}</h3>
        <span
          className={`tabular shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${severityStyle[item.severity]}`}
          title={`${sev.label}: ${sev.correct_within}`}
        >
          {sev.short} · {item.points} pt{item.points > 1 ? 's' : ''}
        </span>
      </div>

      <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{item.plain_language}</p>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900"
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
        How to check
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-xl bg-stone-50 p-3 text-sm leading-relaxed text-stone-700">
          <p>{item.check}</p>
          {item.na_when && (
            <p className="text-stone-500">
              <span className="font-medium text-stone-600">N/A if: </span>
              {item.na_when}
            </p>
          )}
          <p className="text-xs text-stone-400">
            Form item #{item.id} · {item.code_ref}
          </p>
        </div>
      )}

      <div className={`mt-4 grid gap-2 ${options.length === 3 ? 'grid-cols-[3fr_3fr_2fr]' : 'grid-cols-2'}`} role="radiogroup" aria-label={item.title}>
        {options.map((o) => {
          const selected = answer === o.value
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={selected}
              onClick={() => onAnswer(o.value)}
              className={`h-12 rounded-xl text-[15px] font-semibold ring-1 ring-inset transition active:scale-[0.97] ${
                selected ? o.active : 'bg-white text-stone-700 ring-stone-300 hover:bg-stone-50'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>

      {isOut && (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm leading-relaxed text-rose-900">
          <span className="font-semibold">Fix: </span>
          {item.fix}
        </div>
      )}
    </article>
  )
}
