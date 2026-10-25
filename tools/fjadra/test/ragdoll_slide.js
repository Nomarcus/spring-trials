const C=require('../../../src/core.js'); const segs=C.buildSegs([[[-40,80],[-40,0],[300,0],[300,80]]]);
for(const v of [4,8,12]){ const bk=C.newBike(0,0); for(let i=0;i<300;i++) C.step(bk,{},segs,C.P.H);
  for(const o of [bk.b,bk.wh[0],bk.wh[1],bk.r]) o.vx=v; const rd=C.makeRagdoll(bk); bk.rider=false; const out=[];
  for(let i=1;i<=240;i++){ C.stepRagdoll(rd,segs,1/60); C.step(bk,{},segs,C.P.H); C.step(bk,{},segs,C.P.H); if(i%40===0){ out.push('t'+(i/60).toFixed(1)+' hip '+rd.pts.hip.x.toFixed(1)+'/'+rd.pts.hip.y.toFixed(1)+' head y'+rd.pts.head.y.toFixed(1)); } }
  // joint sanity: segment lengths preserved
  const d=(a,b)=>Math.hypot(rd.pts[a].x-rd.pts[b].x,rd.pts[a].y-rd.pts[b].y);
  console.log('v'+v, out.join(' | '), '| thigh',d('hip','knee').toFixed(2),'shin',d('knee','foot').toFixed(2)); }
