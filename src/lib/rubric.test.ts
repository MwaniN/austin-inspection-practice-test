import { describe, expect, it } from 'vitest'
import { SAMPLE_ANSWERS } from '../data/sample'
import { cleanAnswers, itemsByArea, reachableArea } from './rubric'

describe('cleanAnswers', () => {
  it('drops unknown ids, invalid values, and N/A where it is not allowed', () => {
    // Item 7 doesn't allow N/A; item 1 does.
    expect(cleanAnswers({ 1: 'na', 2: 'out', 7: 'na', 99: 'in', 3: 'maybe' })).toEqual({ 1: 'na', 2: 'out' })
  })

  it('returns nothing for junk', () => {
    for (const junk of [null, undefined, 'x', 5, ['in']]) expect(cleanAnswers(junk)).toEqual({})
  })

  it('keeps a full valid set intact', () => {
    expect(cleanAnswers(SAMPLE_ANSWERS)).toEqual(SAMPLE_ANSWERS)
  })
})

describe('reachableArea', () => {
  it('is the first station with an unanswered item', () => {
    expect(reachableArea({})).toBe(0)
    const firstStation = Object.fromEntries(itemsByArea[0].items.map((i) => [i.id, 'in' as const]))
    expect(reachableArea(firstStation)).toBe(1)
  })

  it('is the last station once everything is answered', () => {
    expect(reachableArea(SAMPLE_ANSWERS)).toBe(itemsByArea.length - 1)
  })
})
