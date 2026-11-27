import type { Severity } from './rubric'

/** Tailwind classes per illustrative band. */
export const bandStyle: Record<string, { text: string; bg: string; ring: string; bar: string }> = {
  Green: { text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
  Yellow: { text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', bar: 'bg-amber-500' },
  Red: { text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200', bar: 'bg-rose-500' },
}

export const severityStyle: Record<Severity, string> = {
  priority: 'bg-rose-50 text-rose-700 ring-rose-200',
  priority_foundation: 'bg-amber-50 text-amber-800 ring-amber-200',
  core: 'bg-stone-100 text-stone-600 ring-stone-200',
}
