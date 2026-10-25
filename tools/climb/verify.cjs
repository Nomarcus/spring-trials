const {C,run}=require('./core.cjs'); const fs=require('fs');
const co=JSON.parse(fs.readFileSync(__dirname+'/course.json'));
const all=C.buildSegs(co.rings.map(p=>({pts:p})));
function local(x0,x1,y0,y1){ return all.filter(s=>s.maxx>x0&&s.minx<x1&&s.maxy>y0&&s.miny<y1); }
const res=[]; const only=process.argv[2];
for(let i=0;i<co.cps.length-1;i++){ const a=co.cps[i], b=co.cps[i+1]; if(only&&!(a.label===only||(a.label[0]===only&&only.length===1)||(only==='s'&&a.label==='start'))) continue;
  const segs=local(Math.min(a.x,b.x)-40,Math.max(a.x,b.x)+40,Math.min(a.y,b.y)-70,Math.max(a.y,b.y)+30);
  let ok=null,ok0=null;
  outer: for(const g of [3,1.5,5]) for(const sp of [4,6,8,5,7,9,10,3,11]){ const r=run(segs,[a.x,a.y],bk=>bk.b.x>=b.x&&bk.b.y>b.y-1.2&&bk.b.y<b.y+4,{speed:sp,gain:g,T:30}); if(r.ok){ ok={sp,g,t:r.t.toFixed(1)}; break outer; } }
  if(!ok){const r=run(segs,[a.x,a.y],bk=>false,{speed:6,T:20});ok0=r;} res.push([a.label+'->'+b.label, ok?('OK sp'+ok.sp+' g'+ok.g+' '+ok.t+'s'):("FAIL end "+(ok0&&[ok0.x.toFixed(1),ok0.y.toFixed(1)])+" goal "+b.x+","+b.y)]); console.log(res[res.length-1].join(' '));
}
fs.writeFileSync(__dirname+'/verify_'+(only||'all')+'.json',JSON.stringify(res));
