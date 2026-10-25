const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(__dirname+'/../../game/index.html','utf8');
const ss=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const ctx={console};vm.createContext(ctx);
vm.runInContext(ss[0]+'\nglobalThis.core={P,newBike,step,headResolve,headPos,buildSegs,turn,volt};',ctx);
const C=ctx.core; C.P.HEAD_SAFE=1e9;
// bot: drive right (dir) with speed target, align to slope
function run(segs,start,goal,opt={}){const {speed=4,gain=3,T=40,dir=1}=opt;const P=C.P;const bk=C.newBike(start[0],start[1]);if(dir<0)C.turn(bk);
 const near=segs; let minY=1e9;
 const ground=x=>{let best=-1e9;for(const q of segs){if(x<q.minx||x>q.maxx||Math.abs(q.dx)<1e-5)continue;const y=q.y1+(x-q.x1)*q.dy/q.dx;if(y<bk.b.y+.6&&y>best)best=y;}return best;};
 for(let n=0;n<T/P.H;n++){ if(n%6===0){ var yl=ground(bk.b.x-1),yr=ground(bk.b.x+1);}
  let ang=Math.atan2(yr-yl,2); if(!isFinite(ang)||Math.abs(yr-yl)>1.8||(bk.contact[0]<.5&&bk.contact[1]<.5))ang=0;
  const err=Math.atan2(Math.sin(ang-bk.b.a),Math.cos(ang-bk.b.a));
  const lean=Math.max(-1,Math.min(1,err*gain-bk.b.w*.5-bk.dir*.1));
  const v=bk.b.vx*bk.dir; const gas=v<speed?1:0;
  C.step(bk,{gas,brake:0,lean},segs,P.H); C.headResolve(bk,segs);
  if(goal(bk))return{ok:true,t:n*P.H,bk};
  if(bk.b.y<-50)break;}
 return{ok:false,x:bk.b.x,y:bk.b.y};}
module.exports={C,run};
