# Apartment-price Reel: script v6 (mock-up v6)

Earlier versions kept (v1-v5). Changes from Sharon's Nov 28 notes (fourth round):
- EXORBITANT on the tag is written in a permanent-marker font (Permanent Marker, @fontsource/permanent-marker), as a
  diagonal scrawl in the white box. This is the one exception to "one typeface per video".
- One whole white line under PRICE on the tag.
- The chart now starts in **1995** (Sharon: "even in the 90s is fine").
- Total 34.2 s (story 30.0 s + end card 4.2 s).

## Recording script (spoken; only line 1 is on screen, on the cloud)
1. חוסכים לדירה ומרגישים שאתם אף פעם לא מגיעים?  *(0-3.2 s)*
2. Apartment prices in Israel have become exorbitant.  *(right after the cut)*
3. Watch the discrepancy between prices and salaries.  *(as the DISCREPANCY label lands, about 1998-99 on the slider)*
4. ואז המחירים זינקו.  *(over 2009-2011, when the red line takes off and crosses the blue one)*

## What the data shows (1995 = 100)
| | 1995 | 2008 | 2011 | 2025 |
|---|---|---|---|---|
| Apartment prices (CBS Dwellings Price Index) | 100 | 132 | 195 | 405 (+305%) |
| Average wage per employee job (CBS, linked) | 100 | 183 | 197 | 312 (+212%) |
For about 13 years salaries rose faster than apartment prices (prices were nearly flat 1997-2007). From 2008 prices
took off; the lines cross in 2011-2012 and then the gap opens. The DISCREPANCY bar tracks the gap in both directions.
Line 4 ("ואז המחירים זינקו") is true for 2008-2011: the index rose from 122.8 (2007) to 195.2 (2011) on the 1995 base.

## How the wage series was built (no extrapolation was needed)
CBS publishes the average monthly wage per employee job in four pieces. All four are in
`tools/sources/data/` and the linked result is `apartment_chart_1995-2025.csv`.
| Years | CBS series | How it is used |
|---|---|---|
| 2011-2025 | 615908 (Economy Classification 2011), annual | as published |
| 2004-2010 | 45637 (Economy Classification 1993), annual | × 1.00292, the ratio of the two series in their overlap year 2011 (8,588 / 8,563) |
| 2002-2003 | 45002 (1993 classification, processing system from 2002), monthly → annual average | × 1.01012, the overlap ratio in 2004 (7,050.4 / 7,000.0), times the factor above |
| 1995-2001 | 30014 (1993 classification), monthly → annual average | same factor as 2002-2003. **No overlap year with 45002**, so this join assumes continuity at 2001/2002. The monthly levels match closely (Dec 2001: 7,272.8; Jan 2002: 7,217.8 NIS) |
Every year has real CBS data; nothing is estimated. The splice affects levels by at most about 1%.
The 2002-2003 dip in wages is real (it is in the CBS data, during the 2002-2003 recession).

## Open
- On screen the sub-title says "Israel · growth since 1995 · CBS data". The linking is documented here and in
  SOURCES.md; say if you also want "wage series linked" written on screen.

## Mock-up v8 (Sharon, Nov 28): v6 chart + v7 first frame
- The chart part is exactly v6 again (1995 start at about 0.7 s per year, DISCREPANCY label from 3.8 s after the cut,
  year slider, small EXORBITANT tag at the end). The v7 chart changes (fast-forward, DISPARITY, push-in, EXORBITANT
  moment, share note) are reverted; they remain in `ReelV7.tsx` if wanted later.
- First frame from v7: painted street, big Rubik hook on a torn paper strip with a highlighter swipe on "אף פעם",
  the red price tag slamming in with the price counting up to ₪2,330,800 (CBS average 2025), now with a third palm
  tree, and only the price on the tag (the Hebrew line under it is removed).
- Sound: only the hook's tag thud and count tick, plus the end card's own sound.
- Spoken lines: as in v6 (see above). Total 34.2 s.
