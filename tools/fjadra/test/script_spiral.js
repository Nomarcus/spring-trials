// Skriptad körning av Spiralschaktet (paket 3, bana 27): full gas, max ~4 m/s när tyngden pekar uppåt, vänd när cykeln står still.
// Bevis för att banan går att klara: node script_spiral.js
const C=require('../../../src/core.js'); const {makeLevels}=require('../../../src/levels.js'); const l=makeLevels().find(x=>x.id==='fjadra-p3-27');
const bk=C.newBike(l.start[0],l.start[1]); const got=l.apples.map(()=>0); const GV={up:[0,10],down:[0,-10],left:[-10,0],right:[10,0]};
let lastTurn=0, res='timeout';
for(let i=0;i<60*600;i++){ const t=i/600, sp=Math.hypot(bk.b.vx,bk.b.vy);
  const inp={gas:(bk.gy>0&&sp>4)?0:1, brake:(bk.gy>0&&sp>6)?1:0};
  if(sp<0.3&&t-lastTurn>2&&t>3&&bk.flipT<0){ C.turn(bk); lastTurn=t; }
  C.step(bk,inp,l.segs,C.P.H);
  if(C.headResolve(bk,l.segs)==='crash'){ res='CRASH '+t.toFixed(1); break; }
  const [hx,hy]=C.headPos(bk); const pts=[[bk.wh[0].x,bk.wh[0].y,0.8],[bk.wh[1].x,bk.wh[1].y,0.8],[hx,hy,0.65]];
  l.apples.forEach((a,k)=>{ if(!got[k]&&pts.some(([x,y,r])=>Math.hypot(x-a[0],y-a[1])<r)){ got[k]=1; if(a[2]) C.setGravity(bk,GV[a[2]][0],GV[a[2]][1]); } });
  if(got.every(Boolean)&&pts.some(([x,y])=>Math.hypot(x-l.flower[0],y-l.flower[1]-0.6)<0.95)){ res='WIN '+t.toFixed(2); break; }
}
console.log('Spiralschaktet',res,got.join(''));
