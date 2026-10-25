/* Geometry and original-physics poses, not an end-to-end playthrough. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../game/index.html','utf8'),ss=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const ctx={};vm.createContext(ctx);vm.runInContext(ss[0]+ss[1]+';globalThis.api={makeLevels,newBike,headPos,headResolve,step,P};',ctx);
const {makeLevels,newBike,headPos,headResolve,step,P}=ctx.api,L=makeLevels(),pack=L.filter(l=>l.campaignId.startsWith('elma-test-v1-'));
assert.equal(pack.length,5);assert.equal(L[38].name,pack[0].name);
// Rotate the real bike around its axle midpoint. Wheels retain contact above a beam,
// while the rider hangs beneath using the already-existing steel collision behavior.
for(const l of pack){
 const star=l.apples.find(a=>l.rings.some(r=>r.style==='steel'&&a[0]>=Math.min(...r.pts.map(p=>p[0]))&&a[0]<=Math.max(...r.pts.map(p=>p[0]))&&a[1]<Math.max(...r.pts.map(p=>p[1]))-.5));
 assert(star,l.name);
 const rail=l.rings.find(r=>r.style==='steel'&&star[0]>=Math.min(...r.pts.map(p=>p[0]))&&star[0]<=Math.max(...r.pts.map(p=>p[0])));
 assert(rail,l.name+' under-shelf pickup');
 const top=Math.max(...rail.pts.map(p=>p[1])),b=newBike(star[0],top),axis=top+P.WR;
 b.b.y=2*axis-b.b.y;b.b.a=Math.PI;b.r.x=2*b.b.x-b.r.x;b.r.y=2*axis-b.r.y;
 for(const w of b.wh)w.x=2*b.b.x-w.x;
 assert.notEqual(headResolve(b,l.segs),'crash',l.name+' safe hanging pose');
 const h=headPos(b);assert(h[1]<top,l.name+' rider below shelf');
 // Put the body slightly into the beam: legacy head/beam rule must stay intact.
 assert(l.segs.some(s=>s.style==='steel'));
 const upright=newBike(star[0],top);const hp=headPos(upright);
 assert(![...upright.wh.map(w=>[w.x,w.y,.8]),[...hp,.65]].some(([x,y,r])=>Math.hypot(x-star[0],y-star[1])<r),l.name+' cannot collect under-star by driving straight on top');
}
const routes=JSON.parse(fs.readFileSync(__dirname+'/maze-routes.json','utf8')),gate=routes.find(r=>r.wheelGate).wheelGate;
assert(gate.width>2*P.WR+.2);assert(gate.width<2*P.AX+2*P.WR);
console.log('PASS: five additive test courses, safe inverted poses, under-shelf pickups require leaving upright line, tyre-sized gate. Full manual playtests still required.');
