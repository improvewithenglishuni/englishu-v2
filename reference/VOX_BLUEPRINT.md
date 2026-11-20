# Vox-style Reel blueprint (self-contained, v2)

Everything needed to make a new EnglishU Reel. No past video is required as a reference: these rules
ARE the reference. Distilled from 18 real Vox stills Sharon supplied plus the approved smallpox v2 build.
If this file and an old memory disagree, this file wins. The old newsprint/mustard/vermilion palette is retired.

## 0. Draft first (before any code)
Write the full script and a play-by-play table (second, narration = subtitle, what is on screen, image type) and READ it top to bottom as a story: does every beat follow from the previous one? Fix gaps, then code. Template: `src/reels/Smallpox/SCRIPT.md`.
Content rules checked in the draft:
* **No redundant text.** On-screen words must add something the subtitle does not say. Never repeat the subtitle as a title or quote.
* **Numbers only while narrated.** A counter or figure appears exactly when the narration says it (the 300M tally runs on "300 million", then counts down on "zero"); never show a stat before or unrelated to the line.
* **Dates:** show only what the narration needs (the year, not day and month).

## 1. The look
* **Palette (measured from real Vox stills, theme `vox`):** light plate `#EDEEF3`, dark plate `#3A3C4A`, charcoal `#353336`, periwinkle `#A1ACCA`, paper `#F4F3F9`, white `#FCFCFC`, slate ink `#3E414C`, steel blues `#7894C3 / #4E669B / #687698`, ONE warm accent coral `#E0615E`, highlight yellow `#FDF551` (rings/glows only), count-up red `#D6403B` (also the stamp). Brand navy/red only on logo and end card.
* **Plates:** `Scene` = hard cut with its own plate (light / dark / peri / charcoal) and its own slow push (1.00 -> 1.06). Cuts, not wipes. Every frame has visible paper texture; no flat fields.
* **Typeface: one per video, different between videos.** `Theme.typeface`: `modern` = Rubik (+Heebo) for modern topics (airplane); `historic` = David Libre (+Frank Ruhl) for historic topics (smallpox). `<World>` sets `--kit-font`, so all kit text follows it. Never mix. Themes: `vox` (historic), `vox-modern` (same plates, Rubik).
* **Push and pull (the core rhythm).** Alternate FULL-FRAME real images (paintings, engravings, photos, maps, filmed archive) with ANIMATED magazine-cutout graphics (torn white border, drop shadow, slight rotation: scar arm, people, syringe, quote card, folder cards, clippings). Never two static images in a row; never a long run of only graphics.
* **Real images:** full-frame historical images; key people as duotone cutouts on a plain background (`QuoteCutout`). Also available: `WorldMap`, `LineChart`, `People` pictograms, `FolderCards`, `SplitCompare`, `CountUp`.
* **Never a wide image band with empty margins above and below.** An image either fills the whole 1080x1920 frame, or it is a die-cut/bordered sticker on a plain or clipping plate. (`PictureBand` is retired.)
* **People:** a shown person is named on screen (name + title in `NameLabel`, a black slab) and sits as a die-cut sticker on a magazine/newspaper clipping plate (`variant="clip"`, a `Disc` of yellow behind). No unnamed portraits.
* **Real objects as stickers:** use a real photo as a die-cut sticker on a plain plate (`ScarSticker`: real arm photo, scar glow and slow push-in; no dashed rings, no outlines).
* **Sharpness rule: only crisp images.** Never use a blurry internet image. If a source is small, do NOT blow it up to 1920 px: show landscape images at full width and about 1:1 (`PictureBand`), or use it as a small cutout. A portrait/full-height use needs a source of at least ~1080 px on the short side. If no sharp source exists, use a graphic instead and ask Sharon for a high-res file.

