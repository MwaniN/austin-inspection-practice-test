# Austin Restaurant Inspection — Practice Test (Build Plan)

> A planning brief for Claude Code. Scope is deliberately narrow. Resist feature creep —
> anything not in **In Scope** below is a non-goal for this build.

---

## 1. The problem (locked)

An independent restaurant has no cheap way to find out whether it would pass its health
inspection **until the inspector actually shows up** — by which point a low score is already
posted publicly and already costing it customers.

- The inspection is high-stakes and public: Austin posts a Green/Yellow/Red grade twice a year.
  A Yellow/Red scares off customers and forces a re-inspection.
- The standard is knowable but not known: hundreds of pages of Texas Food Establishment Rules
  (TFER) + Austin city code. Nobody working the line has read it. Turnover makes it worse.
- The only feedback loop is the real inspection. There is no practice test.

**The one thing this tool does:** let an owner/manager self-check against Austin's *actual*
100-point scoring rubric, on demand, and get the verdict the inspector would give — before it counts.

## 2. The user

The **borderline operator** — the one who's one bad walk-in cooler away from a Yellow.
NOT the spotless pro operation (for them this is a vitamin). It's a segment, not every restaurant.
Design the tone and output for someone anxious and time-poor, not a compliance specialist.

## 3. Core user flow (the entire product)

1. User starts a self-inspection.
2. Walks their kitchen, going station by station, marking each inspection item **In / Out / N/A**.
3. Score ticks down live from 100 as "Out" items accrue demerits.
4. At the end: final score, Green/Yellow/Red band, "you'd lose X points," and the failed
   items **ranked by point value**, each with its rule reference and a plain-language fix.

That ranked fix-list is the payoff — it's what the real inspection won't tell you until it's too late.

---

## 4. The scoring model (real — replicate exactly)

Austin uses the standard DSHS Retail Food Establishment Inspection Report. Mechanics:

- **Base score: 100.** Final score = 100 − total demerits.
- **Severity → demerits:**
  - Priority (P) = **3** points
  - Priority Foundation (Pf) = **2** points
  - Core (C) = **1** point
- **Bands:** Green = 90–100, Yellow = 70–89, Red = under 70.
- **Thresholds:** 70 or below = failing / triggers follow-up; losing more than 30 points
  requires a re-inspection to get back above 70.
- Each item can be marked In (compliant), Out (violation → deduct its points), or N/A.

> ⚠️ **Verify first (open question A):** there are two editions of the form in circulation —
> a **47-item (2015)** version and a newer **56-item (2021)** version based on the 2017 FDA
> Food Code. Confirm which one **Austin uses today** and build to that one, so the practice
> test matches the current real inspection.

## 5. The content spine — `rubric.json`

The rubric is the product. Everything else is a shell around it. It is **public** and already
structured — you are transcribing, not inventing.

**Authoritative sources:**

- DSHS 47-Item Inspection Report (Form EH-06):
  https://www.dshs.texas.gov/sites/default/files/foodestablishments/pdf/47-Item-Inspection-Report-2015.pdf
- DSHS Marking Instructions (33 pp — defines each item + its P/Pf/Core designation + TFER / FDA code section):
  https://www.dshs.texas.gov/sites/default/files/foodestablishments/pdf/Marking-Instructions.pdf
- DSHS 56-Item Marking Instructions (2021, if Austin is on this edition):
  https://www.dshs.texas.gov/sites/default/files/foodestablishments/pdf/GuidanceDocs/56-Item-Marking-Instructions_Version_1_0_20210721---FINAL.pdf
- Austin "Overview of Changes to TFER" (confirms 47 items; P=3, Pf=2, Core=1 for Austin):
  https://austintexas.gov/sites/default/files/files/Health/Environmental/Food/Overview_of_Changes_to_TFER.pdf
- Austin City Code Chapter 10-3 (Food Code) — local layer, via austintexas.gov / ecode360
- TFER full text (25 TAC Chapter 228) — Texas Secretary of State / DSHS

**Proposed schema:**

