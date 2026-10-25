/* Run: node tests/levels.test.cjs [--base=<git ref>]. No npm dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
// Parse all scripts, including the unexecuted DOM/audio/rendering portion.
scripts.forEach(s=>new vm.Script(s));
const base=process.argv.find(s=>s.startsWith('--base='));
if(base){
 const prior=execFileSync('git',['show',base.slice(7)+':game/index.html'],{cwd:root,encoding:'utf8'});
 const outside=s=>{const start=s.indexOf('// ===== Levels'),end=s.indexOf('\n</script>',start);assert(start>0&&end>start);return [s.slice(0,start),s.slice(end).replaceAll('bike=createLevelBike(lvl)','bike=newBike(lvl.start[0],lvl.start[1])').replaceAll('cam.x=bike.b.x+2*(lvl.startDir||1);','cam.x=bike.b.x+2;').replaceAll('cam.x=bike.b.x+5*(lvl.startDir||1);','cam.x=bike.b.x+5;').replaceAll('const sorted=l.noDeco?[]:tops.filter(','const sorted=tops.filter(')];};
 assert.deepEqual(outside(html),outside(prior),'Physics, graphics, controls, ragdoll, saves and audio must be byte-identical outside the level block');
}
const context={};vm.createContext(context);
vm.runInContext(scripts[0]+scripts[1]+'\nglobalThis.core={P,makeLevels,newBike,createLevelBike,step,headResolve,headPos};',context);
const {P,makeLevels,newBike,createLevelBike,step,headResolve}=context.core;
const levels=makeLevels(),routes=JSON.parse(fs.readFileSync(path.join(__dirname,'maze-routes.json'),'utf8'));
assert.equal(levels.length,38);assert.equal(new Set(levels.map(l=>l.name)).size,38);
assert.equal(new Set(levels.map(l=>l.campaignId)).size,38);
function inRing(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
const air=(l,x,y)=>l.rings.reduce((inside,r)=>inside!==inRing(x,y,r.pts),false);
function distance(l,x,y){let best=Infinity;for(const s of l.segs){const t=Math.max(0,Math.min(1,((x-s.x1)*s.dx+(y-s.y1)*s.dy)/s.l2));best=Math.min(best,Math.hypot(x-s.x1-t*s.dx,y-s.y1-t*s.dy));}return best;}
let maxSegments=0;
levels.forEach((l,i)=>{
 assert.equal(l.name,routes[i].name);assert(l.apples.length>=3);assert(l.medal[0]>0&&l.medal[1]>l.medal[0]);
 assert(l.segs.length<350,`${l.name}: avoid excessive collision work on phones (${l.segs.length})`);
 maxSegments=Math.max(maxSegments,l.segs.length);
 for(const s of l.segs){assert(s.l2>1e-8);for(const v of [s.x1,s.y1,s.x2,s.y2])assert(Number.isFinite(v));}
 for(const [x,y] of l.apples){assert(air(l,x,y),`${l.name}: star embedded in ground`);assert(distance(l,x,y)>.3,`${l.name}: star has no pickup clearance`);}
 for(const [x,y] of routes[i].route){assert(air(l,x,y+1.5),`${l.name}: route head blocked at ${x},${y}`);}
 assert(air(l,l.flower[0],l.flower[1]+.65),`${l.name}: blocked finish`);
 const bike=createLevelBike(l);assert.equal(bike.dir,l.startDir||1);
 for(let n=0;n<Math.round(2/P.H);n++){step(bike,{},l.segs,P.H);assert.notEqual(headResolve(bike,l.segs),'crash',`${l.name}: spawn crashes`);}
 assert(Math.abs(bike.b.x-l.start[0])<.2,`${l.name}: rolling spawn`);
 assert(Number.isFinite(bike.b.y)&&Math.abs(bike.b.y-(l.start[1]+.95))<.8,`${l.name}: unstable spawn`);
});
assert(routes[0].routeLength<35,'First course should remain very short and gentle');
assert(routes.filter(r=>r.floors>=3).length>=7,'Campaign should contain substantial multilayer mazes');
assert(routes.at(-1).routeLength>1000,'Final maze must be meaningfully longer than the introduction');
assert(routes.slice(0,4).every(r=>r.branches===0),'No underpass puzzle before the very easy introduction');
console.log(`PASS: 38 courses, valid pickups and route headroom, 38 stable physics spawns, max ${maxSegments} collision segments.`);
if(base)console.log('PASS: data-only scope check; only authored start-facing and technical sightline initialization differ outside the level block.');

assert.equal(levels.filter(l=>l.campaignId.startsWith('trials-v1-')).length,24);
assert(levels.filter(l=>l.startDir===-1).length>=4,'Need multiple authored right-side starts');
for(const r of routes)for(const slot of r.wheelSlots||[])assert(slot.width>=2*P.WR+.15,'Wheel pockets must physically fit the original tyres');
for(const r of routes.filter(r=>r.wheelSlots?.length===2))assert(Math.abs(r.wheelSlots[1].x-r.wheelSlots[0].x-2*P.AX)<.001,'Docks must match the real wheelbase');
for(const kind of ['half-circle','double-bowl','uphill','leftward-uphill','vertical-descent','wheel-docks','precision-turnaround'])assert(routes.some(r=>r.kind===kind),'Missing distinct course type '+kind);