## 2. Two target words per video
Every Reel has exactly TWO English target words, both from the word bank, each acted out with its own treatment (smallpox: ERADICATE and VACCINATION).
* `ActionWord mode="vanish"`: the letters dissolve one by one until the word is completely gone (ERADICATE). Also fine: scatter, fall, split, converge: the motion must act out the meaning (like DISPERSE). No decorative lines or roots under the word. (`uproot` exists but is retired: it read as odd.)
* `ActionWord mode="pop"`: letters pop in, a root/part turns coral, a gloss line explains the word (VACCINATION, vacca = cow).
* `Stamp`: red block-letter rubber stamp, slams in with a bounce; restate the main word once near the end (ERADICATED), as a "classified" stamp over the map after the whole map turns grey (`WorldMap greyAt`). The year (only) appears below it. Once per video.
* The English sentence with the first word lands about one third in; the Hebrew gloss is on screen only. Check etymology claims (VACCINE was Jenner's adjective from Latin vacca; the noun "vaccination" came slightly later, Dunning 1800).

## 3. The hook (first 2-4 s)
A strong visual: a real image of the thing as a die-cut sticker (`ScarSticker`: real arm photo with scar glow). The surprising number comes in the next beat, when it is narrated. The narration challenges an assumption.

## 4. Script to scene table (write first)
| Beat | Seconds | Narration | Visual (real image / cutout / graphic) | Entrance |
Rules: <= ~90 Hebrew words, <= 8 beats, ONE surprising fact, two target words, total including the 2.7 s end card <= 35 s (story <= 32.2 s), callback ending. Timings are estimates until her voiceover exists; retime `SEC` in `timing.ts`.

## 5. Photo pipeline
1. Pick public-domain or properly licensed images (Wellcome Collection, NASA, CDC, LoC, Wikimedia). Log source and licence in `tools/sources/SOURCES.md` (CC BY needs attribution).
2. If the shell cannot reach the site (the container allows only GitHub, npm, PyPI), use the Higgsfield sandbox as a free file courier: download there, print base64 lines `NNN <90 chars> <2-hex checksum>`, save to `tools/sources/b64/<name>.txt`, rebuild with `python3 chk2.py <name>` (verifies every line). No credits, no generation. Transfer size is the bottleneck, so ask for the largest size you can move and check sharpness yourself.
3. Cutouts of people: duotone, feathered edge, plain background (`QuoteCutout`). Pictures: `PictureBand` or `FullFrameImage`.

## 6. Components (src/kit)
`World, Scene (plates light/dark/peri/charcoal/clip), Subtitles (variant box), SerifTitle, SansHeading, ActionWord, Stamp, ScarSticker, Sticker, Disc, NameLabel, Tally, CountUp, FullFrameImage, QuoteCutout, People/Person/Ring/Syringe, WorldMap, LineChart, FolderCards, SplitCompare, Highlight, EndCard`. Keep content above y = 1480 (only subtitles below) and the right 130 px clear.

## 7. New topic checklist
1. Pick typeface (modern or historic), theme `vox` or `vox-modern`.
2. Choose the fact, two target words, hook visual; write the scene table.
3. Collect crisp images; make cutouts; build scenes (one `Scene` each).
4. Stills of every beat (`REMOTION_LOCAL_FONTS=1 npx remotion still <Comp> out.png --frame=N`), fix collisions, render with `--concurrency=1`.
5. QA gate: (a) every frame textured, no flat field, (b) one typeface, vox palette plus one accent, brand colours only on end card, (c) every image sharp, (d) push/pull between full-frame real images and animated cutouts, (e) something new every 1.5-4 s, (f) two target words each animated, (g) strong hook, (h) <= 35 s, nothing but subtitles below y 1480, (i) no ornament unrelated to the topic.
6. Sound: her voice only, quiet original bed, one soft paper sound per cutout entrance, at most two whooshes.

## v4 rules (Sharon feedback, 2026-11-19)
- Every image must visualize and relate to the narration (cowpox -> milkmaids, not a generic painting).
- Historical reels include real images of the topic itself (what smallpox looked like).
- Chart the key quantity when there is one (cases fall to 0 in 1980), data from a named source.
- Any date on screen needs its significance shown (WHO 1967 label), not a bare year.
- No title on slides that are not the subject; no dashed outlines; animate the action (needle moves person to person).
- Word slides stay >= 3 s; target word gets its own accent colour (ERADICATE yellow on dark); word cards are jagged magazine-cut.
- Cut-out stickers: let cut ends fall off-frame; never show a severed limb.
- Big numbers sit on a crowd that disappears as the number falls.
- No coloured disc behind portraits.

## Accuracy rule (Sharon, 2026-11-19): 100% accurate, no exceptions
Literally every piece of information in a reel must be true and verified against a named source before it ships: narration, subtitles, labels, numbers, dates, captions, chart values, map graphics and what each image is or shows. Visuals must never imply a false fact (example: a vaccination scar is a sign of the SOLUTION, the vaccine, never of the disease; map dots only on countries where the disease really was endemic). If a fact cannot be verified, change the line or cut it. Qualify honestly ("reported cases", "natural case", "in the 20th century"). Flag any image whose identity or provenance is unverified, and log sources in `tools/sources/SOURCES.md`.


## Zoom only where needed
**Zoom only where it is needed.** No automatic push/zoom on every scene (set `push={[1, 1]}`). Use a zoom only when it carries the meaning: the scar close-up, the ring-vaccination (outbreak) scene, the map zoom to Somalia. Charts and still photos stay still; the graph animation is enough.
