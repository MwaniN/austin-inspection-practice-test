# Progress

_Last updated: 2026-11-26_

## Status
Phases 0–3 done, audited, and deployed to GitHub Pages: https://mwanin.github.io/austin-inspection-practice-test/. Only optional work remains (Phase 4 AI layer, confirming the form edition).

## Checklist
- [x] Read the build plan
- [x] Download DSHS source PDFs into `resources/sources/` and convert them to text
- [ ] Confirm Austin's current form edition (see Open questions)
- [x] Scaffold Vite + React + TS + Tailwind v4 (`npm run dev`, `npm run build`)
- [x] Rubric validator: `npm run validate:rubric`
- [x] **Phase 1:** `src/data/rubric.json`, all 47 items, 100 pts total, 8 areas. Validator passes.
- [x] **Phase 2:** inspection UI (mobile-first, In/Out/N/A, live score fixed at the top). Scoring unit tests: `npm test`
- [x] **Phase 3:** verdict screen (score, band, points lost, ranked fix list, print/PDF)
- [x] Demo touches done: localStorage resume, not-affiliated disclaimer, confirm before "Start over"
- [x] Demo touch: "Just looking? See a sample result" button (85, Yellow, 2 Priority items Out). Tested in `src/data/sample.test.ts`
- [x] README with screenshots (`docs/*.png`)
- [x] GitHub repo (public): https://github.com/MwaniN/austin-inspection-practice-test
- [x] Audit (3 Sonnet agents: rubric vs. sources, code, live UI + docs) and fixes applied, see Decisions log
- [x] Deploy to GitHub Pages: https://mwanin.github.io/austin-inspection-practice-test/ (auto-deploys on push to `main` via `.github/workflows/deploy.yml`)
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
  The app's `fail_note` deliberately leaves the penalty claims out (news-sourced, not in the official documents); it only says 69 or below fails and gets a re-inspection.
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
  `src/lib/ui.ts` (band/severity colors), `components/` (ScoreBar, ItemCard, Disclaimer), `screens/` (StartScreen, InspectScreen, VerdictScreen).
  The app always opens on the start screen; it shows "Resume" when there's saved progress.
- **UI choices:** one station per screen with a scrollable chip stepper (✓ when complete, red count of items needing a fix); a Fix
  box appears as soon as an item is marked Out; the form item # and code ref sit inside "How to check" so the main card
  stays plain-language.
- **Answer labels stay "In / Out / N/A"** (the official inspector marks). The start screen has a short "What In, Out and N/A
  mean" box explaining them. User's call, after briefly trying "Looks good / Needs fix".
- **Unanswered prompt, never a suggested answer:** each station ends with "N items at this station are still unanswered" plus a
  "Show me" button that scrolls to the first unanswered card and briefly outlines it (or "All N items answered" when done).
  The old "Mark the remaining N as In" button was removed because it told people *what* to answer. Fast demos use the
  "Just looking? See a sample result" link instead.
- **Stations are gated:** you can't move forward until every item at the current station is answered. The Next / "See my
  results" button keeps its label but turns grey; tapping it jumps to the first unanswered card. Station
  chips past the first incomplete station are disabled with a lock icon. Going back is always allowed. User's call.
- **Verdict screen (Phase 3):** score counts down from 100 (skipped with reduced motion), "<band> band" pill, a display-only
  0–100 gauge with the 70 pass line, headline "You'd pass / You'd fail / Perfect score" (fail shows `scoring.fail_note`), and
  "Fixing your N Priority items alone would bring you to X" (adds "enough to pass" when it crosses 70). In/Out/N/A tally tiles.
  Fix list grouped by severity with the official correction deadline per group, numbered in global rank order; each card shows
  the fix first, with the rule text + form item # + code ref behind "What the rule says" (always expanded in print).
  Actions: Print or save as PDF (`window.print()`, print CSS hides buttons and adds a dated header), Edit answers, Start over
  (confirm). The bands note sits above the disclaimer. Start screen shows "See my results" when all 47 are answered.
- **Sample result:** `src/data/sample.ts` (8 Out: items 2, 14, 28, 29, 31, 36, 39, 45; N/A: 6, 16, 25 → 85, Yellow, passes).
  The `loadSample` action fills all 47 answers and goes straight to the verdict, with `sample: true` saved alongside the answers.
  While it's set, the verdict shows a blue "Sample results for a made-up kitchen" banner with "Start my own", the score label
  reads "Sample score", and the printed header says "Sample report". Reset clears it, and so does editing any answer
  (the answers are then the user's own).
- **README** is written for someone opening the repo from the job application. It only states what's sourced: it leaves out
  the plan's unverified "Green/Yellow/Red twice a year" claim. Screenshots in `docs/` were taken with reduced motion,
  at 390×844 @2x.
- **Logo is a clipboard, not a checkmark:** a check in a square read as a clickable checkbox.
- **Audit fixes (2026-11-26):**
  - Rubric text corrected against the sources: food handler card within 30 days (not 60); CFM on site whenever open;
    date marking applies to ready-to-eat *TCS* food; vacuum packing only needs a plan past the 48-hour rule; in-use utensils
    may sit in water ≥135°F; hand sinks need a sign; gloves/handwash on task change; medicines stored away from food;
    item 23 code_ref gains 5-202.12 (the 100°F hand-sink rule).
  - Saved state is validated on load (`cleanAnswers` and `reachableArea` in `src/lib/rubric.ts`, tested in `rubric.test.ts`):
    unknown ids, bad values and disallowed N/A are dropped; `areaIndex` is clamped to the first incomplete station.
    The reducer also clamps `goArea` and only allows `finish` when all 47 are answered. Saving is wrapped in try/catch.
  - Verdict tallies count rubric items only. The gated Next button has `aria-disabled`. Primary tap targets are now 44px or more
    (chips, back arrow, "How to check", "Show me"). The favicon is the clipboard logo. The unused `answerMany` action was removed.
  - Left as is (judged fine): the item 1 cooling fix wording, the item 8 receiving temps simplification, and the item 30 permit text.
- **Deploy: GitHub Pages** via Actions (tests + rubric check + build, then deploy). `vite.config.ts` uses `base: './'`
  (relative asset paths), so the same build works at the Pages sub-path, at a root domain, or on Vercel. There's no router, so no SPA fallback is needed.
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
1. Optional: Phase 4 AI layer (see the plan in `resources/`).
2. Confirm Austin's current form edition (Open question A). If it's the 56-item form, scoring needs a rethink.
3. Optional polish from the audit, not yet done: a tick mark at 70 on the verdict gauge; unify the two "Start over" confirm
   messages; real radio keyboard handling (or `aria-pressed` toggles) for the In/Out/N/A buttons.
