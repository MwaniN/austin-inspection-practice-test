// Validates src/data/rubric.json against the DSHS 47-item form (EH-06, rev. 09-2015).
// Run: npm run validate:rubric
import { readFileSync } from 'node:fs'

const rubric = JSON.parse(readFileSync(new URL('../src/data/rubric.json', import.meta.url), 'utf8'))
const errors = []
const fail = (msg) => errors.push(msg)

const POINTS = { priority: 3, priority_foundation: 2, core: 1 }
// On the official form, the item number determines the severity tier.
const expectedSeverity = (id) => (id <= 20 ? 'priority' : id <= 33 ? 'priority_foundation' : 'core')
const REQUIRED = ['id', 'area', 'title', 'text', 'severity', 'points', 'code_ref', 'plain_language', 'check', 'fix', 'allows_na']

const areaIds = new Set((rubric.areas ?? []).map((a) => a.id))
if (areaIds.size === 0) fail('No areas defined')

const items = rubric.items ?? []
const seen = new Set()
for (const item of items) {
  const tag = `item ${item.id ?? '?'}`
  for (const key of REQUIRED) {
    const v = item[key]
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) fail(`${tag}: missing "${key}"`)
  }
  if (seen.has(item.id)) fail(`${tag}: duplicate id`)
  seen.add(item.id)
  if (!areaIds.has(item.area)) fail(`${tag}: unknown area "${item.area}"`)
  if (item.severity !== expectedSeverity(item.id))
    fail(`${tag}: severity "${item.severity}" but the form puts it in "${expectedSeverity(item.id)}"`)
  if (item.points !== POINTS[item.severity]) fail(`${tag}: points ${item.points} don't match severity ${item.severity}`)
  if (item.allows_na && !item.na_when) fail(`${tag}: allows_na is true but "na_when" is missing`)
  if (!item.allows_na && item.na_when) fail(`${tag}: has "na_when" but allows_na is false`)
}

for (let id = 1; id <= 47; id++) if (!seen.has(id)) fail(`missing item ${id}`)
if (items.length !== 47) fail(`expected 47 items, found ${items.length}`)

const total = items.reduce((sum, i) => sum + (i.points ?? 0), 0)
if (total !== 100) fail(`points total ${total}, expected 100`)

for (const area of rubric.areas ?? [])
  if (!items.some((i) => i.area === area.id)) fail(`area "${area.id}" has no items`)

if (errors.length) {
  console.error(`✗ rubric.json has ${errors.length} problem(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

const bySev = Object.keys(POINTS).map((s) => `${items.filter((i) => i.severity === s).length} ${s}`).join(', ')
console.log(`✓ rubric.json valid: ${items.length} items (${bySev}), ${total} points, ${areaIds.size} areas`)
