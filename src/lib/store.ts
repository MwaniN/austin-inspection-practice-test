import { useEffect, useReducer } from 'react'
import type { Answer, Answers } from './rubric'

export type Screen = 'start' | 'inspect' | 'verdict'

export interface State {
  screen: Screen
  areaIndex: number
  answers: Answers
  /** True while the answers came from the demo sample (cleared by reset). */
  sample: boolean
}

export type Action =
  | { type: 'start' }
  | { type: 'reset' }
  | { type: 'answer'; id: number; answer: Answer }
  | { type: 'answerMany'; ids: number[]; answer: Answer }
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
      return { ...state, answers }
    }
    case 'answerMany': {
      const answers = { ...state.answers }
      for (const id of action.ids) answers[id] = action.answer
      return { ...state, answers }
    }
    case 'goArea':
      return { ...state, screen: 'inspect', areaIndex: action.index }
    case 'finish':
      return { ...state, screen: 'verdict' }
    case 'home':
      return { ...state, screen: 'start' }
    case 'loadSample':
      return { screen: 'verdict', areaIndex: action.areaIndex, answers: { ...action.answers }, sample: true }
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const saved = JSON.parse(raw) as Partial<State>
    // Always land on the start screen; it offers "Resume" when there's saved progress.
    return { ...initial, areaIndex: saved.areaIndex ?? 0, answers: saved.answers ?? {}, sample: saved.sample ?? false }
  } catch {
    return initial
  }
}

export function useInspection() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ areaIndex: state.areaIndex, answers: state.answers, sample: state.sample }),
    )
  }, [state.areaIndex, state.answers, state.sample])
  return [state, dispatch] as const
}
