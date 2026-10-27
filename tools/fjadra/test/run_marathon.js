// Testboten på Maraton, del för del: varje del startar stilla på en viloplatå och ska nå nästa platå med alla stjärnor
// som ligger däremellan.  node run_marathon.js [del...]   (del = 1–10, utan argument = alla)   MAXT=sekunder per del (standard 90)
// LEVEL=<ban-ID> kör en annan bana som har parts (t.ex. LEVEL=fjadra-p3-31).
const {plan}=require('./beam.js'); const {makeLevels}=require('../../../src/levels.js');
const M=makeLevels().find(l=>l.id===(process.env.LEVEL||'fjadra-p3-30')); const P=M.parts.concat([[M.flower[0]+1,M.flower[1]]]);
const which=process.argv.slice(2).map(Number); const list=which.length?which:P.slice(0,-1).map((_,i)=>i+1);
for(const k of list){ const [x0,y0]=P[k-1], [x1,y1]=P[k];
  const sub=Object.assign({},M,{start:[x0+(k===1?2:-3),y0], apples:M.apples.filter(a=>a[0]>x0-0.5&&a[0]<x1-0.5), flower:[x1-1.5,y1],
    segs:M.segs.filter(s=>s.maxx>x0-30&&s.minx<x1+30)});   // bara segmenten runt delen – samma geometri, mycket snabbare
  let r; for(let a=0;a<3;a++){ r=plan(0,{K:a?70:40,maxT:+(process.env.MAXT||90),ordered:a===2,level:sub}); if(r.win) break; }
  console.log('del',k,'x',Math.round(x0)+'–'+Math.round(x1),'stjärnor',sub.apples.length,r.win?'WIN '+r.t:'FAIL '+JSON.stringify(Object.assign({},r,{hist:undefined}))); }
