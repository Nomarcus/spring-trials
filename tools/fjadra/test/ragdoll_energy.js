const C=require('../../../src/core.js'); const segs=C.buildSegs([[[-40,80],[-40,0],[300,0],[300,80]]]);
function trial(v,mode){ const bk=C.newBike(0,0); for(let i=0;i<300;i++) C.step(bk,{},segs,C.P.H); for(const o of [bk.b,bk.wh[0],bk.wh[1],bk.r]) o.vx=v; const rd=C.makeRagdoll(bk); bk.rider=false;
  if(mode==='nolim') rd.lim=[]; let maxv=0;
  for(let i=0;i<300;i++){ C.stepRagdoll(rd,segs,1/60); for(const k in rd.pts){ const q=rd.pts[k]; maxv=Math.max(maxv,Math.hypot(q.x-q.px,q.y-q.py)*240); } }
  return [rd.pts.hip.x.toFixed(1), maxv.toFixed(0)]; }
for(const mode of ['lim','nolim']){ const r=[]; for(let i=0;i<10;i++) r.push(trial(4,mode).join('/')); console.log(mode.padEnd(6),r.join('  ')); }
