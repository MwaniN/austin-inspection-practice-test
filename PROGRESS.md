# Progress

_Last updated: 2026-11-26_

## Status
Phase 0 (verify sources) is done apart from one open question that needs the user. Next: Phase 1 (`rubric.json`).

## Checklist
- [x] Read the build plan
- [x] Download DSHS source PDFs into `resources/sources/` and convert them to text
- [ ] Confirm Austin's current form edition (see Open questions)
- [ ] **Phase 1:** `rubric.json`, all 47 items with area, severity, points, code_ref, plain_language, fix
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
- **Code references** come from `resources/sources/Marking-Instructions.txt` (the 47-item guide).
- **Bands:** the plan's Green/Yellow/Red bands aren't confirmed as an official Austin grade. Austin publishes
  only a number. Label the bands "illustrative" in the UI unless that gets confirmed.
- **Fail line:** the plan contradicts itself (70 is in Yellow, but "70 or below fails"). Decision pending; default is to treat < 70 as failing.
- **Stack (proposed):** Vite + React + Tailwind, static, no backend.

## Open questions
- **A. Which form does Austin use today?** I couldn't confirm this online. The Austin "Overview of Changes to TFER"
  PDF now returns 404. The quickest way to settle it is a photo of a recent real Austin Public Health inspection report.
  Failing that, email ehsd.service@austintexas.gov. Until then the 47-item form is a safe basis.

## Next up
Write `rubric.json` from the 47-item form and `Marking-Instructions.txt`, then scaffold the Vite app.
