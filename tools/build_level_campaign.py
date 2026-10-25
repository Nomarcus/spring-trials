#!/usr/bin/env python3
"""Author the level-data block only. Requires Shapely 2.x, not a runtime dependency."""
from pathlib import Path
import json, math
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
SPECS = [
 # name, width, floors, theme, underpasses, floor relief, difficulty
 ('Startängen', 28, 1, 'meadow', 0, 0, 'Mycket lätt'),
 ('Den lilla dalen', 42, 1, 'meadow', 0, .18, 'Mycket lätt'),
 ('De mjuka kullarna', 58, 1, 'meadow', 0, .45, 'Mycket lätt'),
 ('Första upptäcktsfärden', 70, 1, 'meadow', 0, .65, 'Lätt'),
 ('Bergsvalvet', 76, 1, 'meadow', 1, 0, 'Lätt'),
 ('Tillbaka under bron', 88, 1, 'sunset', 1, 0, 'Lätt'),
 ('Bergets två våningar', 62, 2, 'meadow', 0, .25, 'Lätt'),
 ('Den gömda gången', 80, 2, 'meadow', 1, 0, 'Lätt'),
 ('Gruvans första vägskäl', 86, 2, 'cave', 1, 0, 'Lätt'),
 ('Lilla labyrinten', 72, 3, 'meadow', 1, 0, 'Lätt / medel'),
 ('Stjärnan under stigen', 92, 3, 'sunset', 2, 0, 'Medel'),
 ('Tre långa omvägar', 98, 3, 'meadow', 2, 0, 'Medel'),
 ('Sicksackgrottan', 78, 4, 'cave', 0, .6, 'Medel'),
 ('De fyra valven', 90, 4, 'meadow', 2, 0, 'Medel'),
 ('Bergsbiblioteket', 100, 4, 'meadow', 2, 0, 'Medel'),
 ('Gruvans återvändsgränder', 104, 4, 'cave', 3, 0, 'Medel'),
 ('Den långa vägen hem', 98, 5, 'sunset', 2, 0, 'Medel / svår'),
 ('Tvillingbergets gångar', 110, 4, 'meadow', 3, 0, 'Medel / svår'),
 ('Ficklampans hemlighet', 90, 5, 'cave', 3, 0, 'Medel / svår'),
 ('De fem balkongerna', 104, 5, 'winter', 3, 0, 'Medel / svår'),
 ('Ormens långa resa', 114, 5, 'meadow', 3, 0, 'Svår'),
 ('Djupgruvans valv', 98, 6, 'cave', 4, 0, 'Svår'),
 ('De gömda tvillingvalven', 120, 5, 'sunset', 4, 0, 'Svår'),
 ('Bergens underjord', 108, 6, 'winter', 4, 0, 'Svår'),
 ('Vägskälens väktare', 122, 6, 'meadow', 5, 0, 'Svår'),
 ('Stora bergslabyrinten', 126, 6, 'cave', 5, 0, 'Svår'),
 ('Sju våningar hem', 112, 7, 'meadow', 5, 0, 'Expert'),
 ('Bergets minne', 130, 7, 'sunset', 6, 0, 'Expert'),
 ('Ormarkivet', 120, 8, 'cave', 6, 0, 'Expert'),
 ('Hjärtat av labyrinten', 138, 8, 'meadow', 7, 0, 'Expert'),
]
CAMPAIGN = []
HEIGHT, DROP = 8.6, 12.2

def coords(ring):
    return [[round(x, 4), round(y, 4)] for x, y in list(ring.coords)[:-1]]

def wave(x, width, amplitude, n):
    # Flat starts/turning pads, broad sinusoidal hills, no steps or mandatory hops.
    if x < 10 or x > width - 12: return 0
    t = (x - 10) / (width - 22)
    return amplitude * math.sin(math.pi * t) ** 2 * math.sin(math.pi * t * n) ** 2

