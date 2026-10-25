const {C,run}=require('./core.cjs'); const co=require('./course.json');
const all=C.buildSegs(co.rings.map(p=>({pts:p})));
for(const a of co.abysses){ const h=a.hole; const sx=a.x1-6; const rise=(sx-a.x0)*Math.tan(2.5*Math.PI/180);
  const segs=all.filter(s=>s.maxx>h.x-30&&s.minx<a.x1+10&&s.maxy>a.floor-10&&s.miny<a.lip+40);
  let ok=null; for(const g of [3,1.5,5]) for(const sp of [4,6,3,8]){ if(ok) break; const r=run(segs,[sx,a.floor+rise+0.05],bk=>bk.b.x<h.x-3&&bk.b.y>h.y-0.5,{speed:sp,gain:g,dir:-1,T:90}); if(r.ok) ok={sp,g,t:r.t.toFixed(1)}; else if(sp===4&&g===3) console.log(' end',r.x.toFixed(1),r.y.toFixed(1)); }
  console.log('abyss x',a.x0.toFixed(0),'-',a.x1.toFixed(0),'depth',(a.lip-a.floor).toFixed(0),'floor->hole',ok?'OK '+JSON.stringify(ok):'FAIL', 'hole at',h.x.toFixed(1),h.y.toFixed(1)); }
