// ================= BANEDITOR =================
// Bygg egna banor och justera de inbyggda. Allt sparas i webbläsaren (localStorage):
//   fjadra.mine  = [banfil, …]  egna banor (ID 'mine-…', visas under fliken Mina banor)
//   fjadra.edits = {banID: banfil}  ändrade inbyggda banor (ersätter originalet tills man återställer)
// Banfil = {v,id,name,theme,hint,stuck,top,start,flower,apples,rings} – samma format som EDITS i levels.js.
// "Kopiera bankod" ger banfilen som text; tools/fjadra/import_level.py bakar in den i spelet.
// Editorn ritar banan med spelets egen grafik (state 'edit'): ingen fysik körs, kameran styrs med fingrarna.
const ED_THEMES=[['meadow','Äng'],['sunset','Solnedgång'],['winter','Vinter'],['cave','Grotta']];
const ED_MATS=[['wood','Trä'],['steel','Stål'],['stone','Sten'],['crate','Låda'],['log','Stock'],[null,'Mark']];
const ED_SOFT=[0,1,2,4,8];
const ED_DIRS=['up','right','down','left'];
const ED_TIPS={move:'Dra i marken för att forma den. Dra stjärnor, start, blomma och block. Två fingrar flyttar och zoomar.',
  add:'Tryck på en linje för att lägga till en punkt och dra den dit du vill.', del:'Tryck på en punkt, stjärna eller ett block för att ta bort det.',
  star:'Tryck där stjärnan ska ligga.', gstar:'Tryck där den blå stjärnan ska ligga. Tryck på en stjärna för att byta riktning.',
  block:'Tryck där blocket ska ligga, dra för att flytta. Trä och stål: huvudet åker igenom, hjulen kör på. Mark mitt i marken gör en grotta.'};
