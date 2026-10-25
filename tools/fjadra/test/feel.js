const C=require(process.argv[2]||'../../../src/core.js'); const segs=C.buildSegs([[[-40,80],[-40,0],[200,0],[200,80]]]);
function run(name,pol,T,start){ const bk=C.newBike(0,start||0); let t=0, maxY=[0,0], maxA=0, minA=0, info='';
  for(let i=0;i<T*600;i++){ const inp=pol(bk,t,i)||{}; if(inp.volt) C.volt(bk,inp.volt,inp.alo); C.step(bk,inp,segs,C.P.H); t+=C.P.H;
    if(t>0.5){ maxY[0]=Math.max(maxY[0],bk.wh[0].y-0.4); maxY[1]=Math.max(maxY[1],bk.wh[1].y-0.4); }
    maxA=Math.max(maxA,bk.b.a); minA=Math.min(minA,bk.b.a);
    if(C.headHit(bk,segs)) return console.log(name.padEnd(30),'HEAD at',t.toFixed(2),'x',bk.b.x.toFixed(1));
    if(bk.bounced){ info+=' bounce('+bk.bounced.toFixed(2)+')@'+t.toFixed(2); bk.bounced=0; } if(bk.pumped){ info+=' pump'; bk.pumped=0; } }
  console.log(name.padEnd(30),'x',bk.b.x.toFixed(2),'vx',bk.b.vx.toFixed(2),'lift r/f',maxY[0].toFixed(2),maxY[1].toFixed(2),'maxA',(maxA*57.3).toFixed(0),'minA',(minA*57.3).toFixed(0),info);
}
run('gas 1s',(bk,t)=>({gas:1}),1);
run('gas 2s',(bk,t)=>({gas:1}),2);
run('gas 4s',(bk,t)=>({gas:1}),4);
run('pump x6 no gas',(bk,t)=>{ const ph=(t%0.7); if(t<0.3) return {}; return {lean: ph<0.35?1:-1}; },4.5);
run('drop 1.2m, brake at land',(bk,t)=>{ let b=0; if(bk.contact[0]>0&&bk.comp[0]>0.15&&!bk._b){ bk._b=1; } if(bk._b) b=1; return {brake:b}; },2.5,1.2);
run('drop 1.2m, no brake',()=>({}),2.5,1.2);
run('lean back+brake press (flat)',(bk,t)=>{ if(t<0.6) return {}; if(t<0.9) return {lean:1}; if(t<1.5) return {lean:1,brake:1}; return {}; },3);
run('brutal volt: brake+back+volt',(bk,t,i)=>{ if(t<0.5) return {}; if(t<0.8) return {lean:1}; const v=(i===480||i===700||i===900)?1:0; if(t<2.0) return {lean:1,brake:1,volt:v}; return {}; },3.5);
run('drop 1.2m, brake at PEAK',(bk,t)=>{ if(!bk._pk){ bk._pk={m:0,go:0}; } const c=bk.comp[0]; if(bk.contact[0]>0){ if(c>bk._pk.m) bk._pk.m=c; else if(bk._pk.m>0.15 && c<bk._pk.m-0.005) bk._pk.go=1; } return {brake:bk._pk.go}; },2.5,1.2);
run('drop 2.5m, brake at PEAK',(bk,t)=>{ if(!bk._pk){ bk._pk={m:0,go:0}; } const c=bk.comp[0]; if(bk.contact[0]>0){ if(c>bk._pk.m) bk._pk.m=c; else if(bk._pk.m>0.15 && c<bk._pk.m-0.005) bk._pk.go=1; } return {brake:bk._pk.go}; },2.5,2.5);
run('drop 2.5m, no brake',()=>({}),2.5,2.5);
