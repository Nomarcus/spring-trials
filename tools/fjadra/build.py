#!/usr/bin/env python3
"""Bygger game/index.html (en enda självständig HTML-fil) av src/*.

    python3 tools/fjadra/build.py            # skriver game/index.html
    python3 tools/fjadra/build.py --out x.html

Fyra källor limmas in i src/shell.html:
  /*CORE*/    <- src/core.js    (fysik, ingen DOM; module.exports-raden tas bort)
  /*LEVELS*/  <- src/levels.js  (banor; allt från 'if(typeof module' och ner tas bort)
  /*GAME*/    <- src/logic.js (före '// ---------- audio') + src/gfx.js + src/editor.js + resten av src/logic.js
"""
import os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()

shell  = rd('src/shell.html')
core   = rd('src/core.js')
mark = "if(typeof module!=='undefined') module.exports="
i = core.index(mark); j = core.index('\n', i) if '\n' in core[i:] else len(core)
core = core[:i] + core[j:]
lv = rd('src/levels.js'); lv = lv[:lv.index("if(typeof module!=='undefined')")]
logic = rd('src/logic.js'); gfx = rd('src/gfx.js'); editor = rd('src/editor.js')
SPLIT = '// ---------- audio'
a, b = logic.split(SPLIT, 1)
game = '(()=>{\n' + a + '\n' + gfx + '\n' + editor + '\n' + SPLIT + b + '\n})();'
out = shell.replace('/*CORE*/', core).replace('/*LEVELS*/', lv).replace('/*GAME*/', game)
dst = os.path.join(ROOT, 'game', 'index.html')
if '--out' in sys.argv: dst = sys.argv[sys.argv.index('--out') + 1]
os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
open(dst, 'w', encoding='utf8').write(out)
print('skrev', dst, len(out), 'tecken')