let ed=null, edTesting=false;
const ORIG={};   // inbyggda banor innan de ändrades i editorn (för Återställ original)
const r3=v=>Math.round(v*1000)/1000;
function edGet(k,def){ try{ const s=localStorage.getItem(k); return s?JSON.parse(s):def; }catch(e){ return def; } }
function edPut(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function edDocOf(l){ return {v:1,id:l.id,name:l.name,theme:l.theme,hint:l.hint||'',stuck:l.stuck||'',top:l.top||TOP,start:l.start.slice(),flower:l.flower.slice(),
  apples:l.apples.map(a=>a.slice()),rings:l.rings.map(r=>r.style?{style:r.style,pts:r.pts.map(p=>[r3(p[0]),r3(p[1])])}:{pts:r.pts.map(p=>[r3(p[0]),r3(p[1])])})}; }
function edNewDoc(name){ const g=[]; for(let x=0;x<=80;x++) g.push([x,0]);
  return {v:1,id:'mine-'+Date.now().toString(36),name,theme:'meadow',hint:'',stuck:'',top:TOP,start:[2,0],flower:[74,0],apples:[[30,0.75]],rings:[{pts:[[-6,TOP],[-6,0],...g,[86,0],[86,TOP]]}]}; }
function edMineLevel(d){ return levelFromDoc(d,{pack:'mine',medal:null}); }
// körs en gång vid start: lägg in sparade ändringar och egna banor i LEVELS
function edBoot(){ const edits=edGet('fjadra.edits',{});
  LEVELS.forEach((l,i)=>{ const d=edits[l.id]; if(!d) return; try{ ORIG[l.id]=l; LEVELS[i]=levelFromDoc(d,{pack:l.pack,medal:l.medal,edited:true}); }catch(e){ LEVELS[i]=l; } });
  for(const d of edGet('fjadra.mine',[])){ try{ LEVELS.push(edMineLevel(d)); }catch(e){} } }

// ---------- öppna / stänga ----------
function edOpen(i){ let doc, src;
  if(i==null||i<0){ const n=LEVELS.filter(l=>l.pack==='mine').length+1; doc=edNewDoc('Min bana '+n); src='mine'; }
  else { const l=LEVELS[i]; doc=edDocOf(l); src=l.pack==='mine'?'mine':'edit'; }
  edStart(doc,src,i==null||i<0); }
function edStart(doc,src,isNew){ audioInit(); for(const k in inp) inp[k]=0;
  ed={doc,src,isNew:!!isNew,tool:'move',soft:2,mat:'wood',gdir:'up',undo:[],redo:[],dirty:!!isNew,drag:null,ptrs:new Map(),pinch:null,anT:0};
  edTesting=false; pausedState=null; hideOv(); $('edMore').classList.remove('show'); state='edit'; parts=[]; rag=null; pops=[]; bloom=0;
  document.body.classList.add('editing'); document.body.classList.remove('testing'); edSync(true); edHome(); edUI(); toast(ED_TIPS.move,3600); }
function edIdle(l){ lvl=l; setTheme(l.theme); if(!l.vis) analyze(l); bike=newBike(l.start[0],l.start[1]); got=l.apples.map(()=>false); cam.x=bike.b.x+5; cam.y=bike.b.y+1.2; parts=[]; rag=null; }
function edClose(){ if(ed.dirty&&!confirm('Du har osparade ändringar. Stänga editorn ändå?')) return;
  const id=ed.doc.id, src=ed.src; ed=null; document.body.classList.remove('editing'); $('edMore').classList.remove('show');
  curPack=src==='mine'?'mine':3; edIdle(LEVELS.find(l=>l.id===id)||LEVELS[0]); zoom=0.86; SC=SC0*zoom; showMenu(); }
// visningsobjektet som spelets ritkod använder (delar punkterna med banfilen, så ändringar syns direkt)
function edSync(full){ const d=ed.doc;
  if(!lvl||lvl._ed!==d) lvl={_ed:d,killers:[],hint:'',stuck:''};
  Object.assign(lvl,{rings:d.rings,apples:d.apples,flower:d.flower,start:d.start,theme:d.theme,name:d.name,top:d.top});
  if(full||!lvl.segs) finishLevel(lvl); lvl.steelSegs=[]; setTheme(d.theme);   // under en dragning räcker det att ritningen delar punkterna
  if(full||!lvl.vis){ analyze(lvl); ed.anT=performance.now(); }
  bike=newBike(d.start[0],d.start[1]); got=d.apples.map(()=>false); }
function edCount(){ let n=0; for(const r of ed.doc.rings) n+=r.pts.length; return n; }

// ---------- ångra ----------
const edSnap=()=>JSON.stringify(ed.doc);
function edPush(snap){ ed.undo.push(snap||edSnap()); if(ed.undo.length>40) ed.undo.shift(); ed.redo=[]; ed.dirty=true; edUI(); }
function edUndo(){ if(!ed.undo.length) return; ed.redo.push(edSnap()); ed.doc=JSON.parse(ed.undo.pop()); ed.dirty=true; ed.drag=null; edSync(true); edUI(); }
function edRedo(){ if(!ed.redo.length) return; ed.undo.push(edSnap()); ed.doc=JSON.parse(ed.redo.pop()); ed.dirty=true; ed.drag=null; edSync(true); edUI(); }

// ---------- kamera ----------
const edW=(sx,sy)=>[cam.x+(sx-W/2)/SC, cam.y-(sy-Hh/2)/SC];
function edExtent(){ const d=ed.doc; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; const add=(x,y)=>{ x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); };
  for(const r of d.rings) for(const p of r.pts) if(p[1]<d.top-1) add(p[0],p[1]); for(const a of d.apples) add(a[0],a[1]); add(d.flower[0],d.flower[1]+1.5); add(d.start[0],d.start[1]+1.5); return [x0,y0,x1,y1]; }
function edFit(){ const [x0,y0,x1,y1]=edExtent(); SC=Math.max(0.3,Math.min(60,Math.min(W/(x1-x0+4),(Hh-140)/(y1-y0+4)))); cam.x=(x0+x1)/2; cam.y=(y0+y1)/2; }
function edHome(){ edFit(); if(SC>=SC0*0.5) return; SC=SC0*0.55; cam.x=ed.doc.start[0]-2+W/2/SC; cam.y=ed.doc.start[1]+2.5; }   // korta banor: allt syns, långa: börja vid starten
function edZoom(f,sx,sy){ if(sx==null){ sx=W/2; sy=Hh/2; } const [wx,wy]=edW(sx,sy); SC=Math.max(0.3,Math.min(90,SC*f)); cam.x=wx-(sx-W/2)/SC; cam.y=wy+(sy-Hh/2)/SC; }

