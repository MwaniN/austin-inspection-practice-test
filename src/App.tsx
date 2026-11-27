import rubric from './data/rubric.json'

export default function App() {
  return (
    <main className="min-h-dvh bg-stone-50 p-6 text-stone-900">
      <h1 className="text-2xl font-semibold">Austin Inspection Practice Test</h1>
      <p className="mt-2 text-stone-600">{rubric.items.length} items loaded. UI coming in Phase 2.</p>
    </main>
  )
}
