import { useEffect, useReducer } from 'react'
import { cleanAnswers, reachableArea, rubric, type Answer, type Answers } from './rubric'

export type Screen = 'start' | 'inspect' | 'verdict'

export interface State {
  screen: Screen
  areaIndex: number
  answers: Answers
  /** True while the answers are the untouched demo sample (cleared by reset or any edit). */
  sample: boolean
}

export type Action =
  | { type: 'start' }
  | { type: 'reset' }
  | { type: 'answer'; id: number; answer: Answer }
  | { type: 'goArea'; index: number }
  | { type: 'finish' }
  | { type: 'home' }
  | { type: 'loadSample'; answers: Answers; areaIndex: number }

const STORAGE_KEY = 'aipt:v1'
const initial: State = { screen: 'start', areaIndex: 0, answers: {}, sample: false }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, screen: 'inspect' }
    case 'reset':
      return { ...initial, screen: 'inspect' }
    case 'answer': {
      const answers = { ...state.answers }
      // Tapping the selected answer again clears it.
      if (answers[action.id] === action.answer) delete answers[action.id]
      else answers[action.id] = action.answer
      // Once edited, the answers are the user's own, not the sample's.
      return { ...state, answers, sample: false }
    }
    case 'goArea':
      // Never past the first station with unanswered items.
      return { ...state, screen: 'inspect', areaIndex: clampArea(action.index, state.answers) }
    case 'finish':
      // Results only once every item is answered; otherwise send them to the first gap.
      if (Object.keys(state.answers).length < rubric.items.length) {
        return { ...state, screen: 'inspect', areaIndex: reachableArea(state.answers) }
      }
      return { ...state, screen: 'verdict' }
    case 'home':
      return { ...state, screen: 'start' }
    case 'loadSample':
      return { screen: 'verdict', areaIndex: action.areaIndex, answers: { ...action.answers }, sample: true }
  }
}

function clampArea(index: number, answers: Answers): number {
  const i = Number.isInteger(index) ? index : 0
  return Math.max(0, Math.min(i, reachableArea(answers)))
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    // Saved data may be stale (older rubric) or edited by hand: keep only what's valid.
    const saved = JSON.parse(raw) as Record<string, unknown> | null
    const answers = cleanAnswers(saved?.answers)
    const areaIndex = clampArea(typeof saved?.areaIndex === 'number' ? saved.areaIndex : 0, answers)
    // Always land on the start screen; it offers "Resume" when there's saved progress.
    return { ...initial, areaIndex, answers, sample: saved?.sample === true }
  } catch {
    return initial
  }
}

export function useInspection() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ areaIndex: state.areaIndex, answers: state.answers, sample: state.sample }),
      )
    } catch {
      // Storage full or blocked (e.g. private browsing): the app still works, it just won't remember.
    }
  }, [state.areaIndex, state.answers, state.sample])
  return [state, dispatch] as const
}
