import type { Answers, Band, Item, Rubric } from './rubric'

export interface ScoreSummary {
  score: number
  pointsLost: number
  passed: boolean
  band: Band
  answered: number
  total: number
  /** Items marked Out, ranked by points (highest first), then by form order. */
  failed: Item[]
}

export function bandFor(score: number, bands: Band[]): Band {
  return bands.find((b) => score >= b.min && score <= b.max) ?? bands[bands.length - 1]
}

export function summarize(rubric: Rubric, answers: Answers): ScoreSummary {
  const failed = rubric.items
    .filter((i) => answers[i.id] === 'out')
    .sort((a, b) => b.points - a.points || a.id - b.id)
  const pointsLost = failed.reduce((sum, i) => sum + i.points, 0)
  const score = Math.max(0, rubric.scoring.base_score - pointsLost)
  return {
    score,
    pointsLost,
    passed: score >= rubric.scoring.pass_min,
    band: bandFor(score, rubric.scoring.bands),
    answered: rubric.items.filter((i) => answers[i.id] !== undefined).length,
    total: rubric.items.length,
    failed,
  }
}