for number, (name, width, floors, theme, branches, relief, difficulty) in enumerate(SPECS, 1):
    top = (floors - 1) * DROP
    stars, route, features, voids, solids = [], [], [], [], []
    branch_rows = set(round(i * (floors - 1) / max(1, branches - 1)) for i in range(branches)) if branches else set()
    # Low, relaxed outdoor introduction. Subsequent courses are a single mountain cutaway.
    outside = box(-14, -9, width + 14, top + 27)
    if number <= 4:
        floor = [[-14, 0]] + [[x, wave(x, width, relief, 2 if number < 4 else 3)] for x in range(0, width + 15, 2)]
        soil = Polygon([[-14, -9], [width + 14, -9], *reversed(floor)])
        for x in [round(width * f) for f in (.3, .57, .8)]:
            stars.append([x, round(wave(x, width, relief, 2 if number < 4 else 3) + .75, 4)])
        route = [[2, 0], *[[x, wave(x, width, relief, 2 if number < 4 else 3)] for x in range(6, width - 3, 2)], [width - 4, 0]]
        flower = [width - 4, 0]
        hint = 'Bara mjuk gas. Samla stjärnorna längs marken och kör till blomman.' if number < 3 else 'Följ de mjuka kullarna. Släpp gasen en stund om framhjulet börjar lyfta.'
    else:
        # Distinct mountain silhouettes; the exterior is just scenery, not a substitute for tunnels.
        roof = [[-14, top], [1, top], [10, top + 14], [width * .28, top + 18], [width * .48, top + 13], [width * .7, top + 21], [width + 10, top + 12], [width + 14, top + 12]]
        soil = Polygon([[-14, -9], [width + 14, -9], *reversed(roof)])
        # Daylight entrance: flat starting pad, well away from the first drop.
        voids.append(box(-14, top, 12, top + 27))
        left, right = 0, width
        for row in range(floors):
            y = top - row * DROP
            direction = 1 if row % 2 == 0 else -1
            # Asymmetric rooms and offset turning shafts: later courses wind through
            # the mountain instead of repeating the same full-width corridor.
            if number >= 10 and row:
                offsets = [0, .08, .17, .04, .13, .02, .1, .06]
                shift = offsets[(row + number) % len(offsets)]
                if direction == 1: right = width * (1 - shift)
                else: left = width * shift
            span = right - left
            X = (lambda u: left + u) if direction == 1 else (lambda u: right - u)
            branch = row in branch_rows
            amp = relief if not branch else 0
            count = math.ceil((span + 8) / 2)
            floor = [[left - 4 + (span + 8) * i/count, y + wave((span + 8)*i/count-4, span, amp, 2 + row % 3)] for i in range(count + 1)]
            ramp0 = 16 + (row % 2) * 4
            ramp1 = ramp0 + 18
            end = min(span - 21, ramp1 + 19 + (row % 3) * 2)
            def roof_height(x):
                u = x-left if direction == 1 else right-x
                if branch and ramp0-3 <= u <= end+4: return HEIGHT
                return 5.1 + .7 * math.cos((u/span*3 + number*.17 + row)*math.pi)
            corridor = Polygon([*floor, *[[x, yy + roof_height(x)] for x, yy in reversed(floor)]])
            voids.append(corridor)
            start_u, exit_u = 10, span - 15
            route.append([X(start_u), y])
            if branch:
                # A floor-connected rising arch; its underpass is entered from the far end.
                # The low entrance is deliberately solid: you must ride OVER, drop, and return UNDER.
                high, underside = 3.45, 2.65
                points = [[X(ramp0), y - .05], [X(ramp0), y], [X(ramp1), y + high], [X(end), y + high], [X(end), y + underside], [X(ramp1 + 1), y + underside]]
                solids.append(Polygon(points))
                upper = [X(ramp1 + (end - ramp1) * .6), y + high + .75]
                lower = [X(ramp1 + 7), y + .75]
                stars.extend([upper, lower])
                features.append({'row': row + 1, 'type': 'over-under', 'upperStar': upper, 'lowerStar': lower})
                route += [[X(ramp0 - 2), y], [X(ramp1), y + high], [upper[0], y + high], [X(end + 3), y], [lower[0], y], [X(end + 5), y]]
            else:
                for u in [span * .28, span * .62]:
                    x = round(X(u), 2)
                    stars.append([x, round(y + wave(x-left, span, amp, 2 + row % 3) + .75, 4)])
                route += [[X(u), y + wave(X(u)-left, span, amp, 2 + row % 3)] for u in range(14, math.floor(span - 14), 4)]
            # Every floor ends with an obvious star BEFORE its drop; plenty of braking distance.
            stars.append([X(exit_u), y + .75])
            route.append([X(exit_u), y])
            if row < floors - 1:
                shaft_x0, shaft_x1 = (right - 8, right + 4) if direction == 1 else (left - 4, left + 8)
                voids.append(box(shaft_x0, y - DROP, shaft_x1, y + HEIGHT))
                # A low, broad midpoint shelf breaks a tall fall into two readable landings.
                # It juts from the far wall, so the bike lands there, turns, and drops from the inner lip.
                mid_y = y - DROP / 2
                if direction == 1:
                    solids.append(box(right - 2.8, mid_y - .65, right + 4, mid_y))
                    route += [[right - 1, mid_y], [right - 5, y - DROP]]
                else:
                    solids.append(box(left - 4, mid_y - .65, left + 2.8, mid_y))
                    route += [[left + 1, mid_y], [left + 5, y - DROP]]
        # A sheltered finish pad at the end of the last floor.
        last_right = (floors - 1) % 2 == 0
        flower = [right - 12 if last_right else left + 12, 0]
        route.append(flower)
        soil = soil.difference(unary_union(voids)).union(unary_union(solids))
        hint = 'Samla stjärnan ovanpå valvet. Släpp dig ner på andra sidan, vänd och ta stjärnan under. Kör sedan till blomman.' if floors == 1 else 'Ta stjärnorna på varje våning före nedfarten. Valv har stjärnor BÅDE ovanpå och under: vänd och undersök. Bromsa i schakten.'
    # Merge collinear and visually redundant edges offline (2.5 cm tolerance). Long rooms should not cost hundreds of
    # redundant collision segments on older phones. No simplification at runtime.
    air = outside.difference(soil).buffer(0).simplify(.025, preserve_topology=True)
    spawn = [2, top]
    component = air if air.geom_type == 'Polygon' else next(p for p in air.geoms if p.covers(Point(spawn[0], spawn[1] + 1)))
    rings = [{'pts': coords(component.exterior)}, *[{'pts': coords(r)} for r in component.interiors]]
    length = sum(math.dist(a, b) for a, b in zip(route, route[1:]))
    # Provisional, deliberately forgiving medals. Measured records can tighten these later.
    gold = max(16, round(length / 4.0 + branches * 6 + floors * 2))
    silver = math.ceil(gold * 1.6)
    level = dict(name=name, theme=theme, hint=hint, rings=rings, apples=stars, killers=[], flower=flower, start=spawn,
                 medal=[gold, silver], difficulty=difficulty, campaignId=f'maze-v1-{number:02}',
                 design=dict(floors=floors, branches=branches, route=route, routeLength=round(length, 1), features=features))
    assert component.is_valid, name
    for x, y in stars:
        assert component.contains(Point(x, y)), (name, 'star in solid ground', x, y)
        assert component.boundary.distance(Point(x, y)) > .3, (name, 'star too close to boundary', x, y)
    assert component.contains(Point(flower[0], flower[1] + .65)), (name, 'finish')
    assert component.contains(Point(spawn[0], spawn[1] + 1.8)), (name, 'spawn head')
    assert component.contains(Point(spawn[0] - .96, spawn[1] + .4)), (name, 'spawn rear wheel')
    assert component.contains(Point(spawn[0] + .96, spawn[1] + .4)), (name, 'spawn front wheel')
    CAMPAIGN.append(level)

