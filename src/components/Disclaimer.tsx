import { rubric } from '../lib/rubric'

export function Disclaimer() {
  return (
    <footer className="mt-8 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-500">
      Based on the public Texas {rubric.form}, {rubric.edition}. A practice tool, not legal advice. Not
      affiliated with the City of Austin, Austin Public Health, or Texas DSHS.
    </footer>
  )
}
