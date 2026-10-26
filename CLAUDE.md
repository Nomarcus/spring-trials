# Fjädra / Spring Trials – projektguide för Claude Code

Fjädra är ett fysikbaserat motorcykelpusselspel för **mobil i liggande läge**, inspirerat av Elasto Mania och Trials. Allt ligger i **en enda självständig HTML-fil** (`game/index.html`) som byggs av källfiler i `src/`.
Bara hjulen och huvudet kolliderar med världen. Huvudet tål nästan ingenting, fjädringen är spelets själ, och banorna är pussel där man måste använda fysiken.

Live-version (senast publicerad): https://claude.ai/artifact/BXq7d8PwweYmL2PzYkVZ9o  ·  Grafikark med 20 stilförslag: https://claude.ai/artifact/XfgKHDakZiJvwaMtBbEdjr

## Kom igång (2 minuter)
```bash
python3 tools/fjadra/build.py                   # src/* -> game/index.html (ska vara byte-identisk med nuvarande fil innan du ändrar något)
tools/fjadra/test/all-physics.sh                # fysiktester; jämför mot tools/fjadra/test/BASELINE.txt
node tools/fjadra/test/run.js 0 1 2             # testbot: kan banor 0,1,2 klaras? (utan argument = alla banor, långsamt)
python3 tools/fjadra/shot.py --level 2 --hold 2 --out shot.png   # skärmdump i mobilformat (kräver playwright)
python3 tools/fjadra/import_level.py bana.json   # bakar in en bankod från baneditorn i src/levels.js (EDITS)
```
Spelet öppnas direkt som fil i webbläsaren, ingen server behövs.

## Filkarta
| Fil | Innehåll | Rör bara om uppgiften gäller… |
|---|---|---|
| `src/core.js` | **Fysik** (ingen DOM): cykel, fjädring, förare, broms/häng, studs, bunny hop, pumpning, vändning, ragdoll, tyngdkraftsbyte. Konstanter i objektet `P`; fjädringsvalen i `SUSP`/`setSusp()` (standard `normal` = `P`). | fysik |
| `src/levels.js` | **Bandata** + hjälpfunktioner (`sample`, `arc`, `cr`, `rect`, `crate`, `log`, `pillar`, `blob`, `loopRide`). Banor i `LV3` (30 banor), inbakade editorändringar i `EDITS`. | banor |
| `src/editor.js` | **Baneditorn** i spelet: forma mark, stjärnor, block, testa, spara egna/ändrade banor, kopiera/klistra in bankod. | editorn |
| `src/logic.js` | Spelloop, input, meny, ljud/musik, rekord/spöke, kamera, översikt, pilar, kraschar/vinst. | spelregler/UI-logik |
| `src/gfx.js` | All ritning: teman (`THEMES`, `NEON`), bakgrund, mark, cykel + förare, partiklar, banförhandsvisning. | grafik |
| `src/shell.html` | HTML + CSS (HUD, knappar, meny) med platshållare `/*CORE*/ /*LEVELS*/ /*GAME*/`. | UI-layout |
| `tools/fjadra/build.py` | Limmar ihop allt till `game/index.html` (se kommentaren överst). | bygget |
| `tools/fjadra/test/*` | Fysiktester och testboten `beam.js`/`run.js`. | alltid, vid ändringar |

`logic.js` delas vid raden `// ---------- audio` och `gfx.js` + `editor.js` sätts in mitt emellan (så att grafikfunktionerna ligger i samma closure). Ändra inte den raden utan att uppdatera `build.py`.

## Regler (från Marcus)
1. **En ändring i taget:** fysik, grafik och banor i separata grenar/PR:er. Pusha inte direkt till `main`.
2. **Fysik, ragdoll och bandata ändras bara när uppgiften uttryckligen gäller det.** Efter en fysikändring: kör `all-physics.sh`, jämför med `BASELINE.txt`, och kör testboten på banorna. Se `docs/fjadra-PHYSICS.md`.
3. **Mobil först:** touchknapparna och prestandan på äldre telefoner. Inga tunga effekter i spelloopen. `prefers-reduced-motion` stänger av bakgrundsrörelser.
4. **Säg aldrig att en bana går att klara utan bevis** (testboten vinner eller ett skript kör igenom). Rapportera ärligt vilka banor som inte kördes om.
5. **Svara på svenska.** Marcus skriver kort och informellt, ibland via röstinmatning med fragment. Visa gärna en skärmdump eller bild av resultatet, han vill ha visuella svar.

## Vad Marcus vill ha (kortversion, detaljer i `docs/fjadra-DESIGN.md`)
- Elasto Mania-känslan: fjädringen är det roliga, man slänger sig runt, hänger i bakhjulet med bromsen, kör upp och ner. Samtidigt Trials-känsla: lugnare, tyngre, pussel framför att bara köra fram.
- **Lugn, ren, supermjuk, ADHD-vänlig grafik.** Inga skakningar, få partiklar, långsamma pulser.
- **Stjärnor** (inte äpplen) samlas, **blomman** är målet. Blå stjärnor med pil vänder tyngdkraften.
- **Inga dödliga hinder** tills vidare (spikbollar/sågar är borttagna ur alla banor, ritkoden finns kvar). Man ska inte dö av att fjädringen slår igenom, och inte av en lätt stöt med huvudet.
- Banorna ska ha **gott om yta**, inte vara tajta.
- Neon ska finnas kvar som valbar stil (menyknappen *Stil: Neon*).

## Nuläge och kända luckor (läs innan du börjar)
- **Testboten har inte körts om på alla banor med nuvarande fysik (v11).** Verifierade: se tabellen i `docs/fjadra-LEVELS.md` (✅). Kör hela sviten först: `node tools/fjadra/test/run.js` (delas gärna upp i batcher, den är CPU-tung).
- Medaljtider är satta efter botens körningar, inte mänskliga rekord.
- Musiken i spelet är genererad (Web Audio). Suno-spåren i `assets/music/` är **inte inkopplade**.
- Neon är en palett + glödande kanter; HUD:en har bara färgvariabler, inga egna neon-detaljer.
- Codex/ChatGPT-ändringar som **inte** ingår: flytande omstartsknapp, helskärmsknapp i HUD, zoomskydd för spelytan (`touchmove`/`gesture*`-lyssnare), de 43 banorna från Rocco, och `climb/` (Uppförsbacken, byggs av `tools/climb/assemble.py` mot en äldre `game/index.html` och går sönder mot denna fil).
- ChatGPT:s grafikuppdatering (palett, sandstensjord, bergsryggar, bronsbalk, kopparcykel) **är** inbyggd. Originalpatchen ligger i `docs/reference/chatgpt-grafik-patch.diff`.

## Lagring (localStorage)
`fjadra4.best` {banID: bästa tid}, `fjadra.g4.<banID>` spöke (30 Hz-inspelning), `fjadra.mute`, `fjadra.music`, `fjadra.style` (`cartoon`|`neon`), `fjadra.susp` (fjädringsval: hard|normal|soft|elma|bouncy), `fjadra.mine` (egna banor från editorn), `fjadra.edits` {banID: ändrad bana}. Äldre nycklar (`fjadra3.best`, `fjadra.ghost.<namn>`) migreras en gång. **Banor identifieras av stabilt ID, aldrig av namn.**
