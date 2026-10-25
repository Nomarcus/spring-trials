const C=require('../../../src/core.js'); const {makeLevels}=require('../../../src/levels.js'); const L=makeLevels(); const l=L.find(x=>x.id==='fjadra-pack2-08');
const bk=C.newBike(l.start[0],l.start[1]); const got=l.apples.map(()=>0); let t=0, phase=0, res='timeout';
for(let i=0;i<600*60;i++){
  const a=bk.b.a; let inp={};
  const bal=(tgt)=>{ const e=a-tgt; return e>0.12?-1:e<-0.12?1:0; };
  if(phase===0){ const tgt=bk.b.x>36&&bk.b.x<50?-0.4:0; inp={gas:bk.b.vx<(bk.b.x>28?2.5:5)?1:0, brake:bk.b.vx>(bk.b.x>28?3.5:7)?1:0, lean:bal(tgt)}; if(bk.b.x>51.5&&bk.b.y<-2){ phase=1; } }
  else if(phase===1){ inp={brake:1, lean:bal(0)}; if(Math.abs(bk.b.vx)<0.4){ C.turn(bk); phase=2; } }
  else { inp={gas:Math.abs(bk.b.vx)<5?1:0, brake:Math.abs(bk.b.vx)>7?1:0, lean:bal(0)}; }
  C.step(bk,inp,l.segs,C.P.H); t+=C.P.H;
  const [hx,hy]=C.headPos(bk); const pts=[[bk.wh[0].x,bk.wh[0].y,0.8],[bk.wh[1].x,bk.wh[1].y,0.8],[hx,hy,0.65]];
  l.apples.forEach((ap,k)=>{ if(got[k])return; for(const [x,y,r] of pts) if(Math.hypot(x-ap[0],y-ap[1])<r){got[k]=1; console.log(' star',k,t.toFixed(1)); break;} });
  const hr=C.headResolve(bk,l.segs); if(hr==='crash'){ res='CRASH '+t.toFixed(2)+' x'+bk.b.x.toFixed(1)+' y'+bk.b.y.toFixed(1)+' phase '+phase; break; }
  if(got.every(Boolean)&&pts.some(([x,y])=>Math.hypot(x-l.flower[0],y-l.flower[1]-0.6)<0.95)){ res='WIN '+t.toFixed(2); break; }
  if(i%1200===0) console.log(t.toFixed(2),'x',bk.b.x.toFixed(1),'y',bk.b.y.toFixed(2),'a',(bk.b.a*57.3).toFixed(0),'vx',bk.b.vx.toFixed(1),'vy',bk.b.vy.toFixed(1),'head',C.headPos(bk).map(v=>v.toFixed(2)).join(','),'c',bk.contact.join(','));
}
console.log(res, got.join(''));