```json
{
  "jurisdiction": "City of Austin, TX",
  "form": "DSHS Retail Food Establishment Inspection Report (EH-06)",
  "edition": "VERIFY: 47-item (2015) or 56-item (2021)",
  "scoring": {
    "base_score": 100,
    "method": "subtract_demerits",
    "severity_points": { "priority": 3, "priority_foundation": 2, "core": 1 },
    "bands": [
      { "label": "Green", "min": 90, "max": 100 },
      { "label": "Yellow", "min": 70, "max": 89 },
      { "label": "Red", "min": 0, "max": 69 }
    ],
    "reinspection_note": "Score <= 70 fails; losing more than 30 points requires re-inspection"
  },
  "items": [
    {
      "id": 1,
      "area": "Supervision",
      "text": "Person in charge present, demonstrates knowledge, performs duties",
      "severity": "priority_foundation",
      "points": 2,
      "code_ref": "TFER 228.x / FDA 2-101.11",
      "plain_language": "Someone trained in food safety must be on site and in charge.",
      "fix": "Make sure a certified person in charge is scheduled on every shift.",
      "allows_na": false
    }
  ]
}
```

Group `area` values around how a manager actually walks the kitchen (e.g. Supervision,
Employee Health & Hygiene, Handwashing, Temperature / Cold Holding, Temperature / Hot Holding,
Cooling & Reheating, Cross-Contamination, Date Marking, Chemicals, Equipment & Utensils,
Facilities & Plumbing, Pest Control).

---

## 6. Architecture

Keep it a single-page app driven by `rubric.json`. No database.

- **Phase 1–3 (core): fully static.** HTML/JS (or a light framework) + `rubric.json`. No backend
  needed — scoring is pure client-side arithmetic. This alone is a complete, demoable product.
- **Phase 4 (optional AI layer): add a small FastAPI backend** (fits the Python/asyncio stack) that
  answers "does my setup count as a violation?" and generates per-item fix explanations, grounded
  (RAG) in the public TFER / Chapter 10-3 text. Only add this if there's time; the core stands without it.

Keep markup, state, and logic simple. State can live in memory — no persistence required for a demo.

## 7. Build phases (ordered)

- **Phase 0 — Verify.** Confirm current Austin form edition (47 vs 56 item). Pull the authoritative
  item list + P/Pf/Core designations + code refs from the Marking Instructions.
- **Phase 1 — `rubric.json`.** Transcribe every item: text, area, severity, points, code_ref,
  plain_language, fix. This is the bulk of the real work.
- **Phase 2 — Self-inspection UI.** Items grouped by area; In / Out / N/A per item; live running score.
- **Phase 3 — Verdict screen.** Final score, band, total points lost, failed items ranked by point
  value, each with its fix. (Minimum shippable demo = Phases 1–3.)
- **Phase 4 — AI layer (optional).** Grounded fix explanations + "is this a violation?" Q&A.
- **Phase 5 — Polish (optional).** Mobile-friendly for walking the kitchen; export/print the result.

## 8. Explicit non-goals (do NOT build)

- **Score lookup / benchmarking against other restaurants.** Austin already posts scores publicly;
  showing them back solves nothing. Also, the open dataset has only overall scores — **no
  violation-level detail** — so "what gets cited near you" is not buildable from it anyway.
- **Staff training / LMS.** Teaching staff the rules is a different product. Out of scope.
- **Live POS / invoice / sensor integrations.** None. All content is public; no integrations.
- **Multi-jurisdiction support.** Austin only. The depth in one jurisdiction is the point.
- **Accounts, persistence, backend data storage.** Not needed for the demo.

## 9. Open questions to resolve during planning

- **A.** Which form edition does Austin currently use (47-item 2015 vs 56-item 2021)?
- **B.** Does Austin apply any local point-weight deviations from the standard DSHS 3/2/1, or
  use the state form as-is? (Cross-check Austin's posted current inspection form.)
- **C.** Include the optional AI layer (Phase 4) in the demo, or ship Phases 1–3 only?

## 10. Context

- This is a **demonstration** project, not (yet) a business. Optimize for a crisp, legible demo
  that visibly solves the one problem above — not for defensibility or market size.
- Builder environment: Python / asyncio, WSL + VS Code, Claude Code.
