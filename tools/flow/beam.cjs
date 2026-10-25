// Beam search over real game physics: proves each section can be driven (with crash rules of the main game).
const {C,P,L,all,clone,ACT,chunk}=require('./sim.cjs'); const fs=require('fs');
const S=JSON.parse(fs.readFileSync(__dirname+'/sections.json'));
const DT=0.15, N=Math.round(DT/P.H);
function search(si,start,opt={}){ const s=S[si], e=S[si+1]||{x0:L.flower[0],y0:L.flower[1],fin:1};
  const wps=s.wp.map(w=>({x:w[0],y:w[1],star:w[2]}));  // waypoints; star=index of apple that must be got
  wps.push({x:e.x0,y:e.y0+0.9,end:1});
  const xs=[s.x0,e.x0,...wps.map(w=>w.x)], ys=[s.y0,e.y0,...wps.map(w=>w.y)];
  const segs=all.filter(q=>q.maxx>Math.min(...xs)-25&&q.minx<Math.max(...xs)+25&&q.maxy>Math.min(...ys)-25&&q.miny<Math.max(...ys)+25);
  const score=st=>{ const w=wps[st.wi]; const d=Math.hypot(st.bk.b.x-w.x,st.bk.b.y-w.y); return st.wi*1000-d; };
  const adv=st=>{ while(st.wi<wps.length){ const w=wps[st.wi]; const ok=w.star!=null? st.got[w.star] : (w.end? (st.bk.b.x>=w.x-0.5&&Math.abs(st.bk.b.y-w.y)<2.5&&st.bk.contact[0]>0&&st.bk.contact[1]>0&&Math.cos(st.bk.b.a)>0.7&&Math.abs(st.bk.b.w)<2) : Math.hypot(st.bk.b.x-w.x,st.bk.b.y-w.y)<1.5); if(!ok) break; st.wi++; } };
  let beam=[{bk:start.bk,got:start.got.slice(),wi:0,path:[]}]; adv(beam[0]);
  const W=opt.W||120, maxIt=opt.it||Math.ceil((opt.T||40)/DT);
  for(let it=0;it<maxIt;it++){ const cand=new Map();
    for(const st of beam){ for(let ai=0;ai<ACT.length;ai++){ const ns={bk:clone(st.bk),got:st.got.slice(),wi:st.wi,path:st.path.concat(ai)};
        if(chunk(ns,ACT[ai],segs,N)) continue; adv(ns);
        if(ns.wi>=wps.length) return {ok:true,st:ns,t:(it+1)*DT};
        const b=ns.bk.b; const key=ns.wi+'|'+Math.round(b.x*2)+'|'+Math.round(b.y*2)+'|'+Math.round(b.a/0.6)+'|'+ns.bk.dir+'|'+Math.round(b.vx/1.5);
        ns.sc=score(ns); const o=cand.get(key); if(!o||o.sc<ns.sc) cand.set(key,ns); } }
    beam=[...cand.values()].sort((a,b)=>b.sc-a.sc).slice(0,W);
    if(!beam.length) return {ok:false,why:'all crashed'};
    if(opt.v&&it%20==0) console.log(' it',it,'best',beam[0].wi,beam[0].sc.toFixed(1),beam[0].bk.b.x.toFixed(1),beam[0].bk.b.y.toFixed(1)); }
  const b=beam[0]; return {ok:false,why:'timeout',wi:b.wi,x:b.bk.b.x,y:b.bk.b.y}; }
module.exports={search,S};
if(require.main===module){
  const only=process.argv[2]!=null?+process.argv[2]:null; const res=[];
  let st={bk:C.newBike(L.start[0],L.start[1]),got:L.apples.map(()=>0)};
  const saved=fs.existsSync(__dirname+'/states.json')?JSON.parse(fs.readFileSync(__dirname+'/states.json')):{};
  for(let i=0;i<S.length;i++){ if(only!=null){ if(i<only) continue; if(i>only) break; if(i>0&&saved[i]) st=saved[i]; }
    const t0=Date.now(); const r=search(i,st,{W:+process.argv[3]||120,T:+process.argv[4]||40,v:1});
    console.log(i+1,S[i].name,r.ok?'OK '+r.t.toFixed(1)+'s':'FAIL '+JSON.stringify(r),((Date.now()-t0)/1000).toFixed(0)+'s cpu');
    res.push({i:i+1,name:S[i].name,ok:r.ok,t:r.t,why:r.why}); if(!r.ok) break; st={bk:r.st.bk,got:r.st.got}; saved[i+1]=st; saved['path'+i]=r.st.path; fs.writeFileSync(__dirname+'/states.json',JSON.stringify(saved)); }
  fs.writeFileSync(__dirname+'/verify'+(only!=null?'_'+only:'')+'.json',JSON.stringify(res,null,1)); }
