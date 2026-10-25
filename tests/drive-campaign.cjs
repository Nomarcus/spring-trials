const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game/index.html'),'utf8');const ss=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const ctx={console};vm.createContext(ctx);vm.runInContext(ss[0]+ss[1]+'\nglobalThis.core={P,newBike,step,headResolve,headPos,makeLevels,turn};',ctx);const {P,newBike,step,headResolve,headPos,makeLevels}=ctx.core;const L=makeLevels();

const plans=JSON.parse(fs.readFileSync(path.join(__dirname,'maze-routes.json'),'utf8'));
function solve(index,gain=3,speed=3){const l=L[index],bk=newBike(...l.start),got=l.apples.map(()=>false),route=plans[index].route;let wi=0;
 const ground=x=>{let best=-1e9;for(const q of l.segs){if(x<q.minx||x>q.maxx||Math.abs(q.dx)<1e-5)continue;const y=q.y1+(x-q.x1)*q.dy/q.dx;if(y<bk.b.y+.4&&y>best)best=y;}return best;};
 for(let n=0;n<260/P.H;n++){const t=route[Math.min(wi,route.length-1)];const dx=t[0]-bk.b.x,dy=t[1]+.95-bk.b.y;if(Math.abs(dx)<1.4&&Math.abs(dy)<1.0&&wi<route.length-1){wi++;continue;}
 let gas=0,brake=0;const wanted=dx>=0?1:-1;
 if(Math.abs(dx)<1.3&&dy<-1.4){brake=1;}else if(wanted!==bk.dir){if(Math.abs(bk.b.vx)>.5)brake=1;else{ctx.core.turn(bk);}}else{gas=bk.b.vx*bk.dir<speed?1:0;}
 const yl=ground(bk.b.x-1),yr=ground(bk.b.x+1);let angle=Math.atan2(yr-yl,2);if(!Number.isFinite(angle)||Math.abs(yr-yl)>1.8||(bk.contact[0]<.5&&bk.contact[1]<.5))angle=0;const err=Math.atan2(Math.sin(angle-bk.b.a),Math.cos(angle-bk.b.a));const lean=Math.max(-1,Math.min(1,err*gain-bk.b.w*.5-bk.dir*.1));
 step(bk,{gas,brake,lean},l.segs,P.H);if(headResolve(bk,l.segs)==='crash')return{ok:false,reason:'crash',waypoint:wi,x:bk.b.x,y:bk.b.y};const hp=headPos(bk),ps=[[bk.wh[0].x,bk.wh[0].y,.8],[bk.wh[1].x,bk.wh[1].y,.8],[...hp,.65]];
 for(let i=0;i<got.length;i++)if(ps.some(([x,y,r])=>Math.hypot(x-l.apples[i][0],y-l.apples[i][1])<r))got[i]=true;
 if(got.every(Boolean)&&ps.some(([x,y])=>Math.hypot(x-l.flower[0],y-l.flower[1]-.6)<.95))return{ok:true,time:n*P.H};
 }return{ok:false,reason:'timeout',waypoint:wi,x:bk.b.x,y:bk.b.y,got};
}
// This is a core-physics integration test with an analog feedback controller,
// not a claim that keyboard/touch gameplay or every expert route has been tested.
// Check all pickups and the original finish radius on the first seven courses.
for(const [i,gain,speed] of [[0,1.5,3],[1,3,3],[2,3,3],[3,3,3],[4,5,2.5],[5,5,2.5],[6,1.5,2.5]]){
 const result=solve(i,gain,speed);assert(result.ok,L[i].name+': '+JSON.stringify(result));
 console.log('PASS: '+L[i].name+' — all pickups and finish reached ('+result.time.toFixed(2)+' s).');
}