// ---------- träffytor ----------
function edHitObj(x,y){ const d=ed.doc, r=26/SC; let best=null, bd=r;
  const chk=(kind,i,px,py,rad)=>{ const dd=Math.hypot(px-x,py-y); if(dd<Math.max(bd,rad||0)&&(!best||dd<bd)){ bd=dd; best={kind,i}; } };
  d.apples.forEach((a,i)=>chk('apple',i,a[0],a[1]));
  chk('flower',0,d.flower[0],d.flower[1]+0.7,0.8); chk('start',0,d.start[0],d.start[1]+0.6,0.9); chk('start',0,d.start[0]-0.8,d.start[1]+1.6,0.8); return best; }
function edHitPt(x,y){ const r=22/SC; let best=null, bd=r;
  ed.doc.rings.forEach((rg,ri)=>{ const p=rg.pts; for(let i=0;i<p.length;i++){ const dx=p[i][0]-x; if(dx>bd||dx<-bd) continue; const dd=Math.hypot(dx,p[i][1]-y); if(dd<bd){ bd=dd; best={ri,i}; } } }); return best; }
function edHitSeg(x,y){ const r=24/SC; let best=null, bd=r;
  ed.doc.rings.forEach((rg,ri)=>{ const p=rg.pts, n=p.length; for(let i=0;i<n;i++){ const a=p[i], b=p[(i+1)%n];
    if(Math.min(a[0],b[0])-bd>x||Math.max(a[0],b[0])+bd<x||Math.min(a[1],b[1])-bd>y||Math.max(a[1],b[1])+bd<y) continue;
    const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy||1e-9, t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l2)), px=a[0]+dx*t, py=a[1]+dy*t, dd=Math.hypot(px-x,py-y);
    if(dd<bd){ bd=dd; best={ri,i,px,py}; } } }); return best; }
function edHitRing(x,y){ const R=ed.doc.rings; for(let ri=R.length-1;ri>=1;ri--) if(pointInRing(x,y,R[ri].pts)) return ri; return -1; }
// punkten man drar i + grannarna längs linjen inom mjukhetsradien (mjuk kurva, så tätt samplad mark inte får spikar)
function edGrab(ri,i){ const p=ed.doc.rings[ri].pts, n=p.length, R=ed.soft, out=[[i,1,p[i][0],p[i][1]]];
  if(R>0&&!ed.doc.rings[ri].style) for(const dir of [1,-1]){ let d=0, k=i; for(let s=1;s<n/2;s++){ const k2=(k+dir+n)%n; d+=Math.hypot(p[k2][0]-p[k][0],p[k2][1]-p[k][1]); if(d>=R) break;
    out.push([k2,0.5*(1+Math.cos(Math.PI*d/R)),p[k2][0],p[k2][1]]); k=k2; } }
  return out; }
function edBlock(x,y,mat){ const R=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>[r3(p[0]),r3(p[1])]);
  if(mat==='wood') return {style:'wood',pts:R(x-1.5,y-0.17,x+1.5,y+0.17)};
  if(mat==='steel') return {style:'steel',pts:R(x-1.5,y-0.15,x+1.5,y+0.15)};
  if(mat==='stone') return {style:'stone',pts:R(x-0.8,y-0.8,x+0.8,y+0.8)};
  if(mat==='crate') return {style:'crate',pts:R(x-0.45,y-0.45,x+0.45,y+0.45)};
  if(mat==='log'){ const p=[]; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; p.push([r3(x+Math.cos(a)*0.35),r3(y+Math.sin(a)*0.35)]); } return {style:'log',pts:p}; }
  return {pts:R(x-1.5,y-0.6,x+1.5,y+0.6)}; }

