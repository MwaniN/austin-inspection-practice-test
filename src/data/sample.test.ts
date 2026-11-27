import { describe, expect, it } from 'vitest'
import { rubric } from '../lib/rubric'
import { summarize } from '../lib/scoring'
import { SAMPLE_ANSWERS } from './sample'

describe('sample answers', () => {
  it('answers every rubric item and nothing else', () => {
    expect(Object.keys(SAMPLE_ANSWERS).map(Number).sort((a, b) => a - b)).toEqual(rubric.items.map((i) => i.id))
  })

  it('only uses N/A where the item allows it', () => {
    for (const item of rubric.items) {
      if (SAMPLE_ANSWERS[item.id] === 'na') expect(item.allows_na, `item ${item.id}`).toBe(true)
    }
  })

  it('lands on a passing Yellow-band score with Priority items to fix', () => {
    const s = summarize(rubric, SAMPLE_ANSWERS)
    expect(s.score).toBe(85)
    expect(s.passed).toBe(true)
    expect(s.band.label).toBe('Yellow')
    expect(s.failed.filter((i) => i.severity === 'priority').length).toBe(2)
  })
})
