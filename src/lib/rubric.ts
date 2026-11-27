import data from '../data/rubric.json'

export type Severity = 'priority' | 'priority_foundation' | 'core'
export type Answer = 'in' | 'out' | 'na'
export type Answers = Record<number, Answer>

export interface Item {
  id: number
  area: string
  title: string
  text: string
  severity: Severity
  points: number
  code_ref: string
  plain_language: string
  check: string
  fix: string
  allows_na: boolean
  na_when?: string
}

export interface Area {
  id: string
  name: string
  blurb: string
}

export interface Band {
  label: string
  min: number
  max: number
}

export interface Rubric {
  jurisdiction: string
  form: string
  edition: string
  sources: { label: string; url: string }[]
  code_ref_note: string
  scoring: {
    base_score: number
    pass_min: number
    bands: Band[]
    bands_note: string
    fail_note: string
  }
  severity_labels: Record<Severity, { label: string; short: string; correct_within: string }>
  areas: Area[]
  items: Item[]
}

export const rubric = data as Rubric

/** Items grouped by area, in walk order. Within an area, items keep id order (higher points first). */
export const itemsByArea: { area: Area; items: Item[] }[] = rubric.areas.map((area) => ({
  area,
  items: rubric.items.filter((i) => i.area === area.id).sort((a, b) => a.id - b.id),
}))

/** Furthest station the user may open: every station before it must be fully answered. */
export function reachableArea(answers: Answers): number {
  const first = itemsByArea.findIndex(({ items }) => items.some((i) => answers[i.id] === undefined))
  return first === -1 ? itemsByArea.length - 1 : first
}

/** Keep only answers for real items with a valid value (N/A only where the item allows it). */
export function cleanAnswers(raw: unknown): Answers {
  const out: Answers = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  const src = raw as Record<string, unknown>
  for (const item of rubric.items) {
    const a = src[item.id]
    if (a === 'in' || a === 'out' || (a === 'na' && item.allows_na)) out[item.id] = a
  }
  return out
}
