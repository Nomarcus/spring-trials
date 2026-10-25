const C=require(process.argv[2]||'../../../src/core.js');
const segs=C.buildSegs([[[-40,80],[-40,0],[200,0],[200,80]]]);
function trial(deg,rate,inp){ const bk=C.newBike(0,0); for(let i=0;i<300;i++) C.step(bk,{},segs,C.P.H);
  // rotate the whole bike nose-up around the rear contact point
  const th=deg*Math.PI/180, px=bk.wh[0].x, py=0; const rot=(o)=>{ const dx=o.x-px, dy=o.y-py; o.x=px+dx*Math.cos(th)-dy*Math.sin(th); o.y=py+dx*Math.sin(th)+dy*Math.cos(th); };
  rot(bk.b); rot(bk.wh[1]); rot(bk.wh[0]); rot(bk.r); bk.b.a+=th;
  for(const o of [bk.b,bk.wh[1],bk.r]){ const dx=o.x-px, dy=o.y-py; o.vx=-dy*rate; o.vy=dx*rate; } bk.b.w=rate;
  for(let i=0;i<600*2.5;i++){ C.step(bk,inp,segs,C.P.H); if(C.headHit(bk,segs)||bk.b.a>1.75) return 'flip'; }
  return bk.b.a<0.3?'saved':'hang('+(bk.b.a*57.3).toFixed(0)+'°)'; }
const rows=[]; for(const rate of [0,1.0,2.0]){ const r=['rate '+rate]; for(const d of [35,45,55,65,72,80]) r.push(d+'°:'+trial(d,rate,{brake:1,lean:-1})); rows.push(r.join('  ')); }
console.log(rows.join('\n'));
