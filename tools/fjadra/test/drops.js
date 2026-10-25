const C=require(process.argv[2]||'../../../src/core.js');
const segs=C.buildSegs([[[-40,80],[-40,0],[200,0],[200,80]]]);
function drop(h,ang,vx){ const bk=C.newBike(0,h); bk.b.a=ang*Math.PI/180; const c=Math.cos(bk.b.a), s=Math.sin(bk.b.a);
  for(const [w,lx] of [[bk.wh[0],-C.P.AX],[bk.wh[1],C.P.AX]]){ w.x=bk.b.x+lx*c-C.P.AY*s; w.y=bk.b.y+lx*s+C.P.AY*c; }
  const t=[bk.r.x-0,bk.r.y]; for(const o of [bk.b,bk.wh[0],bk.wh[1],bk.r]) o.vx=vx||0;
  let minClr=9, maxComp=0, minBody=9;
  for(let i=0;i<600*3;i++){ C.step(bk,{},segs,C.P.H); maxComp=Math.max(maxComp,bk.comp[0],bk.comp[1]); const [hx,hy]=C.headPos(bk); minClr=Math.min(minClr,hy-C.P.HR); minBody=Math.min(minBody,bk.b.y); if(C.headHit(bk,segs)) return 'DEAD'; }
  return 'ok c'+maxComp.toFixed(2)+' b'+minBody.toFixed(2); }
const rows=[]; for(const h of [1,2,4,6,8,10]){ const r=[(h+'m').padEnd(4)]; for(const a of [0,20,-20,35,-35]) r.push((a+'°:'+drop(h,a,4)).padEnd(22)); rows.push(r.join('')); } console.log(rows.join('\n'));