// ---------- pekfinger ----------
// fingret väntar tills det rör sig eller släpps innan något händer, så att en tvåfingerszoom inte råkar lägga ut eller ta bort saker
function edDown(sx,sy){ ed.pend={sx,sy}; }
function edAct(sx,sy){ const [x,y]=edW(sx,sy), d=ed.doc, t=ed.tool;
  const pan=()=>{ ed.drag={type:'pan',sx,sy,cx:cam.x,cy:cam.y}; };
  const dragPts=(ri,i,snap)=>{ ed.drag={type:'pts',ri,list:edGrab(ri,i),x0:x,y0:y,sx,sy,snap}; };
  const dragObj=(o,snap)=>{ const a=o.kind==='apple'?d.apples[o.i]:o.kind==='flower'?d.flower:d.start; ed.drag={type:'obj',o,ax:a[0],ay:a[1],x0:x,y0:y,sx,sy,snap}; };
  const dragRing=(ri,snap)=>{ ed.drag={type:'ring',ri,orig:d.rings[ri].pts.map(p=>p.slice()),x0:x,y0:y,sx,sy,snap}; };
  if(t==='move'){ const o=edHitObj(x,y); if(o) return dragObj(o,edSnap()); const p=edHitPt(x,y); if(p) return dragPts(p.ri,p.i,edSnap());
    const ri=edHitRing(x,y); if(ri>0) return dragRing(ri,edSnap()); return pan(); }
  if(t==='add'){ const p=edHitPt(x,y); if(p) return dragPts(p.ri,p.i,edSnap()); const s=edHitSeg(x,y); if(!s) return pan();
    edPush(); d.rings[s.ri].pts.splice(s.i+1,0,[r3(s.px),r3(s.py)]); edSync(); const keep=ed.soft; ed.soft=0; dragPts(s.ri,s.i+1,null); ed.soft=keep; return; }
  if(t==='del'){ const o=edHitObj(x,y);
    if(o&&o.kind==='apple'){ edPush(); d.apples.splice(o.i,1); edSync(); return; }
    if(o){ toast(o.kind==='start'?'Starten kan inte tas bort – dra den i stället':'Blomman kan inte tas bort – dra den i stället'); return; }
    const p=edHitPt(x,y);
    if(p){ const rg=d.rings[p.ri]; if(rg.pts.length<=3){ if(p.ri===0) return toast('Marken behöver minst tre punkter'); edPush(); d.rings.splice(p.ri,1); } else { edPush(); rg.pts.splice(p.i,1); } edSync(true); return; }
    const ri=edHitRing(x,y); if(ri>0){ edPush(); d.rings.splice(ri,1); edSync(true); return; } return pan(); }
  if(t==='star'||t==='gstar'){ const o=edHitObj(x,y);
    if(o&&o.kind==='apple'){ if(t==='star') return dragObj(o,edSnap()); const a=d.apples[o.i]; edPush(); const k=a[2]?ED_DIRS.indexOf(a[2])+1:0;
      if(k>=ED_DIRS.length) a.length=2; else a[2]=ED_DIRS[k]; edSync(); toast(a[2]?'Blå stjärna: tyngden '+({up:'uppåt',down:'nedåt',left:'åt vänster',right:'åt höger'})[a[2]]:'Vanlig stjärna',1300); return; }
    edPush(); d.apples.push(t==='gstar'?[r3(x),r3(y),ed.gdir]:[r3(x),r3(y)]); edSync(); return dragObj({kind:'apple',i:d.apples.length-1},null); }
  if(t==='block'){ const ri=edHitRing(x,y); if(ri>0) return dragRing(ri,edSnap());
    edPush(); d.rings.push(edBlock(x,y,ed.mat)); edSync(true); return dragRing(d.rings.length-1,null); } }
function edMove(sx,sy){ const pe=ed.pend; if(pe){ if(Math.hypot(sx-pe.sx,sy-pe.sy)<6) return; ed.pend=null; edAct(pe.sx,pe.sy); }
  const dr=ed.drag; if(!dr) return;
  if(dr.type==='pan'){ cam.x=dr.cx-(sx-dr.sx)/SC; cam.y=dr.cy+(sy-dr.sy)/SC; return; }
  if(!dr.moved){ if(Math.hypot(sx-dr.sx,sy-dr.sy)<5) return; dr.moved=true; if(dr.snap) edPush(dr.snap); }
  const [x,y]=edW(sx,sy), dx=x-dr.x0, dy=y-dr.y0, d=ed.doc; let rx, ry;
  if(dr.type==='pts'){ const p=d.rings[dr.ri].pts; for(const [k,w,px,py] of dr.list){ p[k][0]=r3(px+dx*w); p[k][1]=r3(py+dy*w); } rx=p[dr.list[0][0]][0]; ry=p[dr.list[0][0]][1]; }
  else if(dr.type==='obj'){ const a=dr.o.kind==='apple'?d.apples[dr.o.i]:dr.o.kind==='flower'?d.flower:d.start; a[0]=r3(dr.ax+dx); a[1]=r3(dr.ay+dy); rx=a[0]; ry=a[1]; }
  else if(dr.type==='ring'){ const p=d.rings[dr.ri].pts; dr.orig.forEach((q,k)=>{ p[k][0]=r3(q[0]+dx); p[k][1]=r3(q[1]+dy); }); rx=dx; ry=dy; }
  edSync(false); if(performance.now()-ed.anT>150&&edCount()<1500){ analyze(lvl); ed.anT=performance.now(); }
  $('edRead').textContent=dr.type==='ring'?'flytta '+rx.toFixed(1)+' · '+ry.toFixed(1):'x '+rx.toFixed(1)+' · y '+ry.toFixed(1); }
