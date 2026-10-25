const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(__dirname+'/../../game/index.html','utf8');
const ss=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const ctx={console};vm.createContext(ctx);
vm.runInContext(ss[0]+'\nglobalThis.core={P,newBike,step,headResolve,headPos,buildSegs,turn,volt};',ctx);
const C=ctx.core; const P=C.P;
const L=JSON.parse(fs.readFileSync(__dirname+'/../../levels/flodet.json'));
const all=C.buildSegs(L.rings);
const clone=bk=>JSON.parse(JSON.stringify(bk));
const ACT=[]; for(const l of [-1,0,1]){ ACT.push({gas:1,brake:0,lean:l}); ACT.push({gas:0,brake:1,lean:l}); ACT.push({gas:0,brake:0,lean:l}); }
ACT.push({gas:1,brake:0,lean:0,ev:'turn'}); ACT.push({gas:1,brake:0,lean:1,ev:'v+'}); ACT.push({gas:1,brake:0,lean:-1,ev:'v-'});
// simulate chunk; returns false on crash
function chunk(st,a,segs,n){ const bk=st.bk; if(a.ev==='turn') C.turn(bk); if(a.ev==='v+') C.volt(bk,1,false); if(a.ev==='v-') C.volt(bk,-1,false);
  for(let i=0;i<n;i++){ C.step(bk,a,segs,P.H); if(C.headResolve(bk,segs)==='crash') return 'head';
    if(i%3===0){ const [hx,hy]=C.headPos(bk); const pts=[[bk.wh[0].x,bk.wh[0].y,0.8],[bk.wh[1].x,bk.wh[1].y,0.8],[hx,hy,0.65]];
      for(const k of L.killers) for(const [x,y,r] of pts) if(Math.hypot(x-k[0],y-k[1])<r-0.05) return 'killer';
      for(let k=0;k<L.apples.length;k++) if(!st.got[k]) for(const [x,y,r] of pts) if(Math.hypot(x-L.apples[k][0],y-L.apples[k][1])<r){ st.got[k]=1; break; }
      if(!isFinite(bk.b.x)) return 'nan'; } }
  return null; }
module.exports={C,P,L,all,clone,ACT,chunk};
