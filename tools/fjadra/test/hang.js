const C=require(process.argv[2]||'../../../src/core.js');
// Stenhyllans geometri (den gamla paket 2-banan) ligger kvar här som testbana för hänget
const TOP=40, l={start:[-10,4.5], apples:[[4,5.25],[8.2,2.85],[25.5,2.95]], rings:[{pts:[[-14,TOP],[-14,4.5],[9.3,4.5],[9.55,4.62],[9.95,4.64],[10.05,4.55],[10.05,4.08],[8.5,3.98],[6.5,3.9],[5.2,3.6],[5,3.1],[5,2.3],[8,1.6],[11,0.75],[14,0.1],[15,0],[22,0],[29,4.5],[38,4.5],[38,TOP]]}]};
l.segs=C.buildSegs(l.rings);
function trial(v,brakeAt,leanPol){ const bk=C.newBike(-2,4.5); let t=0, braking=false, maxImp=0, res='ok', hangT=0, gotStar=false; const st=l.apples[1];
  for(let i=0;i<600*14;i++){ let inp;
    if(!braking){ inp={gas:bk.b.vx<v?1:0, brake:bk.b.vx>v+0.6?1:0}; if(bk.wh[0].x>brakeAt) braking=true; } else inp={brake:1, lean:leanPol?leanPol(bk,t):0};
    C.step(bk,inp,l.segs,C.P.H); t+=C.P.H;
    const [hx,hy]=C.headPos(bk); if(Math.hypot(bk.wh[1].x-st[0],bk.wh[1].y-st[1])<0.8||Math.hypot(hx-st[0],hy-st[1])<0.65||Math.hypot(bk.wh[0].x-st[0],bk.wh[0].y-st[1])<0.8) gotStar=true;
    const hr=C.headResolve(bk,l.segs); if(hr==='crash'){ res='CRASH@'+t.toFixed(1); break; }
    if(bk.wh[0].pin||bk.wh[1].pin) hangT+=C.P.H; }
  return (res+' hang '+hangT.toFixed(1)+'s'+(gotStar?' ★':'')).padEnd(22); }
for(const v of [1.0,1.8,2.6,3.4]){ const row=['v '+v]; for(const ba of [8.4,9.0,9.5,9.8,10.1]) row.push('brake@'+ba+': '+trial(v,ba)); console.log(row.join('  ')); }
