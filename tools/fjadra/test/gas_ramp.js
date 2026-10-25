const C=require(process.argv[2]||'../../../src/core.js');
function ramp(deg,lead){ const th=deg*Math.PI/180; const R=[[-40,80],[-40,0],[lead,0],[lead+30*Math.cos(th),30*Math.sin(th)],[200,30*Math.sin(th)],[200,80]]; const segs=C.buildSegs([R]);
  const bk=C.newBike(lead-3,0); let maxRel=-9, res='ok'; for(let i=0;i<600*5;i++){ C.step(bk,{gas:1},segs,C.P.H); const slope=bk.b.x>lead?th:0; maxRel=Math.max(maxRel,bk.b.a-slope); if(C.headHit(bk,segs)||bk.b.a>2.2){ res='FLIP'; break; } }
  return res==='FLIP'?'FLIP':'+'+(maxRel*57.3).toFixed(0)+'°'; }
for(const lead of [3,6,12]){ const row=['run-up '+lead+'m']; for(const d of [20,28,36,44]) row.push(d+'°:'+ramp(d,lead)); console.log(row.join('   ')); }
