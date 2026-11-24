# Source photos

| File | Source | License |
|---|---|---|
| `dc8_004.jpg` | NASA, "DC-8 Airborne Laboratory in flight (EC98-44428-004)", NASA Dryden Flight Research Center, via Wikimedia Commons: https://commons.wikimedia.org/wiki/File:DC-8_Airborne_Laboratory_in_flight_(EC98-44428-004).jpg | Public domain (work of NASA) |
| `dc8_007.jpg` | NASA, "DC-8 Airborne Laboratory in flight (EC98-44428-007)", via Wikimedia Commons | Public domain (work of NASA) |

`public/assets/cutouts/plane.png` is made from `dc8_004.jpg` with `tools/make_cutout.py`.

| `gillray.jpg` | James Gillray, "The Cow-Pock, or the Wonderful Effects of the New Inoculation" (1802), via Wikimedia Commons | Public domain (artist died 1815) |
| `jenner.jpg` | Edward Jenner portrait engraving, via Wikimedia Commons | Public domain (19th-century print) |
| `ota.jpg` | Ota Chou, painting of a vaccination, via Wikimedia Commons | Public domain (as listed on Commons) |
| `tem.jpg` | CDC / Fred Murphy, smallpox virions TEM, via Wikimedia Commons | Public domain (US government work) |
| `vial.jpg`, `vial_mask.jpg` | CDC smallpox vaccine vial and bifurcated needle, via Wikimedia Commons | Public domain (US government work) |

(Check each file page on Commons before publishing; exact titles and file names were not re-verified in this session.)

| `hille.jpg`, `h800.jpg`, `public/assets/vox/hille_wide.jpg` | Hillemacher, painting of Jenner vaccinating (Wellcome Collection), via Wikimedia Commons | Public domain |
| `public/assets/vox/jenner_cut.png` (from `jenner.jpg`) | Edward Jenner engraving, Wellcome Collection V0003071 | CC BY 4.0: credit "Wellcome Collection" if published |

Older newsprint-version files (`gillray.jpg`, `ota.jpg`, `tem.jpg`, `vial*.jpg`) are unused in v3.

| `arm.jpg` (from `VaccineScarsNL.jpg`), `public/assets/vox/arm_sticker.png` | "VaccineScarsNL.jpg", Wikimedia Commons (real photo of vaccine scars on an upper arm) | CC0 |
| `public/assets/worlds/vox/plate_clip.jpg` | generated newspaper-clipping plate (greeked text, no real article) | own work |

| `milk.jpg`, `public/assets/vox/milkmaid.jpg` | "Melking av kyr", Nasjonalbiblioteket (National Library of Norway), via Wikimedia Commons (woman milking cows, early 20th c.) | Public domain |
| `public/assets/vox/smallpox_patient.jpg` | Sharon-supplied screenshot of a historical halftone photo of a child with smallpox (original source not recorded; identify and credit before publishing) | unverified |
| chart data (World, reported smallpox cases 1967-1977) | WHO via Our World in Data, "Number of reported smallpox cases" (1978-1980 = 0; last case Oct 1977, Somalia, per CDC MMWR 1978) | CC BY (OWID) |

| `public/assets/vox/arm_hand.png` | Sharon-supplied die-cut arm with hand and scars (hook sticker; original source not recorded) | unverified |
| `public/assets/vox/patient_full.jpg` | Sharon-supplied child smallpox photo, upscaled 4x for full-frame (source not recorded) | unverified |
| `public/fonts/amatic-sc-*-700-normal.woff2` | Amatic SC (Hebrew + Latin handwriting) via @fontsource/amatic-sc, used for the Jenner name tag | OFL |

| `public/assets/vox/milkmaid_new.jpg` | Sharon-supplied photo of a woman milking a cow in a barn, upscaled 4x for full-frame (source not recorded) | unverified |

