# Spring Trials

**Fjädra – trialspussel på fjädrar.** A mobile physics motorcycle puzzle game inspired by Elasto Mania. Only the wheels and the head touch the ground, and the head can't take anything.

## Structure
- `game/index.html` – the main game (single-file HTML, original version from Claude)
- `variants/cartoon-plus.html` – graphics upgrade, same physics
- `variants/neon.html` – neon/synthwave style, same physics
- `assets/music/` – Suno tracks (not yet wired into the game)
- `screenshots/` – before/after shots
- `docs/` – playtest feedback and style specs

## Uppförsbacken (climb/)
`climb/index.html` – a standalone Getting Over It–style variant: **one extremely long climb** (≈1 970 m long, 241 m up) through six zones (Ängen, Skogen, Klipporna, Snöfältet, Molnen, Toppen). Same physics engine, bike, rider and controls as `game/`, but **no death**: the helmet just bumps. You only lose progress by falling – into five ever-deeper abysses (14 → 52 m) whose floors drain left into a tunnel that climbs back up to a trapdoor earlier on the course. Height meter, best height, total time and position are saved in localStorage. An English narrator (Web Speech API + subtitles; lines in `NARRATOR_LINES` at the top of the climb code) comments on falls, records, idling and the summit.

Tools: `tools/climb/build.cjs` generates the course (`course.json`, needs `npm i polygon-clipping`), `verify.cjs`/`verify_fall.cjs` drive a bot through every section with the real engine, `assemble.py` builds `climb/index.html` from `game/index.html` + `tail.js`.

Narrator voice: pre-recorded with the open **Kokoro-82M** TTS model (hexgrad/Kokoro-82M via `kokoro-onnx`, voice `bm_george`, British English), 216 mono MP3 clips (40 kbps, silence-trimmed, loudness-normalised) in `climb/voice/` with `manifest.json`; loaded lazily via Web Audio, browser speech only as fallback. Generator: `tools/climb/voice_gen.py`.
