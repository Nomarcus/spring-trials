const C=require('../../../src/core.js');
const segs=C.buildSegs([[[-30,60],[-30,0],[60,0],[60,60]]]);
function run(name,seq,T=3,log){ const bk=C.newBike(0,0); let t=0, maxW=[0,0], minHead=9, maxA=-9;
  const evs=seq.slice(); let cur={};
  for(let i=0;i<T*600;i++){ while(evs.length&&evs[0].t<=t){ const e=evs.shift(); cur=Object.assign({},cur,e.set||{}); if(e.volt) C.volt(bk,e.volt); }
    C.step(bk,cur,segs,C.P.H); t+=C.P.H;
    if(t>1){ maxW[0]=Math.max(maxW[0],bk.wh[0].y-0.4); maxW[1]=Math.max(maxW[1],bk.wh[1].y-0.4); }
    if(C.headHit(bk,segs)) return console.log(name,'HEAD',t.toFixed(2));
    if(log&&i%60===0) console.log(t.toFixed(2),'rw',(bk.wh[0].y-0.4).toFixed(2),'fw',(bk.wh[1].y-0.4).toFixed(2),'r',C.riderLocal(bk).map(v=>v.toFixed(2)).join(','),'a',(bk.b.a*57.3).toFixed(0));
  }
  console.log(name.padEnd(28),'rear lift',maxW[0].toFixed(2),'front lift',maxW[1].toFixed(2),'x',bk.b.x.toFixed(2),'ang',(bk.b.a*57.3).toFixed(0));
}
run('rest',[],3);
run('brake+back -> fwd',[{t:1,set:{brake:1,lean:1}},{t:1.35,set:{lean:-1}},{t:1.7,set:{lean:0,brake:0}}]);
run('back -> fwd (no brake)',[{t:1,set:{lean:1}},{t:1.35,set:{lean:-1}},{t:1.7,set:{lean:0}}]);
run('back 0.2s -> fwd',[{t:1,set:{brake:1,lean:1}},{t:1.2,set:{lean:-1}},{t:1.6,set:{lean:0,brake:0}}]);
run('fwd -> back (wheelie hop)',[{t:1,set:{lean:-1}},{t:1.3,set:{lean:1}},{t:1.7,set:{lean:0}}]);
run('back 0.3 -> fwd rolling 4m/s',[{t:0,set:{gas:1}},{t:0.9,set:{gas:0,lean:1}},{t:1.2,set:{lean:-1}},{t:1.6,set:{lean:0}}]);
run('gas 1.5s',[{t:0,set:{gas:1}},{t:1.5,set:{gas:0}}],3);