## Smallpox facts used in v9 (verified 2026-11-19)
- 300 million deaths in the 20th century: WHO.
- Intensified Smallpox Eradication Programme began 1 Jan 1967 (WHA 1966): 10-15 million cases, 31 endemic countries/territories (Fenner et al., WHO 1988). Map dots are random points inside those countries (illustrative, not case locations).
- Last natural case: Somalia, Oct 1977. 1978: 2 cases (lab accident, England). Certified 9 Dec 1979; WHA declared eradication 8 May 1980.
- Chart series: WHO via Our World in Data (reported cases; understates true cases). 1967 = 132,000 (OWID; WHO paper says 131,000).
- Arm, girl and milkmaid photos supplied by Sharon: provenance unverified.
- Map dots (v12): ~5,100 random points spread evenly over all land to show smallpox's historical spread; illustrative, not case locations. Subtitle says it struck 'almost the whole world' over thousands of years.
- Jenner portrait source `tools/sources/jenner.jpg` is only 260x341 px (soft). A sharp original exists: Wellcome Collection V0003071, IIIF https://iiif.wellcomecollection.org/image/V0003071/full/1600,/0/default.jpg (CC BY 4.0). Container cannot download it; needs a manual drop into tools/sources/.
- `tools/sources/jenner_hires.png` / `public/assets/vox/jenner_hires_sticker.png`: sharp Edward Jenner engraving supplied by Sharon (1296x1600), provenance unverified; `public/assets/vox/crumple_paper.png`: crumpled paper texture supplied by Sharon (name-tag paper).
- `public/assets/vox/patient_full.png` (smallpox patient photo, Scene 2) and `public/assets/vox/crumple_paper.png` (white crumpled paper for name tag): supplied by Sharon 2026-11-20; provenance/licence unverified (patient photo must be identified against a named source before publishing).
- `public/assets/vox/milkmaid_hq.png` (milkmaid at work with cow, Scene 5): higher-quality photo supplied by Sharon 2026-11-20; photographer/provenance unverified, identify before publishing.
- `public/assets/vox/flex_up.png`, `flex_fore.png` (from `tools/sources/flex_arm_source.png`): flexed-arm picture with a vaccine scar, supplied by Sharon 2026-11-20 (likely AI-generated illustration; provenance unverified), cut at the elbow and given a white die-cut outline. Milkmaid photo re-framed so the woman is centred.
- `public/assets/vox/hook_scar_bw.png` (from `tools/sources/hook_scar_source.png`, 516x387): photo of a round vaccine scar on an upper arm, supplied by Sharon 2026-11-20; converted to black and white and upscaled 2x (soft when zoomed); provenance unverified and the scar must be confirmed as a smallpox-vaccine scar before publishing.
- `public/assets/vox/flex2_up.png`, `flex2_fore.png` (from `tools/sources/flex_arm_bw_source.png`): black-and-white photo of a flexed arm with two round scars (smallpox-vaccine style), supplied by Sharon 2026-11-20; provenance unverified; cut at the elbow with a white die-cut outline.
- Jenner: tag reads "ד״ר" (Dr.); Jenner received an MD from the University of St Andrews in 1792 (St Andrews special collections: special-collections.wp.st-andrews.ac.uk/?p=13655). The year 1796 is shown as a date stamp on the portrait.
- `public/fonts/special-elite-latin-400-normal.woff2`: Special Elite typewriter font (@fontsource/special-elite, Apache-2.0) for the typed date stamp.

- v23: red marker circle (`public/assets/vox/marker_a.png`, `marker_b.png`) is drawn procedurally by `tools/make_marker.py` (our own code, no third-party image); Sharon's reference photo was only a style guide. Map dots stay illustrative (random points on land); the last few are placed near Somalia only for the story beat.

- v23-27 hook photo (`tools/sources/hook_scar2_source.png` -> `public/assets/vox/hook_scar2_bw.png`): close-up of a round vaccination scar on an upper arm with a pointing finger, 800x650, supplied by Sharon, provenance/licence unverified (looks like a stock photo). NOT yet confirmed that it is a smallpox-vaccine scar. Converted to B/W, upscaled 2x (Lanczos) for the zoom.

- v28 vial drawing supplied by Sharon was tried on the VACCINATION slide and removed in v29 (not used).

## Audio (v33)
- Voiceover: Sharon's own recording (New Recording 23.m4a), complete takes cut at silences, room tone fill, light high-pass/compression, loudness-normalised. Not published anywhere else.
- Sound effects and quiet bed: synthesised in code (numpy/scipy), no third-party samples.
- v36: music bed rewritten as a sectioned, synthesized score (code, `tools/audio/smallpox_build_audio.py`); no third-party audio.
- v38: voiceover rebuilt from Sharon's New Recording 26 (complete takes, room-tone joins, plosive + de-ess cleanup); build scripts in `tools/audio/`. Music/SFX synthesized in code.
- v42: globe is drawn from the Natural Earth land data in the world-atlas package (same source as the map); no new sources.