function edUp(){ const pe=ed.pend; ed.pend=null; if(pe) edAct(pe.sx,pe.sy); const dr=ed.drag; ed.drag=null; $('edRead').textContent=''; if(dr&&dr.type!=='pan'&&(dr.moved||!dr.snap)) edSync(true); }
cv.addEventListener('pointerdown',e=>{ if(state!=='edit') return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){}
  ed.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ed.ptrs.size===2){ ed.pend=null; edUp(); const [a,b]=[...ed.ptrs.values()], mx=(a.x+b.x)/2, my=(a.y+b.y)/2; ed.pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,sc:SC,w:edW(mx,my)}; return; }
  if(ed.ptrs.size===1) edDown(e.clientX,e.clientY); });
cv.addEventListener('pointermove',e=>{ if(state!=='edit'||!ed.ptrs.has(e.pointerId)) return; ed.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ed.pinch&&ed.ptrs.size>=2){ const [a,b]=[...ed.ptrs.values()], mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    SC=Math.max(0.3,Math.min(90,ed.pinch.sc*Math.hypot(a.x-b.x,a.y-b.y)/ed.pinch.d)); cam.x=ed.pinch.w[0]-(mx-W/2)/SC; cam.y=ed.pinch.w[1]+(my-Hh/2)/SC; return; }
  if(!ed.pinch) edMove(e.clientX,e.clientY); });
const edPtrUp=e=>{ if(!ed||!ed.ptrs.has(e.pointerId)) return; ed.ptrs.delete(e.pointerId); if(ed.ptrs.size<2&&ed.pinch){ if(!ed.ptrs.size) ed.pinch=null; return; } if(!ed.ptrs.size){ ed.pinch=null; edUp(); } };
cv.addEventListener('pointerup',edPtrUp); cv.addEventListener('pointercancel',edPtrUp);
cv.addEventListener('wheel',e=>{ if(state!=='edit') return; e.preventDefault(); edZoom(Math.exp(-e.deltaY*0.0015),e.clientX,e.clientY); },{passive:false});

// ---------- ritning ovanpå banan ----------
function edDraw(){ const d=ed.doc, v=view(); worldT(); ctx.lineJoin='round';
  ctx.beginPath(); for(const r of d.rings) ringPath(r.pts); ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.6/SC; ctx.stroke();
  // osynligt tak
  ctx.beginPath(); ctx.moveTo(v[0],d.top); ctx.lineTo(v[2],d.top); ctx.setLineDash([8/SC,6/SC]); ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.5/SC; ctx.stroke(); ctx.setLineDash([]);
  if(SC>9){ const rr=(SC>24?4.6:3.2)/SC, gap=13/SC; ctx.beginPath();   // täta punkter (inbyggda banor) ritas glesare – alla går ändå att ta tag i
    for(const r of d.rings){ let lx=1e9, ly=1e9; for(const p of r.pts){ if(p[0]<v[0]||p[0]>v[2]||p[1]<v[1]||p[1]>v[3]) continue; if(Math.abs(p[0]-lx)<gap&&Math.abs(p[1]-ly)<gap) continue; lx=p[0]; ly=p[1]; ctx.moveTo(p[0]+rr,p[1]); ctx.arc(p[0],p[1],rr,0,6.283); } }
    ctx.fillStyle='#ffffff'; ctx.fill(); ctx.strokeStyle='#18324f'; ctx.lineWidth=1.3/SC; ctx.stroke(); }
  const dr=ed.drag;
  if(dr&&dr.type==='pts'){ const p=d.rings[dr.ri].pts, rr=6/SC; for(const [k,w] of dr.list){ ctx.globalAlpha=0.35+0.65*w; ctx.beginPath(); ctx.arc(p[k][0],p[k][1],rr*(0.6+0.4*w),0,6.283); ctx.fillStyle='#f2b81f'; ctx.fill(); }
    ctx.globalAlpha=1; if(ed.soft>0){ const q=p[dr.list[0][0]]; ctx.beginPath(); ctx.arc(q[0],q[1],ed.soft,0,6.283); ctx.strokeStyle='rgba(242,184,31,.7)'; ctx.lineWidth=1.5/SC; ctx.stroke(); } }
  if(dr&&dr.type==='ring'){ ctx.beginPath(); ringPath(d.rings[dr.ri].pts); ctx.strokeStyle='#f2b81f'; ctx.lineWidth=3/SC; ctx.stroke(); }
  // start: flagga vid bakhjulet så man ser var man börjar även när cykeln är liten
  const s=d.start, f=d.flower; ctx.lineWidth=2.2/SC; ctx.strokeStyle='#18324f';
  ctx.beginPath(); ctx.moveTo(s[0]-1.1,s[1]); ctx.lineTo(s[0]-1.1,s[1]+2.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s[0]-1.1,s[1]+2.2); ctx.lineTo(s[0]-0.2,s[1]+1.9); ctx.lineTo(s[0]-1.1,s[1]+1.6); ctx.closePath(); ctx.fillStyle='#3fae37'; ctx.fill(); ctx.stroke();
  if(SC<14){ ctx.beginPath(); ctx.arc(f[0],f[1]+0.9,7/SC,0,6.283); ctx.fillStyle='#fff'; ctx.fill(); ctx.stroke(); for(const a of d.apples){ ctx.beginPath(); ctx.arc(a[0],a[1],5/SC,0,6.283); ctx.fillStyle=a[2]?'#5fb8ff':'#ffd23f'; ctx.fill(); ctx.stroke(); } } }

