const C=require(process.argv[2]||'../../../src/core.js'); const {makeLevels}=require(process.argv[3]||'../../../src/levels.js'); const L=makeLevels(); const l=L.find(x=>x.id==='fjadra-pack2-11');
function trial(v,brakeAt,leanPol){ const bk=C.newBike(-2,4.5); let t=0, braking=false, maxImp=0, res='ok', hangT=0, gotStar=false; const st=l.apples[1];
  for(let i=0;i<600*14;i++){ let inp;
    if(!braking){ inp={gas:bk.b.vx<v?1:0, brake:bk.b.vx>v+0.6?1:0}; if(bk.wh[0].x>brakeAt) braking=true; } else inp={brake:1, lean:leanPol?leanPol(bk,t):0};
    C.step(bk,inp,l.segs,C.P.H); t+=C.P.H;
    const [hx,hy]=C.headPos(bk); if(Math.hypot(bk.wh[1].x-st[0],bk.wh[1].y-st[1])<0.8||Math.hypot(hx-st[0],hy-st[1])<0.65||Math.hypot(bk.wh[0].x-st[0],bk.wh[0].y-st[1])<0.8) gotStar=true;
    const hr=C.headResolve(bk,l.segs); if(hr==='crash'){ res='CRASH@'+t.toFixed(1); break; }
    if(bk.wh[0].pin||bk.wh[1].pin) hangT+=C.P.H; }
  return (res+' hang '+hangT.toFixed(1)+'s'+(gotStar?' ★':'')).padEnd(22); }
for(const v of [1.0,1.8,2.6,3.4]){ const row=['v '+v]; for(const ba of [8.4,9.0,9.5,9.8,10.1]) row.push('brake@'+ba+': '+trial(v,ba)); console.log(row.join('  ')); }
