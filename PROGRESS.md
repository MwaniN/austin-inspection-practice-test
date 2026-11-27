# Progress

_Last updated: 2026-11-26_

## Status
Phases 0–1 done. App scaffolded and `src/data/rubric.json` complete and validated. Next: Phase 2 (inspection UI).

## Checklist
- [x] Read the build plan
- [x] Download DSHS source PDFs into `resources/sources/` and convert them to text
- [ ] Confirm Austin's current form edition (see Open questions)
- [x] Scaffold Vite + React + TS + Tailwind v4 (`npm run dev`, `npm run build`)
- [x] Rubric validator: `npm run validate:rubric`
- [x] **Phase 1:** `src/data/rubric.json`, all 47 items, 100 pts total, 8 areas. Validator passes.
- [ ] **Phase 2:** inspection UI (mobile-first, In/Out/N/A, live score fixed at the top)
- [ ] **Phase 3:** verdict screen (score, band, points lost, ranked fix list, print/PDF)
- [ ] Demo touches: localStorage resume, "fill sample data" button, not-affiliated disclaimer
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

## Needs review
- **Code refs** were matched by hand to the 56-item guide's section lists and Food Code numbering. They're accurate at section level
  but worth a spot-check before showing anyone who knows the code.
- **Plain-language / check / fix text** was written from the marking instructions plus standard Food Code limits (cooking temps,
  sanitizer ppm, 7-day date marking, etc.). It's a summary, not legal advice, and the UI should say so.

## Open questions
- **A. Which form does Austin use today?** I couldn't confirm this online. The Austin "Overview of Changes to TFER"
  PDF now returns 404. The quickest way to settle it is a photo of a recent real Austin Public Health inspection report.
  Failing that, email ehsd.service@austintexas.gov. Until then the 47-item form is a safe basis.

## Next up
**Phase 2: inspection UI** (`src/App.tsx` is currently a placeholder that just counts items).
1. Start screen: one-line problem statement + "Start self-inspection".
2. Inspection: one area at a time, stepper/progress across 8 areas, large In / Out / N/A buttons (N/A only when `allows_na`),
   expandable "How to check" (`check`), score bar fixed at the top showing 100 − demerits.
3. State in a `useReducer` keyed by item id, persisted to localStorage.
Then Phase 3 (verdict screen).
