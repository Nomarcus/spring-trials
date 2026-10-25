# Första prompten att ge Claude Code

Kopiera in i en ny Claude Code-session i repot:

> Läs `CLAUDE.md`, `docs/fjadra-PHYSICS.md`, `docs/fjadra-LEVELS.md` och `docs/fjadra-DESIGN.md`. Du tar över utvecklingen av Fjädra (Spring Trials) från en annan Claude-session. Källan ligger i `src/`; `game/index.html` byggs med `python3 tools/fjadra/build.py`.
>
> Gör först detta, i den ordningen, och rapportera kort på svenska:
> 1. Bygg och kontrollera att `game/index.html` är byte-identisk med vad som ligger i repot nu (`git status` ska inte visa någon ändring i `game/index.html` efter bygget).
> 2. Kör `tools/fjadra/test/all-physics.sh` och jämför med `BASELINE.txt`.
> 3. Kör testboten på alla 30 banor (`node tools/fjadra/test/run.js`, gärna i batcher eftersom den är CPU-tung) och uppdatera ✅/⚠️-kolumnen i `docs/fjadra-LEVELS.md`. Rapportera banor som inte går att klara. Banan *Gruvans andra våning* kräver `script_gruvan.js`.
> 4. Skapa gren `claude/verify-v11` och öppna en PR med bara den uppdaterade statuslistan.
>
> Regler: små PR:er, fysik/grafik/banor separat, pusha inte till `main`, mobil först, ändra inte fysik utan uttrycklig uppgift. Fråga Marcus bara när något är oklart i *känslan*, inte i tekniken.
