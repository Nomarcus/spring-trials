# Spring Trials

**Fjädra – trialspussel på fjädrar.** A mobile physics motorcycle puzzle game inspired by Elasto Mania. Only the wheels and the head touch the ground, and the head can't take anything.

## Structure
- `game/index.html` – the main game (single-file HTML, original version from Claude)
- `variants/cartoon-plus.html` – graphics upgrade, same physics
- `variants/neon.html` – neon/synthwave style, same physics
- `assets/music/` – Suno tracks (not yet wired into the game)
- `screenshots/` – before/after shots
- `docs/` – playtest feedback and style specs

## Flödet (climb/) – one long flow level for the main game
`levels/flodet.json` is **one long level in the exact `CAMPAIGN_LEVELS` format of `game/index.html`** (rings, apples, killers, flower, start, startDir, medal, …) – paste the object into the array to add it to the campaign. `climb/index.html` is a standalone test page: the unchanged main game with only this level (normal rules: head hit = crash, Omstart; own localStorage keys so main-game records are untouched). No narrator.

13 sections, ≈344 m, 15 stars: Utförsstarten, Pumpbanan, Hoppet (kicker over a deadly pit), Loopen (ceiling star, turn around, drop through the hole, chute under the loop), Skålen, Berg-och-dalbanan, Trappsteget, Tunneln, Taklisterna, Svingen (1.6 m brake-swing step), Avstampet, Schaktet (drop, turn left in the gallery, drop, turn right), Målrakan.

Tools (`tools/flow/`): `build.cjs` → `levels/flodet.json` + `sections.json`; `beam.cjs` beam-searches real-engine inputs (gas/brake/lean/turn/volt) section by section with main-game crash rules; `verify_all.json` has the results; `assemble.py` builds `climb/index.html`; `draw.py` draws the map; `shots.py` takes screenshots. The old Uppförsbacken builder in `tools/climb/` and the voice clips in `climb/voice/` are kept but no longer used.
