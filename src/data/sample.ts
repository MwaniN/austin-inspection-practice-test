import type { Answers } from '../lib/rubric'

/**
 * A believable mid-range kitchen for demos: passes (85, Yellow band) with two Priority problems.
 * Every item is answered, so the stations' "answer everything first" gate is satisfied.
 */
const OUT = [
  2, // Cold holding at 41°F: prep cooler running warm
  14, // Handwashing & gloves: gloves not changed between raw and ready-to-eat
  28, // Date marking: prepped sauces with no date labels
  29, // Thermometers & test strips: no test strips for the sanitizer
  31, // Hand sinks stocked & clear: hand sink blocked by a cart
  36, // Wiping cloths: wet rags on the counter, not in sanitizer
  39, // Utensil storage & handling: scoops stored handle-down in the flour
  45, // Floors, walls & ceilings: grease build-up under the fryer
]
const NA = [
  6, // Time instead of temperature: not used
  16, // Vulnerable populations: not a hospital, nursing home or daycare
  25, // Variances & special processes: none
]

export const SAMPLE_ANSWERS: Answers = Object.fromEntries(
  Array.from({ length: 47 }, (_, i) => i + 1).map((id) => [id, OUT.includes(id) ? 'out' : NA.includes(id) ? 'na' : 'in']),
)
