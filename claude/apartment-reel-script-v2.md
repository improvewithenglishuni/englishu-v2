# Apartment-price Reel: script v2 (real CBS data, awaiting approval)

v1 is kept in `claude/apartment-reel-script.md`. Changes in v2: the real numbers are in (lines 2, 4, 5), line 3 was reworded, and line 6 was cut (see accuracy notes).

Target word: **EXORBITANT** (one word only). Master Word Bank (Google Sheet, "Adjectives" row 90): **Advanced**; Hebrew gloss on screen **מופקע, מופרז**. The CEFR level is unverified because the CSV was not available.

## Look (v1.1, Sharon Nov 27)
Very light grid: lines `#E8ECF2` on paper `#F7F6F0`. Ballpoint inks: blue `#1F3A8A` for the salary line and its labels, red `#C8322B` for the apartment-price line and its labels. Main writing in charcoal `#3E414C`. Highlighter yellow `#FDF551` for highlights only. One typeface: Playpen Sans Hebrew. Still: `claude/apartment-font-check-v2.png`.

## 1. Recording script (= exact subtitle text), with delivery notes

| # | Line | Delivery |
|---|---|---|
| 1 | כמה שנות משכורת ממוצעת צריך כדי לקנות דירה בישראל? | Real, curious question. Pause 0.4 s. |
| 2 | An average apartment now costs an exorbitant fourteen years of the average salary. | Calm, stress **exorbitant**, small beat before "fourteen years". |
| 3 | כדי לראות איך זה קרה, נתחיל ב-2011, ונשים את מחיר הדירה ואת השכר באותה נקודה. | Storyteller, unhurried. Lean on "באותה נקודה". |
| 4 | משם השכר טיפס בהדרגה, ועלה ב-58 אחוז. | Flat and steady, like the line. |
| 5 | אבל מחיר הדירה ברח קדימה, ויותר מהכפיל את עצמו. | The turn. Speed up on "ברח קדימה", stress "יותר מהכפיל". |
| **Ending A (recommended)** | | |
| 6A | אם יש לכם חבר שחוסך לדירה, שלחו לו את זה, | Warm, as if to a friend. |
| 7A | ותגידו לו: It's not you. The price is exorbitant. | Smile in the voice, pause before "The price", stress **exorbitant**. |
| **Ending B** | | |
| 6B | שלחו את זה להורים, ושאלו כמה שנות משכורת עלתה להם הדירה. | Playful challenge. |
| 7B | Then ask them: did it feel exorbitant back then? | Light question, let it hang. |

About 66 words with ending A. 7 lines, 6 beats.

## 2. Scene table (estimated timing)

| Seconds | Line | On screen | Image type |
|---|---|---|---|
| 0.0-2.8 | 1 | Full-frame photo of a Tel Aviv residential building, taped to the page (white border, washi tape, slight tilt), slow 6% zoom. Yellow sticky note with the question handwritten. | Real photo + sticky note |
| 2.8-4.2 | 2 | Hard cut to the grid page. Title written stroke by stroke: "The EXORBITANT Price of an Apartment". | Handwriting |
| 4.2-5.6 | 2 | On "exorbitant": highlighter swipe over the whole word, gloss "מופקע, מופרז" written under it in red ballpoint. Soft sparkle. | Highlight |
| 5.6-7.0 | 2 | Price-tag doodle draws on: "14.3 שנות שכר ממוצע · 2025" | Doodle |
| 7.0-10.8 | 3 | Chart axes draw on under the title; years run right to left. Both lines sit on one dot at the right edge: "2011 = 100". Legend: "מחיר דירה" red ballpoint, "שכר ממוצע" blue ballpoint. | Hand-drawn chart |
| 10.8-14.3 | 4 | Both lines draw themselves leftward with a slight wobble, a hand-drawn year marker slides 2011 → 2025. On "58 אחוז", "+58%" is written at the blue line's end. | Chart (animated) |
| 14.3-18.5 | 5 | **EXORBITANT acted out:** the red line climbs to its true end value at the top edge, tears through the page and carries the price tag off frame; the highlighted title word jolts as it passes. "+108%" written with an arrow where it exits. The blue line stays small. Soft whoosh #1. | Chart + paper tear |
| 18.5-22.3 | 6 | Hard cut: taped photo of a building with a "for sale" sign (no agency name or phone number), a piggy-bank doodle beside it that stays small. | Real photo + doodle |
| 22.3-26.5 | 7 | Callback: the hook photo and sticky note return; the price tag drops back from the top and lands on the building, with "EXORBITANT" highlighted on it. Held about 3.5 s into the end card. Soft thump on landing. | Real photo + doodle |
| 26.5-29.2 | | End card | Brand |

