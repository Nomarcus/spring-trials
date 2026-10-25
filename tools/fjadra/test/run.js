const {plan}=require('./beam.js'); const {makeLevels}=require('../../../src/levels.js'); const L=makeLevels();
const ids=process.argv.slice(2).length?process.argv.slice(2).map(Number):L.map((_,i)=>i);
for(const i of ids){ let r; for(let k=0;k<3;k++){ r=plan(i,{K:k?70:40,maxT:+(process.env.MAXT||50),ordered:k===2}); if(r.win) break; } console.log(i,L[i].name,r.win?'WIN '+r.t:'FAIL '+JSON.stringify(Object.assign({},r,{hist:undefined}))); }