// ---------- verktyg ----------
function edSplitRing(rg,maxLen,top,only){ const p=rg.pts, out=[];
  for(let i=0;i<p.length;i++){ const a=p[i], b=p[(i+1)%p.length]; out.push(a); if(a[1]>=top-0.01&&b[1]>=top-0.01) continue; if(only&&!only(a,b)) continue;
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/maxLen); for(let k=1;k<n;k++) out.push([r3(a[0]+(b[0]-a[0])*k/n),r3(a[1]+(b[1]-a[1])*k/n)]); }
  rg.pts=out; }
function edSplit(){ edPush(); for(const rg of ed.doc.rings) if(!rg.style) edSplitRing(rg,1,ed.doc.top); edSync(true); toast('Långa linjer delade i 1 m-bitar – nu går de att forma',2200); }
function edExtend(){ edPush(); const rg=ed.doc.rings[0], p=rg.pts; let mx=-1e9; for(const q of p) mx=Math.max(mx,q[0]);
  for(const q of p) if(q[0]>mx-0.01) q[0]=r3(q[0]+20); edSplitRing(rg,1,ed.doc.top,(a,b)=>Math.max(a[0],b[0])>mx+0.5&&Math.min(a[0],b[0])<mx+19.5);
  edSync(true); cam.x=mx+10; toast('Banan är 20 m längre åt höger',1800); }
function edTool(t){ ed.tool=t; edUI(); toast(ED_TIPS[t],t==='block'?4200:2600); }
function edOpt(){ const t=ed.tool;
  if(t==='move'||t==='add'){ ed.soft=ED_SOFT[(ED_SOFT.indexOf(ed.soft)+1)%ED_SOFT.length]; toast(ed.soft?'Mjuk: punkter inom '+ed.soft+' m följer med':'Skarp: bara punkten du drar i flyttas',1800); }
  else if(t==='gstar'){ ed.gdir=ED_DIRS[(ED_DIRS.indexOf(ed.gdir)+1)%4]; }
  else if(t==='block'){ const k=ED_MATS.findIndex(m=>m[0]===ed.mat); ed.mat=ED_MATS[(k+1)%ED_MATS.length][0]; }
  edUI(); }