Total about 29 s.

## 3. Accuracy notes (all data from the Central Bureau of Statistics, accessed 2026-11-27)

**Salary.** CBS Series DataBank, series **615908**: "Labour Data Based on Reports of NII (Economy Classification 2011) > Employee Jobs, Total Wages and Average Wages (Incl. Jobs of Foreign Workers) > Wages Per Employee Job > Total > Absolute Number", **annual, original data, current prices, monthly average, NIS**. The series starts in **2011** (the 2011 economy classification; the earlier series uses the 1993 classification, which is a break, so it is not used). 2011: 8,588. 2025: 13,592. That is +58.3%. This is gross wage per employee job (which CBS notes is lower than the wage per employee).

**Apartment prices (chart).** CBS Price Statistics Monthly No. 10/2026, **Table 2.1 "Dwellings Price Index"**, base average 1993 = 100, with the history sheet "AA.2.1 1994-2010". The index is quality-adjusted and covers new and previously owned dwellings. CBS publishes it bi-monthly. I took each year's annual average as the mean of the 12 published readings that begin in that year (my calculation, shown in `tools/sources/data/apartment_chart_2011-2025.csv`): 2011 = 289.87, 2025 = 601.95. Rebased to 2011 = 100, that gives 207.7 in 2025, so **+107.7%, "more than doubled"**. The methodological updates (2011, 2013, 2017, 2018, the 2023 weights) are chained by CBS into one continuous index, so there is no break.

**Years of salary (line 2).** CBS Table 2.2 "Average Prices of Dwellings", total for Israel, **2025 annual average NIS 2,330.8 thousand**, ÷ (12 × NIS 13,592) = **14.3 years**. "Fourteen years" in the narration; "14.3" on screen. Footnote: since Q4 2022 this average excludes government-subsidised transactions, and it covers 1-6 room dwellings with no quality adjustment.

**Why line 6 was cut.** v1 compared 14.3 years with the 2011 figure. I could not download a 2011 average price from CBS, and the average-price series changed its definition in Q4 2022, so the two figures would not be comparable. The gap is told by the two index lines instead.

**Other checks**
- The narration gives no cause for the rise.
- Lines 4 and 5 compare 2011 with 2025 only. The lines are not smooth: for example, the price index dipped slightly in 2018, and wages jumped in 2020. The chart draws every year as published.
- 2011 is the first year of the break-free wage series, not a year chosen to make the gap bigger. Prices also rose sharply in 2008-2011, before the chart starts.
- 2025 is the last full year. The 2026 readings are still partly provisional, so they are not used.
- The y-axis is to scale; where the red line leaves the page, its true end value (+108%) is written at the exit point.

Raw files are in `tools/sources/data/` and logged in `tools/sources/SOURCES.md`.

## 4. Open decisions for Sharon
1. **Ending:** A or B (A recommended).
2. **Axis direction:** right to left (the series rule) or left to right (the usual reading direction for a year axis)?
3. **Line 2 number:** "fourteen years" spoken, 14.3 on screen. OK?
4. **Hook:** with "ממוצעת" (v1 proposal) or the original wording?
5. **Font for subtitles:** the cursive Hebrew handwriting (ע looks like "3"). OK?
6. **Word level:** "Advanced" in the Google Sheet; CEFR unverified.

## Sound plan (Stage 3)
Her voice only; very quiet room_tone. Marker or pencil strokes for the title, the chart lines and the arrows (variations, never the same file twice in a row). tape_press when photos are taped on. At most two soft whooshes: the tag leaving (line 5) and dropping back (line 7). sparkle_soft on the highlighter swipe, soft_thump_reveal on the landing tag. Nothing on the spoken word "exorbitant" except what belongs to it.
