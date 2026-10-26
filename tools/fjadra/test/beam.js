const C=require('../../../src/core.js'); const {makeLevels}=require('../../../src/levels.js');
const GV={up:[0,10],down:[0,-10],left:[-10,0],right:[10,0]};
function clone(bk){ return {dir:bk.dir,gx:bk.gx,gy:bk.gy,voltT:bk.voltT,voltD:bk.voltD,lock:bk.lock,impact:0,contact:bk.contact.slice(),thr:bk.thr,flipT:bk.flipT,flipFrom:bk.flipFrom,lean:bk.lean,rider:bk.rider,crouchT:bk.crouchT,relT:bk.relT,hopped:0,assistT:bk.assistT,assistAge:bk.assistAge,assistTurned:bk.assistTurned,r:Object.assign({},bk.r),comp:bk.comp.slice(),compMem:bk.compMem.slice(),noPin:bk.noPin,prevBrake:bk.prevBrake,prevBack:bk.prevBack,backT:bk.backT,pumpCD:bk.pumpCD,bounced:0,pumped:0,
  b:Object.assign({},bk.b), wh:[Object.assign({},bk.wh[0],{pin:bk.wh[0].pin?Object.assign({},bk.wh[0].pin):null}),Object.assign({},bk.wh[1],{pin:bk.wh[1].pin?Object.assign({},bk.wh[1].pin):null})]}; }
const ACTS=[{brake:1,volt:1},{brake:1,volt:-1},{brake:1,lean:-1},{brake:1,lean:1},{lean:-1},{gas:1,lean:-1,brake:0},{gas:1},{gas:1,lean:1},{gas:1,lean:-1},{},{brake:1},{gas:1,volt:1},{gas:1,volt:-1},{gas:1,turn:1},{volt:1},{volt:-1},{gas:1,volt:-1,alo:1}];
function simSeg(l,node,act,dur){
  const bk=clone(node.bk); const got=node.got.slice(); const H=C.P.H; let t=node.t;
  if(act.turn) C.turn(bk); if(act.volt) C.volt(bk,act.volt,act.alo);
  const inp={gas:act.gas||0,brake:act.brake||0,lean:act.lean||0};
  const n=Math.round(dur/H);
  for(let i=0;i<n;i++){ C.step(bk,inp,l.segs,H); t+=H;
    if(C.headResolve(bk,l.segs)==='crash') return null;
    const [hx,hy]=C.headPos(bk); const pts=[[bk.wh[0].x,bk.wh[0].y,0.8],[bk.wh[1].x,bk.wh[1].y,0.8],[hx,hy,0.65]];
    for(let k=0;k<l.apples.length;k++){ if(got[k]) continue; const a=l.apples[k]; for(const [x,y,r] of pts) if(Math.hypot(x-a[0],y-a[1])<r){ got[k]=1; if(a[2]){C.setGravity(bk,GV[a[2]][0],GV[a[2]][1]);} break; } }
    for(const s of l.killers) for(const [x,y,r] of pts) if(Math.hypot(x-s[0],y-s[1])<r-0.05) return null;
    if(bk.b.y<l.bounds[1]-10||bk.b.y>l.bounds[3]+10) return null;
    if(got.every(Boolean)){ const fx=l.flower[0],fy=l.flower[1]+0.6; if(pts.some(([x,y])=>Math.hypot(x-fx,y-fy)<0.95)) return {bk,got,t,win:true,hist:node.hist.concat([act])}; }
  }
  return {bk,got,t,hist:node.hist.concat([act])};
}
function score(l,nd){ const g=nd.got.reduce((a,b)=>a+b,0); let tx,ty;
  if(g===nd.got.length){ tx=l.flower[0]; ty=l.flower[1]+0.6; }
  else if(l._ordered){ const k=nd.got.indexOf(0); tx=l.apples[k][0]; ty=l.apples[k][1]; } else { let best=1e9; l.apples.forEach((a,k)=>{ if(nd.got[k]) return; const d=Math.hypot(a[0]-nd.bk.b.x,a[1]-nd.bk.b.y); if(d<best){best=d;tx=a[0];ty=a[1];} }); }
  const d0=Math.hypot(tx-nd.bk.b.x,ty-nd.bk.b.y), d=d0<50?d0:Math.min(50+(d0-50)*0.2,99);   // långt bort: svagare lutning, så en stjärna alltid väger mer än avståndet till nästa (Maraton)
  const sp=Math.hypot(nd.bk.b.vx,nd.bk.b.vy);
  return g*1000 - d*10 + Math.min(sp,8)*0.5 + Math.random()*4; }
function plan(li,{K=40,dur=0.25,maxT=45,seed=1,ordered=false,level=null}={}){
  const l=level||makeLevels()[li]; l._ordered=ordered;
  let beam=[{bk:C.newBike(l.start[0],l.start[1]),got:l.apples.map(()=>0),t:0,hist:[]}];
  let bestG=0;
  for(let d=0; d*dur<maxT; d++){
    const nxt=[];
    for(const nd of beam) for(const a of ACTS){ const r=simSeg(l,nd,a,dur); if(!r) continue; if(r.win) return {win:true,t:r.t.toFixed(2),steps:r.hist.length,hist:r.hist}; r.s=score(l,r); nxt.push(r); }
    if(!nxt.length) return {dead:true,d};
    nxt.sort((a,b)=>b.s-a.s);
    const seen=new Set(); beam=[];
    for(const r of nxt){ const key=Math.round(r.bk.b.x/0.6)+','+Math.round(r.bk.b.y/0.6)+','+r.bk.dir+','+r.got.join(''); if(seen.has(key)) continue; seen.add(key); beam.push(r); if(beam.length>=K) break; }
    const g=Math.max(...beam.map(b=>b.got.reduce((a,c)=>a+c,0))); if(g>bestG) bestG=g;
  }
  const b=beam[0]; return {fail:true, got:b.got.join(''), x:b.bk.b.x.toFixed(1), y:b.bk.b.y.toFixed(1)};
}
module.exports={plan};
if(require.main===module){ const which=process.argv.slice(2).map(Number); const L=makeLevels();
  for(const i of (which.length?which:L.map((_,i)=>i))){ const t0=Date.now(); const r=plan(i); console.log(i+1,L[i].name,JSON.stringify(Object.assign({},r,{hist:undefined})),((Date.now()-t0)/1000).toFixed(1)+'s'); } }
