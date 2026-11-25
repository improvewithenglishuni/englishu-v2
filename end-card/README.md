# EnglishU Reel end card

The animated end card that closes every EnglishU Reel: 1080 × 1920, 30 fps, 4.2 s, with sound.

## Ready to use

- `final/englishu-end-card.mp4`: the finished card, with sound.
- `final/englishu-end-card-still.png`: the last frame as a still.
- `final/englishu-end-card-sound.wav`: the sound on its own.

## What happens on screen

| Time | On screen | Sound |
|---|---|---|
| 0.0–0.55 s | A crumpled paper ball opens into the sheet | Paper crumple |
| 0.57 s | The logo sticker stamps down and the David cutout slides in | |
| 0.8–1.6 s | "עקבו לעוד / עובדות." appear and the yellow marker sweeps right to left | Two marker swoops |
| 1.33–1.73 s | The @improve.with.englishu strip tears on, then the tape sticks | |
| 1.6–2.0 s | The pen arrow draws from the highlight to the handle | Pen scribble |
| 1.93–3.6 s | The doodles and the Follow button sketch draw in blue fine-liner | Pen scribble |
| 2.4 s | The sketch turns into the real Follow button and cursor | |
| 2.8 s | The cursor clicks and the button flips to "Following" | Mouse click |

## Editing and rebuilding

Everything is in `src/`:

- `card.html`: the whole card. It covers layout, doodles and timing, and you can open it in a browser.
- `assets/`: the paper background, the logo and David cutouts, the torn tag strip, and the frames of the paper ball opening (`assets/bgk/`).
- `render.js`: renders frames with Playwright.
- `make_sound.py`: builds the sound. The pen scribble is timed from `activity.npy`, which records when lines visibly appear on screen. After changing when doodles draw, regenerate that file with `measure-drawing.js`.

Steps, from `end-card/src` (needs Node with Playwright, Python with numpy and Pillow, and ffmpeg):

```bash
npm install
```

```bash
node render.js video
```

```bash
python3 make_sound.py
```

```bash
ffmpeg -framerate 30 -i frames/f%03d.png -i sound.wav -c:v libx264 -pix_fmt yuv420p -crf 14 -c:a aac -b:a 192k -shortest englishu-end-card.mp4
```

To render a few stills instead of the whole video, run `FR=40,80,125 node render.js stills`.
