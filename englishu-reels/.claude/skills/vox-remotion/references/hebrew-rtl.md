# Hebrew RTL narration and text, with English vocabulary

Read alongside `remotion-markup/arabic-text.md` (the official RTL guidance,
which covers Hebrew).

## Rendering rules

1. **Every Hebrew container gets `dir="rtl"` and `lang="he"`.** Word-by-word
   animation puts words in `inline-block` spans, which are neutral to the bidi
   algorithm; without a base direction the sentence renders backwards even
   though each word looks right. `RtlText` and `CaptionChunk` already do this.
2. **English inside Hebrew is an LTR island.** `tokenize()` groups consecutive
   Latin words into one unit ("skinny jeans" stays in order) and the span gets
   `dir="ltr"`, the English font (Anton) and the accent color.
3. **Hebrew prefixes on English words** ("ה-deadline", "ב־jeans"): write them
   with a hyphen or maqaf (־) attached; the token stays Hebrew-direction and
   renders correctly ("deadline-ה" visually, read right-to-left). Avoid
   splitting the prefix into a separate word.
4. **Animate words, never letters.** Hebrew has no joining like Arabic, but
   niqqud (vowel marks) must stay with their letter, and final forms
   (ך ם ן ף ץ) must not be separated. Word-level is the rule; letter-level
   only for a single English word in an LTR container.
5. **Punctuation:** inside a `dir="rtl"` container, "?" and "." land at the
   left end automatically. If a line starts or ends with an English word,
   punctuation can jump; fix by making the punctuation part of the Hebrew
   token or adding a Right-to-Left Mark (`‏`) after it.
6. **Numbers and years** render LTR inside RTL automatically ("ב־1864").
   For ranges and math, wrap in a `dir="ltr"` span.
7. **Alignment:** Hebrew headlines align right (`align="right"`), but the
   right edge is where Instagram's buttons sit — `SAFE.right` (150 px) is
   already in the scene padding. Captions are centered.
8. **No `letterSpacing` or `textTransform` on Hebrew.** Bold weights only for
   display (Secular One, Heebo 800–900); Hebrew at weight 400 looks thin on a
   phone.
9. **Fonts are local** (`public/fonts`, loaded in `theme.ts`). A Hebrew font
   missing from the render machine falls back silently; fetch-fonts prevents it.

## Charts, arrows and layout direction

- Order sequences right → left (first item on the right): `BarChart rtl`
  is on by default; timelines run right → left; "before → after" puts
  *before* on the right.
- Arrows that mean "progress" point left. Slide-in directions for a
  sequence come from the right.
- Maps and real geography are NOT mirrored.

## Weaving English into Hebrew (script rules)

The goal is a natural Israeli-teacher voice: Hebrew carries the story,
English words appear where a fluent speaker would naturally use them, and
each target word is taught by context, not by a dictionary dump.

- **2–4 target words per Reel** (B2–C1). One per evidence scene at most.
- **First mention:** the English word inside the Hebrew sentence, followed by
  the visual payoff on screen (`VocabCard` with the Hebrew meaning). The
  narration may gloss it lightly ("deadline — מועד אחרון —") only when the
  meaning is not clear from context.
- **Second mention:** later in the Reel, used again without a gloss, so the
  viewer retrieves it.
- **Pronunciation:** the narrator says the word in natural English, not
  Hebraized. The `VocabCard note` can show stress ("DEAD-line") or a short
  IPA.
- Don't stack English: one English word or phrase per sentence, never a
  fully English sentence (unless it is a quote that is the hook).
- Captions show the English word in Latin letters (never transliterated
  into Hebrew letters).

## Caption chunks

- 2–5 words per chunk, maximum two lines at 66 px.
- Break at natural pauses (commas, before "ו", before the English word if the
  phrase is long).
- An English target word should start or end a chunk, not be split from its
  prefix.
- Set `at` for chunks that must hit a beat exactly; leave the rest to the
  automatic spread (proportional to text length across the voice).