function edUI(){ if(!ed) return; const t=ed.tool;
  document.querySelectorAll('#ed [data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
  const o=$('edOpt'); let txt='';
  if(t==='move'||t==='add') txt=ed.soft?'Mjuk '+ed.soft+' m':'Skarp'; else if(t==='gstar') txt='Tyngd '+GARROW[ed.gdir]; else if(t==='block') txt=ED_MATS.find(m=>m[0]===ed.mat)[1];
  o.textContent=txt; o.style.display=txt?'':'none';
  $('edUndo').disabled=!ed.undo.length; $('edRedo').disabled=!ed.redo.length; $('edSave').classList.toggle('dirty',ed.dirty); $('edName').textContent=ed.doc.name||'Namnlös'; }

// ---------- spara / testa ----------
function edClean(d){ return {v:1,id:d.id,name:(d.name||'Namnlös').slice(0,40),theme:d.theme,hint:d.hint||'',stuck:d.stuck||'',top:d.top,start:d.start,flower:d.flower,apples:d.apples,rings:d.rings.map(r=>r.style?{style:r.style,pts:r.pts}:{pts:r.pts})}; }
function edSave(){ const c=JSON.parse(JSON.stringify(edClean(ed.doc))), id=c.id, i=LEVELS.findIndex(l=>l.id===id);
  if(ed.src==='mine'){ const list=edGet('fjadra.mine',[]), k=list.findIndex(x=>x.id===id); if(k<0) list.push(c); else list[k]=c;
    if(!edPut('fjadra.mine',list)) return toast('Kunde inte spara – lagringen är full',2600);
    const L=edMineLevel(c); if(i<0) LEVELS.push(L); else LEVELS[i]=L; }
  else { const m=edGet('fjadra.edits',{}); m[id]=c; if(!edPut('fjadra.edits',m)) return toast('Kunde inte spara – lagringen är full',2600);
    if(!ORIG[id]) ORIG[id]=LEVELS[i]; LEVELS[i]=levelFromDoc(c,{pack:LEVELS[i].pack,medal:LEVELS[i].medal,edited:true}); try{ localStorage.removeItem('fjadra.g4.'+id); }catch(e){} }
  ed.dirty=false; ed.isNew=false; edUI(); toast(ed.src==='mine'?'Sparad under Mina banor':'Sparad – banan i spelet är nu din version',2200); }
function edTest(){ const L=levelFromDoc(edClean(ed.doc),{pack:'test',medal:null,stuck:ed.doc.stuck});
  ed.cam={x:cam.x,y:cam.y,sc:SC}; ed.ptrs.clear(); ed.pinch=null; ed.drag=null; edTesting=true; zoom=0.86; SC=SC0*zoom;
  document.body.classList.remove('editing'); document.body.classList.add('testing'); loadLevel(-1,L); }
function edBack(){ if(!ed) return; edTesting=false; for(const k in inp) inp[k]=0; document.querySelectorAll('.k.on').forEach(b=>b.classList.remove('on'));
  document.body.classList.remove('testing'); document.body.classList.add('editing'); hideOv(); state='edit'; parts=[]; rag=null; pops=[]; bloom=0;
  edSync(true); cam.x=ed.cam.x; cam.y=ed.cam.y; SC=ed.cam.sc; edUI(); }

// ---------- inställningar (Mer-panelen) ----------
function edMore(){ const d=ed.doc; $('edNameIn').value=d.name; $('edHintIn').value=d.hint||''; $('edCode').style.display='none'; $('edCodeGo').style.display='none';
  $('edThemes').innerHTML=''; for(const [k,n] of ED_THEMES){ const b=document.createElement('button'); b.className='tab'+(d.theme===k?' on':''); b.textContent=n;
    b.onclick=()=>{ if(d.theme===k) return; edPush(); d.theme=k; edSync(true); edMore(); }; $('edThemes').appendChild(b); }
  $('edReset').style.display=ed.src==='edit'&&ORIG[d.id]?'':'none'; $('edDelete').style.display=ed.src==='mine'&&!ed.isNew?'':'none';
  $('edInfo').textContent=(ed.src==='mine'?'Egen bana':'Inbyggd bana')+' · '+edCount()+' punkter · '+d.apples.length+' stjärnor';
  $('edMore').classList.add('show'); }
function edMoreDone(){ const d=ed.doc, n=$('edNameIn').value.trim()||d.name, h=$('edHintIn').value.trim();
  if(n!==d.name||h!==(d.hint||'')){ edPush(); d.name=n.slice(0,40); d.hint=h.slice(0,200); edSync(false); }
  $('edMore').classList.remove('show'); edUI(); }
async function edCopy(){ const s=JSON.stringify(edClean(ed.doc)), ta=$('edCode'); ta.value=s; ta.style.display='block'; $('edCodeGo').style.display='none'; ta.focus(); ta.select();
  let ok=false; try{ await navigator.clipboard.writeText(s); ok=true; }catch(e){ try{ ok=document.execCommand('copy'); }catch(_){} }
  toast(ok?'Bankoden är kopierad. Skicka den till Claude så läggs banan in i spelet.':'Markera texten i rutan och kopiera den',4200); }
function edPasteOpen(){ const ta=$('edCode'); ta.value=''; ta.style.display='block'; $('edCodeGo').style.display=''; ta.focus(); toast('Klistra in en bankod i rutan och tryck Läs in',2600); }
function edPasteGo(){ let d; try{ d=JSON.parse($('edCode').value.trim()); }catch(e){ return toast('Koden gick inte att läsa – kopierades hela?',2600); }
  const okPt=p=>Array.isArray(p)&&p.length>=2&&isFinite(p[0])&&isFinite(p[1]);
  if(!d||!Array.isArray(d.rings)||!d.rings.length||!d.rings.every(r=>r&&Array.isArray(r.pts)&&r.pts.length>=3&&r.pts.every(okPt))||!okPt(d.start)||!okPt(d.flower)||!Array.isArray(d.apples)||!d.apples.every(okPt))
    return toast('Det där ser inte ut som en bankod',2400);
  if(ed.dirty&&!confirm('Ersätta banan du håller på med? Osparade ändringar försvinner.')) return;
  const built=LEVELS.find(l=>l.id===d.id&&l.pack!=='mine');
  const doc={v:1,id:built?d.id:(String(d.id||'').startsWith('mine-')?d.id:'mine-'+Date.now().toString(36)),name:String(d.name||'Inläst bana').slice(0,40),theme:ED_THEMES.some(t=>t[0]===d.theme)?d.theme:'meadow',
    hint:String(d.hint||''),stuck:String(d.stuck||''),top:isFinite(d.top)?+d.top:TOP,start:d.start.slice(0,2),flower:d.flower.slice(0,2),
    apples:d.apples.map(a=>ED_DIRS.includes(a[2])?[+a[0],+a[1],a[2]]:[+a[0],+a[1]]),rings:d.rings.map(r=>{ const pts=r.pts.map(p=>[+p[0],+p[1]]); return ED_MATS.some(m=>m[0]&&m[0]===r.style)?{style:r.style,pts}:{pts}; })};
  $('edMore').classList.remove('show'); edStart(doc,built?'edit':'mine',true); toast('Banan är inläst – tryck Spara för att behålla den',2600); }
function edReset(){ const id=ed.doc.id; if(!ORIG[id]||!confirm('Återställa originalbanan? Dina ändringar av den tas bort.')) return;
  const m=edGet('fjadra.edits',{}); delete m[id]; edPut('fjadra.edits',m); const i=LEVELS.findIndex(l=>l.id===id); LEVELS[i]=ORIG[id]; delete ORIG[id];
  $('edMore').classList.remove('show'); edStart(edDocOf(LEVELS[i]),'edit',false); toast('Originalbanan är tillbaka',1800); }
function edDelete(){ const id=ed.doc.id; if(!confirm('Ta bort banan "'+ed.doc.name+'" för alltid?')) return;
  edPut('fjadra.mine',edGet('fjadra.mine',[]).filter(x=>x.id!==id)); const i=LEVELS.findIndex(l=>l.id===id); if(i>=0) LEVELS.splice(i,1);
  delete best[id]; saveBest(); try{ localStorage.removeItem('fjadra.g4.'+id); }catch(e){}
  $('edMore').classList.remove('show'); ed.dirty=false; edClose(); }

$('edClose').onclick=()=>edClose(); $('edUndo').onclick=()=>edUndo(); $('edRedo').onclick=()=>edRedo(); $('edFitB').onclick=()=>edFit();
$('edTest').onclick=()=>edTest(); $('edSave').onclick=()=>edSave(); $('edMoreB').onclick=()=>edMore(); $('edName').onclick=()=>edMore();
$('edZin').onclick=()=>edZoom(1.4); $('edZout').onclick=()=>edZoom(1/1.4); $('edOpt').onclick=()=>edOpt();
document.querySelectorAll('#ed [data-tool]').forEach(b=>b.onclick=()=>edTool(b.dataset.tool));
$('edMoreOk').onclick=edMoreDone; $('edSplitB').onclick=()=>{ edMoreDone(); edSplit(); }; $('edExtendB').onclick=()=>{ edMoreDone(); edExtend(); };
$('edCopyB').onclick=edCopy; $('edPasteB').onclick=edPasteOpen; $('edCodeGo').onclick=edPasteGo; $('edReset').onclick=edReset; $('edDelete').onclick=edDelete;
$('bEdBack').onclick=()=>edBack(); $('bToEd').onclick=()=>edBack();
