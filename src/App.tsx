import { rubric } from './lib/rubric'
import { summarize } from './lib/scoring'
import { useInspection } from './lib/store'
import { InspectScreen } from './screens/InspectScreen'
import { StartScreen } from './screens/StartScreen'

export default function App() {
  const [state, dispatch] = useInspection()
  const summary = summarize(rubric, state.answers)

  if (state.screen === 'start') {
    return (
      <StartScreen
        answered={summary.answered}
        onStart={() => dispatch({ type: 'reset' })}
        onResume={() => dispatch({ type: 'start' })}
      />
    )
  }

  if (state.screen === 'verdict') {
    // Phase 3 replaces this with the full verdict screen.
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm font-semibold text-stone-500">Results (Phase 3 placeholder)</p>
        <p className="tabular mt-2 text-5xl font-bold">{summary.score}</p>
        <p className="mt-2 text-stone-600">
          {summary.failed.length} items out · −{summary.pointsLost} pts · {summary.passed ? 'Pass' : 'Fail'}
        </p>
        <button
          onClick={() => dispatch({ type: 'goArea', index: state.areaIndex })}
          className="mt-6 rounded-xl px-4 py-2 font-semibold ring-1 ring-stone-300"
        >
          Back to inspection
        </button>
      </main>
    )
  }

  return <InspectScreen areaIndex={state.areaIndex} answers={state.answers} summary={summary} dispatch={dispatch} />
}
