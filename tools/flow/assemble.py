# Builds climb/index.html: a standalone test page = the main game (game/index.html) with ONLY the "Flödet" level.
import os,json,re
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(D+'/../..')
g=open(ROOT+'/game/index.html',encoding='utf8').read()
lv=json.load(open(ROOT+'/levels/flodet.json',encoding='utf8'))
a=g.index('const CAMPAIGN_LEVELS = ['); b=g.index('\n];',a)+3
g=g[:a]+'const CAMPAIGN_LEVELS = [\n  '+json.dumps(lv,ensure_ascii=False,separators=(',',':'))+'\n];'+g[b:]
# separate save slots so the test page never touches the main game's records
for k in ["'fjadra3.best'","'fjadra.ghost.'"]:
    assert k in g; g=g.replace(k,k[:-1]+'flodet.'+"'" if k.endswith(".'") else k[:-1]+'.flodet'+"'")
g=re.sub(r'<title>[^<]*</title>','<title>Fjädra: Flödet (testbana)</title>',g,1)
g=g.replace('<h1 class="title disp">Fjädra</h1>','<h1 class="title disp">Fjädra: Flödet</h1>',1)
g=g.replace('<button class="btn alt" id="bFull">Helskärm</button>','<button class="btn alt" id="bFull">Helskärm</button><a class="btn alt" href="../" style="text-decoration:none">Alla versioner</a>',1)
open(ROOT+'/climb/index.html','w',encoding='utf8').write(g); print(len(g))
