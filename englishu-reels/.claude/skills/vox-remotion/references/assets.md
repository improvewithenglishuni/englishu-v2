# Assets: archival imagery, cutouts and props (free, local)

Everything a Reel shows lives in `public/reels/<slug>/`:

```
public/reels/<slug>/
  images/     original downloads (keep for re-cutting)
  cutouts/    transparent PNGs (background removed)
  props/      SVG or PNG props reused across scenes
  vo/         voiceover files, one per scene
```

Reference them with paths relative to `public/` (e.g.
`"reels/jeans/cutouts/levi.png"`); the kit wraps them in `staticFile()`.

## Where to get archival images (free to use)

Prefer public domain / CC0. For every image, write the source URL and the
license into `src/reels/<slug>/SOURCES.md`.

| Source | Typical license | Good for |
|---|---|---|
| Library of Congress (loc.gov) | many items "no known restrictions" | US history, photos, posters, maps |
| Wikimedia Commons | varies per file (PD, CC-BY, CC-BY-SA) | everything; read each file page |
| Smithsonian Open Access | CC0 | objects, history |
| The Met Open Access / Rijksmuseum | CC0 / PD | art, objects, fashion history |
| NYPL Digital Collections | many public domain | photos, ephemera |
| National Library of Israel (nli.org.il) | varies per item | Israeli history, newspapers |
| Internet Archive | varies | old magazines, catalogs, ads |
| Unsplash / Pexels | free license (not PD) | modern photos of objects |

CC-BY / CC-BY-SA require attribution: put a credit line in the Instagram
caption. Avoid images of identifiable private people, brand logos as the main
subject, and anything from a Google image search without a license page.

## Making cutouts (background removal) — free options

1. **Mac (easiest):** in Finder, right-click an image → Quick Actions →
   *Remove Background* (macOS 13+). Or open in Preview and use the same
   option. iPhone: touch and hold the subject in Photos → *Copy*/*Share*.
2. **rembg** (open source, runs locally, good on photos):
   `pipx install "rembg[cli]"` then `rembg i in.jpg out.png`.
3. Manual: Photopea (free, in the browser) → Select Subject → export PNG.

Then: crop tightly, export PNG with transparency, ~1200–1600 px on the long
side (sharp on a 1080 frame, light to render). `Cutout kind="silhouette"`
adds the white paper border automatically; use `border` 8–14.

## Code-drawn props (preferred for anything generic)

Simple objects (clock, coin, price tag, arrow sign, globe, document, fuse,
hourglass, shopping bag, pair of jeans) are best drawn as SVG in code:
- crisp at any size, palette colors guaranteed, no license question;
- parts can animate (hands turn, fuse burns, stitches draw with
  `evolvePath`).

Keep them flat and editorial: 2–3 palette colors, thick ink outline (8–14 px),
no gradients except a subtle shadow. Save reusable ones as components or
`.svg` files in `props/`.

## Image treatment for the house styles

- Mixed Media: `tone="color"` or `"mono"` for archival; white border;
  drop shadow; optional `Tape`.
- Diorama: `tone="mono"` or `"sepia"`; border color `palette.cutoutBorder`
  (aged paper); censor bars over eyes of people.
- Halftone photo look: `halftone()` effect on the `<Img>` (WebGL — verify with
  a still render; renders need `--gl=angle`).
