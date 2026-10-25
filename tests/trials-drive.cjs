const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game/index.html'),'utf8');const ss=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const ctx={console};vm.createContext(ctx);vm.runInContext(ss[0]+ss[1]+'\nglobalThis.core={P,newBike,createLevelBike,step,headResolve,headPos,makeLevels,turn};',ctx);const {P,newBike,step,headResolve,headPos,makeLevels}=ctx.core;const L=makeLevels();
function run(index,gain,damp,speed){const l=L[index],bk=ctx.core.createLevelBike(l),got=l.apples.map(()=>false);let reached=false,maxX=bk.b.x;
 const ground=x=>{let best=-1e9;for(const s of l.segs){if(x<s.minx||x>s.maxx||Math.abs(s.dx)<1e-5)continue;const y=s.y1+(x-s.x1)*s.dy/s.dx;if(y<bk.b.y+.4&&y>best)best=y;}return best;};
 for(let n=0;n<100/P.H;n++){const left=ground(bk.b.x-1),right=ground(bk.b.x+1);let target=Math.atan2(right-left,2);if(!isFinite(target)||Math.abs(right-left)>5)target=0;
 const err=Math.atan2(Math.sin(target-bk.b.a),Math.cos(target-bk.b.a));const lean=Math.max(-1,Math.min(1,err*gain-bk.b.w*damp-bk.dir*.1));const gas=bk.b.vx*bk.dir<speed;step(bk,{gas,lean},l.segs,P.H);if(headResolve(bk,l.segs)==='crash')return {ok:false,reason:'crash',x:bk.b.x};
 const hp=headPos(bk),pts=[[bk.wh[0].x,bk.wh[0].y,.8],[bk.wh[1].x,bk.wh[1].y,.8],[...hp,.65]];
 for(let i=0;i<got.length;i++)if(pts.some(([x,y,r])=>Math.hypot(x-l.apples[i][0],y-l.apples[i][1])<r))got[i]=true;
 if(got.every(Boolean)&&pts.some(([x,y])=>Math.hypot(x-l.flower[0],y-l.flower[1]-.6)<.95))return{ok:true,time:n*P.H,got};maxX=Math.max(maxX,bk.b.x);
 }return {ok:false,reason:'timeout',maxX,got};}
// A core-physics integration test with continuous analog lean; not a touch/keyboard playtest.
for(const [name,gain]of [['Pumpstranden',3],['Vänstervägen',1.5],['Medvinden',1.5],['Bergsbestigaren',3],['Rutschkanan',1.5],['Skålens rytm',1.5],['Två snabba bågar',3],['Toppen från höger',3],['Sista flytet',3]]){const i=L.findIndex(l=>l.name===name);assert(i>=0,name);const result=run(i,gain,.5,3);assert(result.ok,name+': '+JSON.stringify(result));console.log('PASS: '+name+' — all pickups and finish reached ('+result.time.toFixed(2)+' s).');}
