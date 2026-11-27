import { describe, expect, it } from 'vitest'
import { rubric } from './rubric'
import { bandFor, summarize } from './scoring'

describe('summarize', () => {
  it('starts at 100 with nothing answered', () => {
    const s = summarize(rubric, {})
    expect(s.score).toBe(100)
    expect(s.pointsLost).toBe(0)
    expect(s.passed).toBe(true)
    expect(s.answered).toBe(0)
    expect(s.total).toBe(47)
  })

  it('deducts 3 / 2 / 1 for Priority / Pf / Core items marked Out', () => {
    // item 2 = Priority (3), item 28 = Pf (2), item 36 = Core (1)
    const s = summarize(rubric, { 2: 'out', 28: 'out', 36: 'out', 1: 'in', 4: 'na' })
    expect(s.pointsLost).toBe(6)
    expect(s.score).toBe(94)
    expect(s.answered).toBe(5)
  })

  it('ranks failed items by points, then form order', () => {
    const s = summarize(rubric, { 36: 'out', 28: 'out', 9: 'out', 2: 'out' })
    expect(s.failed.map((i) => i.id)).toEqual([2, 9, 28, 36])
  })

  it('treats 70 as passing and 69 as failing', () => {
    // Items 1–10 are all Priority (3 pts): 10 Outs = 30 pts lost = 70.
    const ten = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, 'out' as const]))
    expect(summarize(rubric, ten).score).toBe(70)
    expect(summarize(rubric, ten).passed).toBe(true)
    expect(summarize(rubric, { ...ten, 34: 'out' }).score).toBe(69)
    expect(summarize(rubric, { ...ten, 34: 'out' }).passed).toBe(false)
  })

  it('bottoms out at 0 when every item fails', () => {
    const all = Object.fromEntries(rubric.items.map((i) => [i.id, 'out' as const]))
    expect(summarize(rubric, all).score).toBe(0)
  })
})

describe('bandFor', () => {
  it('maps band edges', () => {
    const b = rubric.scoring.bands
    expect(bandFor(100, b).label).toBe('Green')
    expect(bandFor(90, b).label).toBe('Green')
    expect(bandFor(89, b).label).toBe('Yellow')
    expect(bandFor(70, b).label).toBe('Yellow')
    expect(bandFor(69, b).label).toBe('Red')
    expect(bandFor(0, b).label).toBe('Red')
  })
})