from varied_trials import make_trials
TRIALS=make_trials()
ORIGINAL_CAMPAIGN=tuple(CAMPAIGN)
O={i:l for i,l in enumerate(ORIGINAL_CAMPAIGN,1)}
CAMPAIGN=[O[1],TRIALS['pump'],O[2],TRIALS[2],O[3],TRIALS[5],O[4],TRIALS[4],TRIALS['peaks'],O[5],TRIALS['islands'],TRIALS[7],O[6],O[7],TRIALS[9],TRIALS[13],TRIALS['low'],O[10],TRIALS['steps'],TRIALS[11],O[13],TRIALS[15],TRIALS['hang'],TRIALS['balance'],O[16],TRIALS[18],TRIALS['centre'],TRIALS['gravity'],O[19],TRIALS[21],TRIALS[24],TRIALS['ravine'],O[22],TRIALS['rocket'],TRIALS[27],O[26],TRIALS['lastflow'],O[30]]

def build():
    target = ROOT / 'game/index.html'
    source = target.read_text()
    begin = source.index('// ===== Levels')
    end = source.index('\n</script>', begin)
    # Replace the entire level-data script, preserving the external makeLevels API.
    data = []
    for level in CAMPAIGN:
        compact = {k:v for k,v in level.items() if k != 'design'}
        data.append('  ' + json.dumps(compact, ensure_ascii=False, separators=(',', ':')))
    block = '''// ===== Levels: 38-stage mixed trials/maze campaign (generated; see tools/build_level_campaign.py) =====
const CAMPAIGN_LEVELS = [
''' + ',\n'.join(data) + '''
];
function makeLevels(){
  return CAMPAIGN_LEVELS.map(source=>{
    const l=JSON.parse(JSON.stringify(source)); l.segs=buildSegs(l.rings);
    let mnx=Infinity,mny=Infinity,mxx=-Infinity,mxy=-Infinity;
    for(const r of l.rings)for(const p of r.pts){mnx=Math.min(mnx,p[0]);mny=Math.min(mny,p[1]);mxx=Math.max(mxx,p[0]);mxy=Math.max(mxy,p[1]);}
    l.bounds=[mnx,mny,mxx,mxy]; return l;
  });
}
// Level-authored facing only; the shared physics model remains unchanged.
function createLevelBike(l){
  const bk=newBike(l.start[0],l.start[1]);
  if(l.startDir===-1){bk.dir=-1;bk.flipFrom=-1;const p=riderTarget(bk,0);bk.r.x=bk.b.x+p[0];bk.r.y=bk.b.y+p[1];}
  return bk;
}
'''
    updated=source[:begin] + block + source[end:]
    updated=updated.replace('bike=newBike(lvl.start[0],lvl.start[1])','bike=createLevelBike(lvl)')
    updated=updated.replace('cam.x=bike.b.x+2;', 'cam.x=bike.b.x+2*(lvl.startDir||1);').replace('cam.x=bike.b.x+5;', 'cam.x=bike.b.x+5*(lvl.startDir||1);')
    # Keep generated trees/boulders out of wheel pockets and technical sightlines.
    updated=updated.replace('const sorted=tops.filter(', 'const sorted=l.noDeco?[]:tops.filter(')
    target.write_text(updated)
    plan = '# Bankampanj: blandade trials och labyrinter\n\n38 banor: 14 utvalda labyrinter och 24 individuellt formgivna trialsbanor. De 30 gamla bandefinitionerna finns kvar i byggverktygets ORIGINAL_CAMPAIGN; 16 återkommande labyrintvarianter ingår inte längre i huvudkampanjen. Halvcirklar, fartdalar, rena uppförsbanor, nedfarter från höger, dubbla hjulfickor och en vertikal nedfart. Startorientering är bandata; fysik, grafik, ragdoll och ljud behålls.\n\n'
    plan += 'Valven har en körbar ramp upp och en 2,65 meter hög återvändsgränd under. Ta stjärnan ovanpå, kör ner från änden, vänd tillbaka under valvet och vänd sedan ut igen. Våningarnas nedfarter är avsiktliga envägspassager: ta stjärnorna före nedfarten. Alla stjärnor ligger före öppningen, med plats att bromsa. Vid en miss finns den befintliga omstartsknappen.\n\n'
    plan += '| # | Bana | Svårighet | Våningar | Valv med retur | Avsedd väg, cirka m |\n|---|---|---|---:|---:|---:|\n'
    for i,l in enumerate(CAMPAIGN,1):
        d=l['design']; plan+=f"| {i} | {l['name']} | {l['difficulty']} | {d['floors']} | {d['branches']} | {d['routeLength']} |\n"
    plan += '\n## Återskapa och kontrollera\n\n`python3 -m pip install "shapely>=2,<3"` följt av `python3 tools/build_level_campaign.py`. Shapely används endast vid banbygge. Spelet är fortfarande en HTML-fil utan nya runtimeberoenden. `node tests/levels.test.cjs`, `node tests/drive-campaign.cjs` och `node tests/trials-drive.cjs` kontrollerar genererade banor och skyddar allt utanför bandatablocket mot oavsiktliga ändringar.\n\nDen separata körkontrollen använder en analog återkopplingsregulator i originalets fysikmotor och når alla stjärnor och målet på bana 1–7. Ytterligare nio trialsbanor – inklusive båda vänsterstarterna, uppförsbanorna och skål-/flowbanor – körs till alla stjärnor och målet av `trials-drive.cjs`. Det ersätter inte speltest med touch eller tangentbord. De övriga teknikbanorna, inklusive Halvmånen, hjulfickorna, gravitationsbanan och expertlabyrinterna, har kontrollerats geometriskt, vid start och genom rendering, men inte körts hela vägen till mål. Medaljtiderna är preliminära designmål. Geometriska kontroller och stabila starter bevisar inte att samtliga avancerade banor är fullständigt speltestade.\n'
    plan=plan.replace('på bana 1–7','på de första sju ursprungliga labyrintbanorna (kontrollen söker efter namn, inte menyplats)').replace('båda vänsterstarterna','vänsterstarter')
    plan+='\nHjulfickorna har 1,92 meters centrumavstånd, lika med originalcykelns hjulbas. Övningsfickorna är 1,28 meter breda och 0,62 meter djupa; expertfickorna är 1,10 meter breda och 0,90 meter djupa. Originalhjulens diameter är 0,80 meter. Stjärnorna i expertfickorna ligger nere i urtagen. Inga magnetgrepp eller nya kollisionsregler läggs till.\n'
    (ROOT/'docs/maze-campaign.md').write_text(plan)
    (ROOT/'tests/maze-routes.json').write_text(json.dumps([dict(name=l['name'], **l['design']) for l in CAMPAIGN], ensure_ascii=False, separators=(',', ':'))+'\n')
    print(f'Built {len(CAMPAIGN)} courses; longest route {max(l["design"]["routeLength"] for l in CAMPAIGN)}m')

if __name__ == '__main__': build()
