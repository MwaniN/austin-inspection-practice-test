# Progress

_Last updated: 2026-11-26_

## Status
Phases 0–2 done. Rubric complete and validated; start screen + station-by-station inspection UI working on mobile and desktop. Next: Phase 3 (verdict screen).

## Checklist
- [x] Read the build plan
- [x] Download DSHS source PDFs into `resources/sources/` and convert them to text
- [ ] Confirm Austin's current form edition (see Open questions)
- [x] Scaffold Vite + React + TS + Tailwind v4 (`npm run dev`, `npm run build`)
- [x] Rubric validator: `npm run validate:rubric`
- [x] **Phase 1:** `src/data/rubric.json`, all 47 items, 100 pts total, 8 areas. Validator passes.
- [x] **Phase 2:** inspection UI (mobile-first, In/Out/N/A, live score fixed at the top). Scoring unit tests: `npm test`
- [ ] **Phase 3:** verdict screen (score, band, points lost, ranked fix list, print/PDF)
- [x] Demo touches done: localStorage resume, not-affiliated disclaimer, confirm before "Start over"
- [ ] Demo touch: "fill sample data" button (so a demo can jump straight to a realistic verdict)
- [x] GitHub repo (public): https://github.com/MwaniN/austin-inspection-practice-test
- [ ] Deploy (Vercel or GitHub Pages) and add the link here
- [ ] *(Optional)* Phase 4: AI layer

## Decisions log
- **Form: build on the DSHS 47-item EH-06 (rev. 09-2015).** It is the only official form that gives each item a point value
  (items 1–20 = Priority, 3 pts; 21–33 = Priority Foundation, 2 pts; 34–47 = Core, 1 pt). The 2021
  56-item form leaves scoring to each jurisdiction and has no per-item points, so the app can't be scored from it.
  Austin's own docs say Pf = 2 and Core = 1, which matches the 47-item form.
- **Code references** come from the 56-item guide's "Applicable Code Sections" lists, matched to each of the 47 items,
  because the 47-item guide (`Marking-Instructions.txt`) cites no code sections. Use the 47-item guide for In/Out/N.A. criteria (`allows_na`).
- **Bands:** the plan's Green/Yellow/Red bands aren't confirmed as an official Austin grade. Austin publishes
  only a number. Label the bands "illustrative" in the UI unless that gets confirmed.
- **Fail line: 70 passes, 69 or below fails and triggers a re-inspection.** Confirmed by local news coverage
  (Daily Texan: "70 or above considered a passing score"; WhatNow: "reinspection required due to the health score being below 70").
  Supporting context: repeat failures within 3 years lead to a criminal complaint, and a third failure means closure (KUT, Aug 2026, citing APH).
- **Stack: Vite + React + Tailwind on Node 22,** static, no backend. The rubric validator is written in Node too, so there is a single toolchain.
- **Rubric gets a `check` field** (how to self-check this item right now), on top of the plan's schema. Approved by the user.

- **Rubric schema** (beyond the plan's): `title` (short UI name), `check` (how to self-check now), `na_when` (shown when N/A
  is allowed). Top level: `areas[]` (walk order), `severity_labels` (incl. official correction deadlines from the form), `scoring.pass_min`.
- **N/A is offered on 14 items only** (1–6, 16, 17, 24–26, 28, 38, 41). The guide permits N.A. on a few more (8, 9, 10, 15, 18, 21, 22,
  37, 47), but for those it practically never applies to a restaurant (e.g. "only prepackaged food sold"), so they're In/Out only.
  N.O. (not observed) is folded into N/A.
- **Areas (walk order):** Paperwork & Management → Staff & Handwashing → Receiving & Storage → Coolers & Cold Holding →
  Cooking & Hot Holding → Prep Area → Dish, Sanitizing & Chemicals → Facilities & Pests. Items within an area are in id order,
  so the higher-point items come first.
- **App structure (Phase 2):** `src/lib/scoring.ts` (pure `summarize()`, unit-tested in `scoring.test.ts`), `src/lib/store.ts`
  (`useReducer` + localStorage key `aipt:v1`; screens `start | inspect | verdict`; tapping the selected answer again clears it),
  `src/lib/ui.ts` (band/severity colors), `components/` (ScoreBar, ItemCard, Disclaimer), `screens/` (StartScreen, InspectScreen).
  The app always opens on the start screen; it shows "Resume" when there's saved progress.
- **UI choices:** one station per screen with a scrollable chip stepper (✓ when complete, red count of items needing a fix); a Fix
  box appears as soon as an item is marked "Needs fix"; the form item # and code ref sit inside "How to check" so the main card
  stays plain-language.
- **Answer labels are "Looks good / Needs fix / N/A",** not the official "In / Out" (inspector jargon: IN = in compliance,
  OUT = violation). Internally the values are still `in | out | na`, so scoring matches the form. User's call.
- **No "mark the rest as good" shortcut** (removed): it nudges people to record answers they didn't check. Fast demos will
  use the "fill sample data" button instead.
- **Logo is a clipboard, not a checkmark:** a check in a square read as a clickable checkbox.
- **Screenshots/visual checks:** the Playwright MCP needs an X server and fails in WSL. Instead use `playwright-core` driving
  headless system Chrome (`/opt/google/chrome/chrome`) from a scratch script at a 390×844 mobile viewport.

## Needs review
- ~~Code refs~~ **Verified.** Every cited section was checked against the 56-item guide's "Applicable Code Sections" lists
  and confirmed to sit under the matching item. One bad ref was fixed (item 33: 4-501.116 → 4-501.19). `npm run validate:rubric`
  now fails if any ref isn't in the guide.
- **Plain-language / check / fix text** was written from the marking instructions plus standard Food Code limits (cooking temps,
  sanitizer ppm, 7-day date marking, etc.). It's a summary, not legal advice, and the UI should say so.

## Open questions
- **A. Which form does Austin use today?** I couldn't confirm this online. The Austin "Overview of Changes to TFER"
  PDF now returns 404. The quickest way to settle it is a photo of a recent real Austin Public Health inspection report.
  Failing that, email ehsd.service@austintexas.gov. Until then the 47-item form is a safe basis.

## Next up
**Phase 3: verdict screen** (`src/App.tsx` currently renders a placeholder when `state.screen === 'verdict'`).
1. Big score + band (labelled illustrative) + Pass/Fail against 70, points lost, and how many items are still unanswered.
2. Ranked fix list from `summary.failed` (already sorted by points, then id): title, severity badge with its correction
   deadline (`severity_labels[sev].correct_within`), the `fix` text, and the code ref. Group or label the Priority items as "fix first".
3. Actions: "Back to inspection", "Start over", and Print / Save as PDF (`window.print()` + print styles).
4. Then the "fill sample data" button on the start screen, the README, and deploy.
