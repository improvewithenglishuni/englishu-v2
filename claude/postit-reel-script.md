# Post-it Reel (Reel 6): script v1 (from mock-up v1)

Target words: **ADHESIVE** (B2, levels unverified: the word bank CSV was not available in this session) and **DISMISS** (C1, unverified).
Source of the wording: the approved silent mock-up `postit-mockup-v1.mp4` (subtitle text, transcribed frame by frame).
Timing below is the mock-up's timing, compressed slightly so story + end card = 35.0 s. It will be retimed to Sharon's recording.

## Recording script (= subtitle text)

1. איך דבק שנכשל הפך לפתק הצהוב שנמצא על כל שולחן עבודה?
2. לפני יותר מחמישים שנה, מדען בחברת 3M ניסה להמציא דבק חזק במיוחד.
3. He wanted a super-strong **adhesive**, but he created one that peeled off easily.
4. והדבק החלש הזה? כמעט אף אחד לא רצה אותו.
5. Most people **dismissed** it as useless.
6. עד שכמה שנים אחר כך עמית שלו, ארט פריי, שר במקהלה,
7. והסימנייה שלו כל הזמן נפלה מהספר.
8. הוא נזכר בדבק החלש, והסימנייה נשארה במקום.
9. כך נולד הפתק.
10. שלחו את זה למי שחושב שהרעיון שלו לא מספיק טוב.
11. אולי הוא פשוט עוד לא מצא לו בעיה.

About 85 words. 11 lines in 10 beats (lines 10 and 11 share the callback beat).

## Scene table

| s | Line | On screen | Image type |
|---|---|---|---|
| 0.0-3.3 | 1 | Post-it pad, top note's corner peels up, yellow glow ring on the corner | drawn sticker on crumpled plate (photo slot `public/postit/photos/hook.jpg`) |
| 3.3-6.9 | 2 | Periwinkle lab plate, tag "1968 · מעבדת 3M", glue jar, test rig holding a KG weight | cutout stickers |
| 6.9-10.3 | 3 | ADHESIVE + gloss דבק; a note sticks to a page, peels off with a flick, sticks back | word slide, acted out |
| 10.3-13.7 | 4 | Dark plate: the jar alone on a shelf, dust falling, cobweb, yellow "?" | cutout stickers |
| 13.7-18.0 | 5 | DISMISS + gloss לפסול / לדחות; a hand pushes the glue sample right-to-left into a bin | word slide, acted out |
| 18.0-20.8 | 6 | Choir loft, tag "1974 · מקהלת הכנסייה", name tag "ארט פריי" on one singer | drawn (photo slot `choir.jpg`) |
| 20.8-23.8 | 7 | Hymnal; the paper bookmark slides out and falls to the left | sticker |
| 23.8-25.8 | 8 | Bookmark comes back with a yellow glue strip, presses on, book shakes, bookmark stays | sticker |
| 25.8-28.7 | 9 | Bookmark turns into a yellow sticky note, sparkle, tag "1980 · בחנויות בכל ארה״ב" | sticker |
| 28.7-32.3 | 10-11 | Callback: the hook pad returns; the top note peels off, a light bulb is drawn on it and it flies out | drawn (photo slot `hook.jpg`) |
| 32.3-35.0 | | End card | brand |

## Accuracy notes
- Spencer Silver (3M) was asked in 1968 to develop a super-strong adhesive and made a weak, re-stickable one instead. 1968 is "more than fifty years ago". Sources in `tools/sources/SOURCES.md`.
- He spent years promoting it inside 3M with little interest ("a solution without a problem"): "almost nobody wanted it" and "most people dismissed it" are fair.
- Art Fry, a 3M colleague, sang in his church choir; in 1974 he used the adhesive to keep bookmarks in his hymnal. The bookmark story is company lore, repeated in every source; told here as Fry's own account.
- The narration does not name Silver. On screen he is "a scientist at 3M" only.
- 1980: Post-it Notes launched across the US (test-marketed 1977 as "Press 'n Peel"). The tag says "1980 · in stores across the US", which is the documented date.

## Open decisions
1. Real photos: drop crisp photos into `public/postit/photos/` (`hook.jpg`, `choir.jpg`) and they replace the drawn version automatically. The sandbox cannot download photos.
2. Voiceover: record lines 1-11; save as `public/postit/vo.wav` and I retime every beat to it.
3. Confirm the word levels (ADHESIVE B2, DISMISS C1) against the word bank.
