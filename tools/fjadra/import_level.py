#!/usr/bin/env python3
"""Bakar in en bankod från baneditorn i spelet (EDITS i src/levels.js).

    python3 tools/fjadra/import_level.py bana.json            # bankoden ligger i en fil
    pbpaste | python3 tools/fjadra/import_level.py -          # eller kommer på stdin
    python3 tools/fjadra/import_level.py bana.json --id fjadra-p3-12   # tvinga ett ID

Bankoden får man i spelet: editorn → ⋯ → Kopiera bankod.
- ID för en inbyggd bana (t.ex. fjadra-p3-07): banan byts ut mot den ändrade versionen.
- Egen bana (ID mine-…): blir en ny bana sist i paketet med nästa lediga ID fjadra-p3-NN.
Kör sedan python3 tools/fjadra/build.py och testboten på banan.
"""
import json, os, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LV = os.path.join(ROOT, 'src', 'levels.js')

def main():
    args = sys.argv[1:]
    if not args: sys.exit(__doc__)
    force = None
    if '--id' in args: k = args.index('--id'); force = args[k + 1]; del args[k:k + 2]
    raw = sys.stdin.read() if args[0] == '-' else open(args[0], encoding='utf8').read()
    d = json.loads(raw.strip())
    for k in ('rings', 'start', 'flower', 'apples'):
        if k not in d: sys.exit('bankoden saknar ' + k)
    src = open(LV, encoding='utf8').read()
    a, b = src.index('// EDITS-START\n') + len('// EDITS-START\n'), src.index('// EDITS-END')
    block = src[a:b]
    known = set(re.findall(r"id:'(fjadra-p3-\d+)'", src)) | set(re.findall(r"^'(fjadra-p3-\d+)':", block, re.M))
    lid = force or d.get('id', '')
    if not lid or lid.startswith('mine-'):
        n = max([int(x[-2:]) for x in known] + [0]) + 1
        lid = 'fjadra-p3-%02d' % n
    d['id'] = lid
    keep = {k: d[k] for k in ('id', 'name', 'theme', 'hint', 'stuck', 'top', 'start', 'flower', 'apples', 'rings') if k in d}
    keep['rings'] = [({'style': r['style'], 'pts': r['pts']} if r.get('style') else {'pts': r['pts']}) for r in d['rings']]
    line = "'%s':%s,\n" % (lid, json.dumps(keep, ensure_ascii=False, separators=(',', ':')))
    lines = [l for l in block.splitlines(True) if not l.startswith("'%s':" % lid)]
    block = ''.join(lines) + line
    open(LV, 'w', encoding='utf8').write(src[:a] + block + src[b:])
    print('lade in', lid, '(%s)' % keep.get('name', ''), '–', sum(len(r['pts']) for r in keep['rings']), 'punkter,', len(keep['apples']), 'stjärnor')

main()
