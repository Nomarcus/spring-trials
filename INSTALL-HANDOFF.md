# Lägg in paketet i repot

```bash
cd spring-trials
git checkout -b claude/handoff
unzip -o ../spring-trials-handoff.zip -d .      # lägger till src/, tools/fjadra/, docs/fjadra-*.md, docs/reference/, CLAUDE.md och ERSÄTTER game/index.html
cp game/index.html /tmp/handoff-index.html
python3 tools/fjadra/build.py && cmp game/index.html /tmp/handoff-index.html && echo 'bygget är byte-identiskt med paketets game/index.html'
tools/fjadra/test/all-physics.sh | head
git add -A && git commit -m "Hand over Fjädra v11.1 sources, tools and docs" && git push -u origin claude/handoff
```
Öppna sedan en PR mot `main`.

**Obs:** `game/index.html` ersätts. Roccos 43 banor och `main`:s tidigare grafik/kontrolländringar försvinner ur den filen (Marcus har sagt att nya banor skapas ändå). `climb/index.html` är orörd men `tools/climb/assemble.py` fungerar inte mot den nya filen.
