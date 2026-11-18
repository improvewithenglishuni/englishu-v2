# Smallpox Reel: script, words, timing

Target words: **ERADICATE** (verb, C1, למגר / לשרש) and **OUTBREAK** (noun, B2, התפרצות).
About 87 spoken words, 8 beats, ~34.6 s + 2.7 s end card. One fact: the scar on grandparents' arms
is the mark of the only human disease the world erased.

The levels are my estimate (the word bank was not reachable): check both words in
`Master_Word_Bank_Difficulty.csv` before recording.

## Script (for recording)

1. תסתכלו על הזרוע של סבא או סבתא. רואים צלקת קטנה ועגולה?
2. זה הסימן של מחלה שהרגה כשלוש מאות מיליון איש במאה ה-20.
3. והיום? אפס חולים בעולם.
4. ב-1796 רופא שם לב שחולבות שנדבקו מפרות, לא חלו בה. ככה נולד החיסון הראשון.
5. ב-1967 העולם החליט: **They set out to eradicate smallpox, for good.**
6. לא מחסנים את כולם. כשהתפרץ **outbreak**, צוות חיסן את כל מי שסביב החולים. מעגל אחרי מעגל.
7. ב-1980 הוכרז: נגמר. המחלה היחידה שהעולם מחק לגמרי.
8. אז בפעם הבאה שתראו צלקת כזו... תזכרו: זה סימן לניצחון.

Facts checked earlier against WHO: Jenner 1796, intensified eradication programme 1967, last natural case
Somalia 1977 (not shown on screen in this cut), declared eradicated 1980, ~300 million deaths in the
20th century (a commonly cited estimate, say "כשלוש מאות מיליון").

## Beat map (seconds are ESTIMATES; retime to the recording)

| Beat | Start | On screen |
|---|---|---|
| 1 | 0.0 | arm with the scar, hook label, arrow to the scar |
| 2 | 3.4 | 300M, "במאה ה-20", paper people |
| 3 | 6.6 | "והיום?", giant 0, the people vanish |
| 4 | 8.4 | 1796, paper cow, "החיסון הראשון" |
| 5 | 13.0 | torn wipe to the dark world, 1967, ERADICATE, `eradicate = למגר / לשרש` |
| 6 | 17.6 | `outbreak = התפרצות`, coral outbreak, three rings of people close around it |
| 7 | 25.0 | rings vanish, 1980, "הוכרז: נגמר", the disease name crossed out |
| 8 | 29.8 | torn wipe back to the light world, the arm returns, "סימן לניצחון" |
| end | 34.6 | end card (public/endcard.png, 2.7 s) |

The English sentence starts at 15.0 s, about 43% in; to get nearer one third, shorten beats 1-4 when recording.

## When the voiceover exists

1. Put it in `public/smallpox-voiceover.mp3` and set `voiceover` in the Studio props.
2. Edit only the `SEC` seconds in `timing.ts` (and the subtitle `from`/`to` in `src/Root.tsx`).
3. Real end card: replace `public/endcard.png`, then `endCard: true` and render all frames.

## Recording tips

- Talk to one curious friend; stress one word per sentence.
- Line 5: slow down on *eradicate*. Line 8: a real pause at the "..." and a falling tone.
- Record two full takes; the edit uses only complete ones.
