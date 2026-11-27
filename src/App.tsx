import { SAMPLE_ANSWERS } from './data/sample'
import { itemsByArea, rubric } from './lib/rubric'
import { summarize } from './lib/scoring'
import { useInspection } from './lib/store'
import { InspectScreen } from './screens/InspectScreen'
import { StartScreen } from './screens/StartScreen'
import { VerdictScreen } from './screens/VerdictScreen'

export default function App() {
  const [state, dispatch] = useInspection()
  const summary = summarize(rubric, state.answers)

  if (state.screen === 'start') {
    return (
      <StartScreen
        answered={summary.answered}
        onStart={() => dispatch({ type: 'reset' })}
        complete={summary.answered === summary.total}
        sample={state.sample}
        onSample={() => dispatch({ type: 'loadSample', answers: SAMPLE_ANSWERS, areaIndex: itemsByArea.length - 1 })}
        onResume={() => dispatch({ type: summary.answered === summary.total ? 'finish' : 'start' })}
      />
    )
  }

  if (state.screen === 'verdict') {
    return (
      <VerdictScreen
        summary={summary}
        answers={state.answers}
        sample={state.sample}
        onBack={() => dispatch({ type: 'goArea', index: state.areaIndex })}
        onRestart={() => dispatch({ type: 'reset' })}
      />
    )
  }

  return <InspectScreen areaIndex={state.areaIndex} answers={state.answers} summary={summary} dispatch={dispatch} />
}
