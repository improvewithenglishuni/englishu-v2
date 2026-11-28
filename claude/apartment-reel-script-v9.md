# Apartment-price Reel: script v9 (mock-up v9)

Based on v8 (v6 chart + v7 first frame). Changes from Sharon's Nov 28 notes:
- Hook question: **כמה שנות משכורת צריך כדי לקנות דירה בישראל?**, on the outro's torn paper strip
  (`public/brand/torn_strip.png` = end-card asset `tag_photo.png`, same 1200 × 256 size and tape piece), highlighter on
  "שנות משכורת".
- Price on the tag slightly smaller; the tag hangs from the 2nd-floor balcony of the right-hand building.
- Across the cut the same tag slaps onto the notebook page (paper sound), then leaves after about 2 s (soft whoosh).
- 1995-2007 in 4 s, then about 1 s per year from 2008.
- DISCREPANCY → **DISPARITY**. It lands only once prices lead salaries by 45 index points (2016-17), with a soft thump.
- The gap bar: yellow highlighter while prices lead; pale blue, hatched and dashed while salaries lead (1996-2011).
- The y-axis now has a value every 50%. The value of the last threshold passed by the top line of the gap is bold (red
  when prices lead, blue when salaries lead); the previous one goes back to normal.
- Payoff: push-in on the gap from 2018 to 2025 and a shake + stamp thud at the 2021-2022 break-away.
- The small EXORBITANT callback tag at the end is removed.
- Last 2 s before the end card: sticky note **תייגו חבר שחוסך לדירה** (tape sound), chart dimmed slightly.
- Total 33.4 s (story 29.2 s + end card 4.2 s).

## Spoken lines
1. כמה שנות משכורת צריך כדי לקנות דירה בישראל?  *(0-3.2 s, on the strip)*
2. Apartment prices in Israel have become exorbitant.  *(after the cut)*
3. Watch the disparity between prices and salaries.  *(as DISPARITY lands, about 2016-17)*
4. ואז המחירים זינקו.  *(over 2021-2022, with the shake)*
5. תייגו חבר שחוסך לדירה.  *(last 2 s)*

## Open
- The new hook asks *how many years of salary*, but the chart never answers it. The verified answer is 14.3 years
  (CBS, 2025: average price ₪2,330,800 ÷ 12 × ₪13,592). Suggest adding it as one short line or a note at 2025.
- No Hebrew gloss under DISPARITY in this version (the v6 chart had none); the series rule asks for one (פער).

## Mock-up v10 (Sharon, Nov 28; same script as v9)
- The hook strip is taller (350 px image, text inside it) and tears on exactly like the outro's handle strip: a ragged
  tear line rips across left to right in 12 frames while the free end lifts, then it bobs and settles and the tape
  stretches on (ported from `end-card/src/card.html`, frames 40-58 there = 0-18 here).
- Colours: while salaries lead, the bold y value and the hatched gap bar are **green** (#2E8B57); once prices lead, the
  bold y value, the gap bar and the DISPARITY label are **crimson** (#D7153A). Line colours unchanged.
- The slow-down around 7-8 s was the hard switch from fast to slow plus an ease-in that nearly stopped the counter. The
  year now follows a speed curve that eases from fast to slow over about 1.3 s, so it never stalls.
- The push-in (zoom) is removed completely; the shake and thud at 2021-2022 stay.
- The tag's drop is damped so it no longer flashes at the bottom of the frame.
