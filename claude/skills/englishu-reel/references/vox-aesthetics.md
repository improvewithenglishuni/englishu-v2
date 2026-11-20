# Vox aesthetics: the inspiration set (Nov 2026)

Sharon shared five frames from a Vox explainer (the "fastest animal" peregrine falcon video) as the target look. What makes them Vox is not any one technique but how several image types share one restrained system: black, white and grey, ONE yellow, two type families, and graphics drawn over or around real material. Read this before designing a Reel's scenes, and pick 4-6 of the treatments below per Reel.

## The six image treatments

| # | Treatment | What it looks like | How to build it |
|---|---|---|---|
| 1 | **Ink line illustration on black** (cheetah frame) | A clean black-and-white engraving / pen drawing of the subject, high contrast, on a near-black ground. Background shapes (sun, bushes, grass) are grey, scratchy, scratchboard-like textures with rough torn edges, not flat fills. | Public-domain engravings (old natural-history plates) inverted or tinted; scratchy textures from a dry-brush plate. Never a vector cartoon. |
| 2 | **Painted field-guide illustration** (falcon on grey) | A watercolour/gouache naturalist painting of the subject, die-cut and given a hand-drawn **yellow offset outline** (a sticker line a few px outside the silhouette, slightly wobbly). Sits on a pale, mottled grey paper (smooth, no creases). | Audubon-style public-domain plates or painted art; outline drawn as a wobbly SVG stroke that draws on. |
| 3 | **Real document as evidence** (PLOS ONE figure, "stoop") | A photographed page of a real paper or archive, filmed with shallow depth of field (top and bottom blurred), visible paper grain. One key word set huge in black bold italic serif on a **rough yellow highlighter brush stroke**. | Real public-domain documents (papers, journals, 18th-century plates); CSS blur bands top and bottom; brush stroke as a displaced SVG shape that wipes on in reading direction. |
| 4 | **Scribble / rotoscope animation** (falcon dive sequence) | Ghostly white pen-loop line drawings of the animal, several overlapping strokes per outline ("boiling" lines), shown as a chronophotography sequence of 3+ poses fading behind the leading one. A **yellow hand-drawn spiral or path line** draws on to show the trajectory; tiny yellow speed marks. Background: black with faint diagonal dry-brush streaks. | SVG paths drawn 2-3 times with different `feDisplacementMap` seeds, the seed changed every 4 frames for the boil; earlier poses at 20-40 % opacity. |
| 5 | **Annotated real footage** (falcon close-up, nictitating membrane) | Real video or photo, natural colour, slight grain. A bold yellow sans label **types on** letter by letter with an italic serif sub-label in white beneath it (the term, then the gloss in brackets). A thin yellow hand-drawn pointer line runs to the exact detail. | Clip-path reveal for typing; pointer as a draw-on stroke. Labels sit beside the subject, never over it. |
| 6 | **Magazine-cutout photo** (implied across the set) | Real photographs treated as clippings: torn or die-cut edges, a thin white border, soft drop shadow, a few degrees of rotation, layered over a plate rather than floating on a blank field. | `tornClip()` polygon, 8-12 px white border, drop shadow, rotate -4 to +4°. |

Kinetic type is the glue: in the cheetah frame the headline arrives **word by word** in bold yellow sans, each word on a slightly different baseline, as the narrator says it.

## Typography

- **Display grotesque, heavy** (Vox uses a custom bold grotesque): headlines, target words, labels. Use **Rubik 900** (has Hebrew and Latin, so one family covers both). Yellow on dark, black on light; tight leading.
- **High-contrast Didone serif, italic**: captions, sources, dates, glosses, data values in brackets, e.g. *(530 to 1,600 g)*, *Vancouver Aquarium, 2006*. Use **Playfair Display Italic 700/900** for English. For Hebrew use **Frank Ruhl Libre 700/900** upright; Hebrew has no true italic, never slant it.
- A key word on a highlighter stroke can be the serif in black (the "stoop" frame); a target word acted out in motion is the grotesque in yellow.
- Data box: thick black (or white on dark) rectangle, label in serif italic, number in bold sans, a dashed leader line from the box to the subject (falcon frame).
- Subtitles: Rubik 700, white with a black stroke, the target word in yellow 900.

## Palette

Black / ink `#111214`, field-guide grey `#E3E3E0`, white line `#F2F2EE`, and **one accent: Vox yellow `#F7E21B`**. The yellow marks only what the narration points at: a ring, a path, an outline, a label, the target word. Real photos keep their natural (slightly desaturated) colour; graphics stay monochrome plus yellow. Brand navy and red only on the end card.

## Grounds (plates)

Use only visually general grounds that could belong to any topic: smooth ink black with faint diagonal dry-brush streaks, or pale mottled field-guide grey. No crumpled or creased paper (that belonged to the bee Reel's world). Film grain over everything at about 9 %, a light vignette.

## Balance rule (how the treatments work together)

Alternate media leads beat by beat (real photo, drawing, real footage, document, drawing...) and let them overlap inside a frame: draw on the photo, put the photo inside the graphic. Example from the otter Reel:

| Beat | Lead | Graphic layer |
|---|---|---|
| Hook | real photo (clipping over its own blurred copy) | caption in serif italic, zoom + yellow ring on the paws |
| Raft | full-frame real photo | yellow bracket + typed label "בקבוצות (a raft)" |
| Current | real USFWS footage | white hand-drawn current lines flowing right to left |
| DRIFT | scribble otters on ink | the word splits and drifts with them, gloss box |
| Paw in paw | photo clipping on field-guide grey | yellow sticker outline, data box with dashed leader |
| Twist | blurred real photo | "נדיר" in serif on a yellow brush stroke |
| Kelp | full-frame real photo | yellow kelp line drawn down to a hand-drawn anchor |
| Mother | Steller's 1751 engraving (archival) | yellow ring on the pup, serif source line |
| Dive | scribble sequence on ink | yellow spiral path, kelp wraps the pup |
| BOND | photo clipping | yellow loop ties mother and pup, chain links lock the letters |
| Callback | hook photo | zoom out, ring and a knot tie the paws |
