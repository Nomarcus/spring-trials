// ================= BANEDITOR =================
// Bygg egna banor och justera de inbyggda. Allt sparas i webbläsaren (localStorage):
//   fjadra.mine  = [banfil, …]  egna banor (ID 'mine-…', visas under fliken Mina banor)
//   fjadra.edits = {banID: banfil}  ändrade inbyggda banor (ersätter originalet tills man återställer)
// Banfil = {v,id,name,theme,hint,stuck,top,start,flower,apples,rings} – samma format som EDITS i levels.js.
// "Kopiera bankod" ger banfilen som text; tools/fjadra/import_level.py bakar in den i spelet.
// Editorn ritar banan med spelets egen grafik (state 'edit'): ingen fysik körs, kameran styrs med fingrarna.
const ED_THEMES=[['meadow','Meadow'],['sunset','Sunset'],['winter','Winter'],['cave','Cave']];
const ED_MATS=[['wood','Wood'],['steel','Steel'],['stone','Stone'],['crate','Crate'],['log','Log'],[null,'Ground']];
const ED_SOFT=[0,1,2,4,8];
const ED_DIRS=['up','right','down','left'];
const ED_DRAW=[['ground','Ground','#3fae37'],['solid','Rock','#8a7c6c'],['wood','Plank','#a0703f'],['steel','Steel','#8a8f96']];
const ED_TIPS={draw:'Draw with your finger or pen. Ground: draw the track from left to right – every new stroke adds to it (extend at the ends or redraw a part). Rock, Plank, Steel: draw pieces on top. Close a shape to make a rock.',move:'Drag the ground to shape it. Drag stars, start, flower and blocks. Two fingers pan and zoom.',
  add:'Tap a line to add a point and drag it where you want.', del:'Tap a point, star or block to delete it.',
  star:'Tap where the star should go.', gstar:'Tap where the blue star should go. Tap a star to change its direction.',
  block:'Drag to draw a block as long as you want – planks and steel follow the direction you drag, stone, crates and ground become a box. Tap for a standard block, drag a block to move it. Wood and steel: the head passes through, the wheels ride on them. Ground placed inside the ground makes a cave.'};
let ed=null, edTesting=false;
const ORIG={};   // inbyggda banor innan de ändrades i editorn (för Återställ original)
const r3=v=>Math.round(v*1000)/1000;
function edGet(k,def){ try{ const s=localStorage.getItem(k); return s?JSON.parse(s):def; }catch(e){ return def; } }
function edPut(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function edDocOf(l){ return {v:1,id:l.id,name:l.name,theme:l.theme,hint:l.hint||'',stuck:l.stuck||'',top:l.top||TOP,start:l.start.slice(),flower:l.flower.slice(),
  apples:l.apples.map(a=>a.slice()),...(l.tips?{tips:l.tips.map(t=>t.slice())}:{}),rings:l.rings.map(r=>r.style?{style:r.style,pts:r.pts.map(p=>[r3(p[0]),r3(p[1])])}:{pts:r.pts.map(p=>[r3(p[0]),r3(p[1])])})}; }
function edNewDoc(name){ const g=[]; for(let x=0;x<=80;x++) g.push([x,0]);
  return {v:1,id:'mine-'+Date.now().toString(36),name,theme:'meadow',hint:'',stuck:'',top:TOP,start:[2,0],flower:[74,0],apples:[[30,0.75]],rings:[{pts:[[-6,TOP],[-6,0],...g,[86,0],[86,TOP]]}]}; }
function edMineLevel(d){ return levelFromDoc(d,{pack:'mine',medal:null}); }
// körs en gång vid start: lägg in sparade ändringar och egna banor i LEVELS
// en lokal ändring som redan är inbakad i spelet (EDITS) tas bort, så att banan inte längre märks ÄNDRAD
const edKey=d=>JSON.stringify([d.name,d.theme,d.start,d.flower,d.apples,d.rings.map(r=>[r.style||null,r.pts])]);
function edBoot(){ const edits=edGet('fjadra.edits',{}); let cleaned=false;
  LEVELS.forEach((l,i)=>{ const d=edits[l.id]; if(!d) return; if(edKey(d)===edKey(edDocOf(l))){ delete edits[l.id]; cleaned=true; return; }
    try{ ORIG[l.id]=l; LEVELS[i]=levelFromDoc(d,{pack:l.pack,medal:l.medal,edited:true}); }catch(e){ LEVELS[i]=l; } });
  if(cleaned) edPut('fjadra.edits',edits);
  for(const d of edGet('fjadra.mine',[])){ try{ LEVELS.push(edMineLevel(d)); }catch(e){} } }

// ---------- vem får ändra huvudbanorna ----------
// Bara ägaren (claude.ai-länken: user.isOwner()/canEdit()) ser pennan på huvudbanorna. Alla kan skapa och ändra egna banor.
// Utanför länken finns ingen inloggning; där kan ägaren slå på det med #admin i adressen (det ändrar ändå bara den enheten).
let EDIT_MAIN=/[#&?]admin\b/.test(location.hash+location.search);
const edCanEdit=l=>l.pack==='mine'||EDIT_MAIN;
(async()=>{ try{ const u=(window.claude&&window.claude.use)?await window.claude.use('user'):null; if(u&&((u.isOwner&&await u.isOwner())||(u.canEdit&&await u.canEdit()))){ EDIT_MAIN=true; if(state==='menu') buildMenu(); } }catch(e){} })();

// ---------- delning via länken ----------
// I claude.ai-länken har spelet en databas (artifact-capability db, bara ägaren skriver). När en inbyggd bana sparas
// skrivs den till levels/<banID>, och alla som öppnar länken får den vid start. Claude läser samma databas och bakar in
// banorna i spelet (EDITS i levels.js). Utanför länken (GitHub Pages, sparad fil) finns ingen databas: då gäller ändringen
// bara på den här enheten, och "Ladda ner alla ändringar" ger en fil att skicka till Claude.
const EDB_COL='levels';
const edDb=(async()=>{ try{ return (window.claude&&window.claude.use)?await window.claude.use('db'):null; }catch(e){ return null; } })();
edDb.then(db=>db&&edPull(db));
async function edPull(db){ let snap; try{ snap=await db.collection(EDB_COL).get(); }catch(e){ return; }
  const local=edGet('fjadra.edits',{}); let n=0;
  for(const sd of snap.docs){ const b=sd.data(), d=b&&b.doc, i=LEVELS.findIndex(l=>l.id===sd.id&&l.pack!=='mine'); if(!d||i<0||local[sd.id]) continue;
    const base=ORIG[sd.id]||LEVELS[i]; if(edKey(d)===edKey(edDocOf(base))) continue;
    try{ ORIG[sd.id]=base; LEVELS[i]=levelFromDoc(d,{pack:base.pack,medal:base.medal}); n++; }catch(e){} }
  if(n&&state==='menu') buildMenu(); }
// resolves true (sparad för alla), null (ingen databas här) eller en felkod
async function edShare(c){ const db=await edDb; if(!db) return null;
  try{ await db.collection(EDB_COL).doc(c.id).set({doc:c,at:Date.now()}); return true; }catch(e){ return (e&&e.code)||'fel'; } }
async function edDownloadAll(){ const edits=edGet('fjadra.edits',{}), list=Object.values(edits);
  if(!list.length) return toast('You have no edited levels yet',2200);
  const data=JSON.stringify({v:1,edits:list}), name='fjadra-andringar.json';
  let dl=null; try{ dl=(window.claude&&window.claude.use)?await window.claude.use('downloads'):null; }catch(e){}
  try{ if(dl) await dl.save({filename:name,data}); else { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([data],{type:'application/json'})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000); }
    toast(list.length+' edited levels – send the file to Claude to build them into the game',4200); }catch(e){ if(!(e&&e.code==='declined')) toast('Could not save the file',2400); } }

// ---------- öppna / stänga ----------
function edOpen(i){ let doc, src; if(i!=null&&i>=0&&!edCanEdit(LEVELS[i])) return toast('Only the game owner can edit the main levels. Build your own under My levels!',3200);
  if(i==null||i<0){ const n=LEVELS.filter(l=>l.pack==='mine').length+1; doc=edNewDoc('My level '+n); src='mine'; }
  else { const l=LEVELS[i]; doc=edDocOf(l); src=l.pack==='mine'?'mine':'edit'; }
  edStart(doc,src,i==null||i<0); if(i==null||i<0){ ed.tool='draw'; edUI(); toast(ED_TIPS.draw,5000); } }
function edStart(doc,src,isNew){ audioInit(); for(const k in inp) inp[k]=0;
  ed={doc,src,isNew:!!isNew,tool:'move',soft:2,mat:'wood',gdir:'up',dmode:'ground',undo:[],redo:[],dirty:!!isNew,drag:null,ptrs:new Map(),pinch:null,anT:0};
  edTesting=false; pausedState=null; hideOv(); $('edMore').classList.remove('show'); state='edit'; parts=[]; rag=null; pops=[]; bloom=0;
  document.body.classList.add('editing'); document.body.classList.remove('testing'); edSync(true); edHome(); edUI(); toast(ED_TIPS.move,3600); }
function edIdle(l){ lvl=l; setTheme(l.theme); if(!l.vis) analyze(l); bike=newBike(l.start[0],l.start[1]); got=l.apples.map(()=>false); cam.x=bike.b.x+5; cam.y=bike.b.y+1.2; parts=[]; rag=null; }
function edClose(){ if(ed.dirty&&!confirm('You have unsaved changes. Close the editor anyway?')) return;
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
// block som dras ut: plankor/stål längs dragningen (kan luta), stock = diameter, sten/låda/mark = ruta mellan punkterna (minsta höjd som standardblocket)
function edBlockSpan(a,b,mat){ const R=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>[r3(p[0]),r3(p[1])]);
  if(mat==='wood'||mat==='steel'){ let [p,q]=a[0]<=b[0]?[a,b]:[b,a]; const th=mat==='steel'?0.3:0.34, dx=q[0]-p[0], dy=q[1]-p[1], L=Math.hypot(dx,dy)||1, nx=-dy/L*th, ny=dx/L*th;
    return {style:mat,pts:[[p[0],p[1]],[q[0],q[1]],[q[0]-nx,q[1]-ny],[p[0]-nx,p[1]-ny]].map(v=>[r3(v[0]),r3(v[1])])}; }
  if(mat==='log'){ const cx=(a[0]+b[0])/2, cy=(a[1]+b[1])/2, rr=Math.max(0.2,Math.hypot(b[0]-a[0],b[1]-a[1])/2), p=[]; for(let i=0;i<12;i++){ const t=i/12*Math.PI*2; p.push([r3(cx+Math.cos(t)*rr),r3(cy+Math.sin(t)*rr)]); } return {style:'log',pts:p}; }
  const h0=mat==='stone'?1.0:mat==='crate'?0.9:1.2; let x0=Math.min(a[0],b[0]), x1=Math.max(a[0],b[0]), y1=Math.max(a[1],b[1]), y0=Math.min(a[1],b[1]);
  if(x1-x0<0.6){ const c=(x0+x1)/2; x0=c-0.3; x1=c+0.3; } if(y1-y0<h0) y0=y1-h0;
  const rg={pts:R(x0,y0,x1,y1)}; if(mat) rg.style=mat; return rg; }
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
    if(o){ toast(o.kind==='start'?'The start cannot be deleted – drag it instead':'The flower cannot be deleted – drag it instead'); return; }
    const p=edHitPt(x,y);
    if(p){ const rg=d.rings[p.ri]; if(rg.pts.length<=3){ if(p.ri===0) return toast('The ground needs at least three points'); edPush(); d.rings.splice(p.ri,1); } else { edPush(); rg.pts.splice(p.i,1); } edSync(true); return; }
    const ri=edHitRing(x,y); if(ri>0){ edPush(); d.rings.splice(ri,1); edSync(true); return; } return pan(); }
  if(t==='star'||t==='gstar'){ const o=edHitObj(x,y);
    if(o&&o.kind==='apple'){ if(t==='star') return dragObj(o,edSnap()); const a=d.apples[o.i]; edPush(); const k=a[2]?ED_DIRS.indexOf(a[2])+1:0;
      if(k>=ED_DIRS.length) a.length=2; else a[2]=ED_DIRS[k]; edSync(); toast(a[2]?'Blue star: gravity '+({up:'up',down:'down',left:'left',right:'right'})[a[2]]:'Normal star',1300); return; }
    edPush(); d.apples.push(t==='gstar'?[r3(x),r3(y),ed.gdir]:[r3(x),r3(y)]); edSync(); return dragObj({kind:'apple',i:d.apples.length-1},null); }
  if(t==='draw'){ ed.drag={type:'stroke',pts:[[x,y]],sx,sy}; return; }
  if(t==='block'){ const ri=edHitRing(x,y); if(ri>0) return dragRing(ri,edSnap());
    edPush(); d.rings.push(edBlock(x,y,ed.mat)); edSync(true); ed.drag={type:'blockdraw',ri:d.rings.length-1,a:[x,y],sx,sy}; return; } }
function edMove(sx,sy){ const pe=ed.pend; if(pe){ if(Math.hypot(sx-pe.sx,sy-pe.sy)<6) return; ed.pend=null; edAct(pe.sx,pe.sy); }
  const dr=ed.drag; if(!dr) return;
  if(dr.type==='pan'){ cam.x=dr.cx-(sx-dr.sx)/SC; cam.y=dr.cy+(sy-dr.sy)/SC; return; }
  if(dr.type==='blockdraw'){ const b=edW(sx,sy), L=Math.hypot(b[0]-dr.a[0],b[1]-dr.a[1]); if(L<0.4) return; ed.doc.rings[dr.ri]=edBlockSpan(dr.a,b,ed.mat); edSync(false);
    $('edRead').textContent=(ed.mat==='wood'||ed.mat==='steel'||ed.mat==='log'?L:Math.abs(b[0]-dr.a[0])).toFixed(1)+' m'; return; }
  if(dr.type==='stroke'){ const [x,y]=edW(sx,sy), q=dr.pts[dr.pts.length-1]; if(Math.hypot(x-q[0],y-q[1])>0.12) dr.pts.push([x,y]); return; }
  if(!dr.moved){ if(Math.hypot(sx-dr.sx,sy-dr.sy)<5) return; dr.moved=true; if(dr.snap) edPush(dr.snap); }
  const [x,y]=edW(sx,sy), dx=x-dr.x0, dy=y-dr.y0, d=ed.doc; let rx, ry;
  if(dr.type==='pts'){ const p=d.rings[dr.ri].pts; for(const [k,w,px,py] of dr.list){ p[k][0]=r3(px+dx*w); p[k][1]=r3(py+dy*w); } rx=p[dr.list[0][0]][0]; ry=p[dr.list[0][0]][1]; }
  else if(dr.type==='obj'){ const a=dr.o.kind==='apple'?d.apples[dr.o.i]:dr.o.kind==='flower'?d.flower:d.start; a[0]=r3(dr.ax+dx); a[1]=r3(dr.ay+dy); rx=a[0]; ry=a[1]; }
  else if(dr.type==='ring'){ const p=d.rings[dr.ri].pts; dr.orig.forEach((q,k)=>{ p[k][0]=r3(q[0]+dx); p[k][1]=r3(q[1]+dy); }); rx=dx; ry=dy; }
  edSync(false); if(performance.now()-ed.anT>150&&edCount()<1500){ analyze(lvl); ed.anT=performance.now(); }
  $('edRead').textContent=dr.type==='ring'?'move '+rx.toFixed(1)+' · '+ry.toFixed(1):'x '+rx.toFixed(1)+' · y '+ry.toFixed(1); }
function edUp(){ const pe=ed.pend; ed.pend=null; if(pe) edAct(pe.sx,pe.sy); const dr=ed.drag; ed.drag=null; $('edRead').textContent=''; if(dr&&dr.type==='stroke') return edStroke(dr.pts); if(dr&&dr.type==='blockdraw') return edSync(true); if(dr&&dr.type!=='pan'&&(dr.moved||!dr.snap)) edSync(true); }
cv.addEventListener('pointerdown',e=>{ if(state!=='edit') return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){}
  ed.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ed.ptrs.size===2){ ed.pend=null; if(ed.drag&&ed.drag.type==='stroke') ed.drag=null; edUp(); const [a,b]=[...ed.ptrs.values()], mx=(a.x+b.x)/2, my=(a.y+b.y)/2; ed.pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,sc:SC,w:edW(mx,my)}; return; }
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
  const sd=ed.drag; if(sd&&sd.type==='stroke'&&sd.pts.length>1){ ctx.beginPath(); sd.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.lineCap='round';
    ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=9/SC; ctx.stroke(); ctx.strokeStyle=ED_DRAW.find(m=>m[0]===ed.dmode)[2]; ctx.lineWidth=5/SC; ctx.stroke(); }
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

// ---------- rita (Draw) ----------
// Ett ritat streck jämnas ut och görs om till bana: Ground = hela marken (start och blomma flyttas till ändarna),
// Rock = en klipp-remsa under strecket (eller hela formen om den är sluten), Plank/Steel = en tunn balk längs strecket.
function edResample(pts,step){ const out=[pts[0].slice()]; let acc=0;
  for(let i=1;i<pts.length;i++){ let a=pts[i-1], b=pts[i], L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    while(acc+L>=step){ const t=(step-acc)/L; const q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; out.push(q); a=q; L=Math.hypot(b[0]-a[0],b[1]-a[1]); acc=0; } acc+=L; }
  const last=pts[pts.length-1]; if(Math.hypot(last[0]-out[out.length-1][0],last[1]-out[out.length-1][1])>step*0.3) out.push(last.slice()); return out; }
function edSmooth(p,n){ for(let k=0;k<n;k++) p=p.map((q,i)=>i===0||i===p.length-1?q:[(p[i-1][0]+2*q[0]+p[i+1][0])/4,(p[i-1][1]+2*q[1]+p[i+1][1])/4]); return p; }
function edStrip(p,th){ const top=[], bot=[]; for(let i=0;i<p.length;i++){ const a=p[Math.max(0,i-1)], b=p[Math.min(p.length-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1;
    let nx=dy/L, ny=-dx/L; if(ny>0){ nx=-nx; ny=-ny; } top.push([r3(p[i][0]),r3(p[i][1])]); bot.push([r3(p[i][0]+nx*th),r3(p[i][1]+ny*th)]); } return [...top,...bot.reverse()]; }
function edStroke(raw){ if(raw.length<2) return; let len=0; for(let i=1;i<raw.length;i++) len+=Math.hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]);
  if(len<1.5) return toast('Draw a longer line',1400);
  let p=edSmooth(edResample(raw,0.5),2); const d=ed.doc, a=p[0], z=p[p.length-1], closed=len>4&&Math.hypot(z[0]-a[0],z[1]-a[1])<Math.max(1.2,len*0.08);
  edPush();
  if(ed.dmode==='ground'&&!closed){ if(z[0]<a[0]) p=p.reverse(); const S=p.map(q=>[r3(q[0]),r3(q[1])]), f=S[0], l=S[S.length-1];
    const gyAt=x=>{ for(let k=1;k<S.length;k++){ const u=S[k-1], w=S[k]; if((x-u[0])*(x-w[0])>0||u[0]===w[0]) continue; return u[1]+(w[1]-u[1])*(x-u[0])/(w[0]-u[0]); } return null; };
    const r0=d.rings[0].pts, top0=d.top||TOP, std=r0.length>=4&&r0[0][1]>=top0-1&&r0[r0.length-1][1]>=top0-1;
    let out, pre=false, ext=false, msg;
    if(!ed.groundDone&&ed.isNew||!std){   // första strecket på en ny bana (eller en bana utan vanlig mark) = hela marken
      out=[[r3(f[0]-4),f[1]],...S,[r3(l[0]+4),l[1]]]; pre=ext=true; msg='Track drawn! Keep drawing to add more, then add stars and tap Test.'; }
    else {   // annars läggs strecket till: förlänger åt höger/vänster eller byter bara ut biten det ritas över
      const G=r0.slice(1,-1).map(q=>q.slice()), g0=G[0][0], g1=G[G.length-1][0];
      // skarvarna: strecket glider mjukt (2,5 m) ner/upp till den befintliga marken så att det inte blir ett trappsteg
      const gAt=x=>{ for(let k=1;k<G.length;k++){ const u=G[k-1], w=G[k]; if((x-u[0])*(x-w[0])>0||u[0]===w[0]) continue; return u[1]+(w[1]-u[1])*(x-u[0])/(w[0]-u[0]); } return null; };
      const blend=(idx,dir,gy)=>{ if(gy==null) return; const dy=gy-S[idx][1], o=S.map(q=>q.slice()); let dist=0; for(let k=idx;k>=0&&k<S.length;k+=dir){ if(k!==idx) dist+=Math.hypot(o[k][0]-o[k-dir][0],o[k][1]-o[k-dir][1]); if(dist>2.5) break; S[k][1]=r3(o[k][1]+dy*(1-dist/2.5)); } };
      blend(0,1,f[0]>=g1-0.5?G[G.length-1][1]:gAt(f[0])); blend(S.length-1,-1,l[0]<=g0+0.5?G[0][1]:gAt(l[0]));
      if(f[0]>=g1-0.5){ out=[...G,...S,[r3(l[0]+4),l[1]]]; ext=true; msg='Track extended →'; }
      else if(l[0]<=g0+0.5){ out=[[r3(f[0]-4),f[1]],...S,...G]; pre=true; msg='Track extended ←'; }
      else { let i0=0; while(i0<G.length&&G[i0][0]<f[0]) i0++; let j0=G.length-1; while(j0>=0&&G[j0][0]>l[0]) j0--;
        out=[...G.slice(0,i0),...S,...G.slice(j0+1)]; if(i0===0){ out.unshift([r3(f[0]-4),f[1]]); pre=true; } if(j0===G.length-1){ out.push([r3(l[0]+4),l[1]]); ext=true; } msg='Ground updated'; } }
    let hi=-1e9; for(const q of out) hi=Math.max(hi,q[1]); const top=Math.max(top0,hi+12); d.top=top;
    d.rings[0]={...d.rings[0],pts:[[out[0][0],top],...out,[out[out.length-1][0],top]]}; ed.groundDone=true;
    if(pre) d.start=[r3(out[0][0]+2),r3(out[0][1])]; else { const gy=gyAt(d.start[0]); if(gy!=null) d.start[1]=r3(gy); }
    if(ext){ const e=out[out.length-1]; d.flower=[r3(e[0]-2.5),r3(e[1])]; } else { const gy=gyAt(d.flower[0]); if(gy!=null) d.flower[1]=r3(gy); }
    for(const st of d.apples){ const gy=gyAt(st[0]); if(gy!=null&&st[1]<gy+0.5) st[1]=r3(gy+0.75); }   // stjärnor under den nya marken lyfts upp
    edSync(true); return toast(msg,2200); }
  if(closed) d.rings.push({pts:p.slice(0,-1).map(q=>[r3(q[0]),r3(q[1])])});
  else if(ed.dmode==='solid'||ed.dmode==='ground') d.rings.push({pts:edStrip(p,0.9)});
  else d.rings.push({style:ed.dmode,pts:edStrip(p,ed.dmode==='steel'?0.28:0.3)});
  edSync(true); }

// ---------- verktyg ----------
function edSplitRing(rg,maxLen,top,only){ const p=rg.pts, out=[];
  for(let i=0;i<p.length;i++){ const a=p[i], b=p[(i+1)%p.length]; out.push(a); if(a[1]>=top-0.01&&b[1]>=top-0.01) continue; if(only&&!only(a,b)) continue;
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/maxLen); for(let k=1;k<n;k++) out.push([r3(a[0]+(b[0]-a[0])*k/n),r3(a[1]+(b[1]-a[1])*k/n)]); }
  rg.pts=out; }
function edSplit(){ edPush(); for(const rg of ed.doc.rings) if(!rg.style) edSplitRing(rg,1,ed.doc.top); edSync(true); toast('Long lines split into 1 m pieces – now they can be shaped',2200); }
function edExtend(){ edPush(); const rg=ed.doc.rings[0], p=rg.pts; let mx=-1e9; for(const q of p) mx=Math.max(mx,q[0]);
  for(const q of p) if(q[0]>mx-0.01) q[0]=r3(q[0]+20); edSplitRing(rg,1,ed.doc.top,(a,b)=>Math.max(a[0],b[0])>mx+0.5&&Math.min(a[0],b[0])<mx+19.5);
  edSync(true); cam.x=mx+10; toast('The level is 20 m longer to the right',1800); }
function edTool(t){ ed.tool=t; edUI(); toast(ED_TIPS[t],t==='block'?4200:2600); }
function edOpt(){ const t=ed.tool;
  if(t==='move'||t==='add'){ ed.soft=ED_SOFT[(ED_SOFT.indexOf(ed.soft)+1)%ED_SOFT.length]; toast(ed.soft?'Soft: points within '+ed.soft+' m follow along':'Sharp: only the point you drag moves',1800); }
  else if(t==='gstar'){ ed.gdir=ED_DIRS[(ED_DIRS.indexOf(ed.gdir)+1)%4]; }
  else if(t==='block'){ const k=ED_MATS.findIndex(m=>m[0]===ed.mat); ed.mat=ED_MATS[(k+1)%ED_MATS.length][0]; }
  else if(t==='draw'){ const k=ED_DRAW.findIndex(m=>m[0]===ed.dmode); ed.dmode=ED_DRAW[(k+1)%ED_DRAW.length][0]; toast(ed.dmode==='ground'?'Ground: each stroke adds to the track':'Draw a '+ED_DRAW.find(m=>m[0]===ed.dmode)[1].toLowerCase()+' – close the shape to make a rock',1800); }
  edUI(); }
function edUI(){ if(!ed) return; const t=ed.tool;
  document.querySelectorAll('#ed [data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
  const o=$('edOpt'); let txt='';
  if(t==='move'||t==='add') txt=ed.soft?'Soft '+ed.soft+' m':'Sharp'; else if(t==='gstar') txt='Gravity '+GARROW[ed.gdir]; else if(t==='block') txt=ED_MATS.find(m=>m[0]===ed.mat)[1]; else if(t==='draw') txt='Draw: '+ED_DRAW.find(m=>m[0]===ed.dmode)[1];
  o.textContent=txt; o.style.display=txt?'':'none';
  $('edUndo').disabled=!ed.undo.length; $('edRedo').disabled=!ed.redo.length; $('edSave').classList.toggle('dirty',ed.dirty); $('edName').textContent=ed.doc.name||'Untitled'; }

// ---------- spara / testa ----------
function edClean(d){ return {v:1,id:d.id,name:(d.name||'Untitled').slice(0,40),theme:d.theme,hint:d.hint||'',stuck:d.stuck||'',top:d.top,start:d.start,flower:d.flower,apples:d.apples,...(d.tips?{tips:d.tips}:{}),rings:d.rings.map(r=>r.style?{style:r.style,pts:r.pts}:{pts:r.pts})}; }
function edSave(){ const c=JSON.parse(JSON.stringify(edClean(ed.doc))), id=c.id, i=LEVELS.findIndex(l=>l.id===id);
  if(ed.src==='mine'){ const list=edGet('fjadra.mine',[]), k=list.findIndex(x=>x.id===id); if(k<0) list.push(c); else list[k]=c;
    if(!edPut('fjadra.mine',list)) return toast('Could not save – storage is full',2600);
    const L=edMineLevel(c); if(i<0) LEVELS.push(L); else LEVELS[i]=L; }
  else { const m=edGet('fjadra.edits',{}); m[id]=c; if(!edPut('fjadra.edits',m)) return toast('Could not save – storage is full',2600);
    if(!ORIG[id]) ORIG[id]=LEVELS[i]; LEVELS[i]=levelFromDoc(c,{pack:LEVELS[i].pack,medal:LEVELS[i].medal,edited:true}); try{ localStorage.removeItem('fjadra.g4.'+id); }catch(e){} }
  ed.dirty=false; ed.isNew=false; edUI();
  if(ed.src==='mine') return toast('Saved under My levels',2200);
  toast('Saving …',1500); edShare(c).then(r=>toast(r===true?'Saved for everyone playing via the link ✓':r===null?'Saved on this device. Open the game via the claude.ai link to save for everyone.':r==='quota_exceeded'?'Saved here, but the database is full':'Saved on this device (only the owner can save for everyone)',3600)); }
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
  $('edReset').style.display=ed.src==='edit'&&ORIG[d.id]?'':'none'; $('edDelete').style.display=ed.src==='mine'&&!ed.isNew?'':'none'; $('edShareB').style.display=ed.src==='mine'&&onl()?'':'none';
  $('edInfo').textContent=(ed.src==='mine'?'Own level':'Built-in level')+' · '+edCount()+' points · '+d.apples.length+' stars';
  $('edMore').classList.add('show'); }
function edMoreDone(){ const d=ed.doc, n=$('edNameIn').value.trim()||d.name, h=$('edHintIn').value.trim();
  if(n!==d.name||h!==(d.hint||'')){ edPush(); d.name=n.slice(0,40); d.hint=h.slice(0,200); edSync(false); }
  $('edMore').classList.remove('show'); edUI(); }
async function edCopy(){ const s=JSON.stringify(edClean(ed.doc)), ta=$('edCode'); ta.value=s; ta.style.display='block'; $('edCodeGo').style.display='none'; ta.focus(); ta.select();
  let ok=false; try{ await navigator.clipboard.writeText(s); ok=true; }catch(e){ try{ ok=document.execCommand('copy'); }catch(_){} }
  toast(ok?'The level code is copied. Send it to Claude to build the level into the game.':'Select the text in the box and copy it',4200); }
function edPasteOpen(){ const ta=$('edCode'); ta.value=''; ta.style.display='block'; $('edCodeGo').style.display=''; ta.focus(); toast('Paste a level code in the box and tap Load',2600); }
function edPasteGo(){ let d; try{ d=JSON.parse($('edCode').value.trim()); }catch(e){ return toast('The code could not be read – was all of it copied?',2600); }
  const okPt=p=>Array.isArray(p)&&p.length>=2&&isFinite(p[0])&&isFinite(p[1]);
  if(!d||!Array.isArray(d.rings)||!d.rings.length||!d.rings.every(r=>r&&Array.isArray(r.pts)&&r.pts.length>=3&&r.pts.every(okPt))||!okPt(d.start)||!okPt(d.flower)||!Array.isArray(d.apples)||!d.apples.every(okPt))
    return toast('That does not look like a level code',2400);
  if(ed.dirty&&!confirm('Replace the level you are working on? Unsaved changes will be lost.')) return;
  const built=EDIT_MAIN&&LEVELS.find(l=>l.id===d.id&&l.pack!=='mine');   // andra än ägaren: en inklistrad huvudbana blir en egen bana
  const doc={v:1,id:built?d.id:(String(d.id||'').startsWith('mine-')?d.id:'mine-'+Date.now().toString(36)),name:String(d.name||'Loaded level').slice(0,40),theme:ED_THEMES.some(t=>t[0]===d.theme)?d.theme:'meadow',
    hint:String(d.hint||''),stuck:String(d.stuck||''),top:isFinite(d.top)?+d.top:TOP,start:d.start.slice(0,2),flower:d.flower.slice(0,2),
    apples:d.apples.map(a=>ED_DIRS.includes(a[2])?[+a[0],+a[1],a[2]]:[+a[0],+a[1]]),rings:d.rings.map(r=>{ const pts=r.pts.map(p=>[+p[0],+p[1]]); return ED_MATS.some(m=>m[0]&&m[0]===r.style)?{style:r.style,pts}:{pts}; })};
  $('edMore').classList.remove('show'); edStart(doc,built?'edit':'mine',true); toast('The level is loaded – tap Save to keep it',2600); }
function edReset(){ const id=ed.doc.id; if(!ORIG[id]||!confirm('Restore the original level? Your changes to it will be removed.')) return;
  const m=edGet('fjadra.edits',{}); delete m[id]; edPut('fjadra.edits',m); const i=LEVELS.findIndex(l=>l.id===id); LEVELS[i]=ORIG[id]; delete ORIG[id];
  edDb.then(db=>db&&db.collection(EDB_COL).doc(id).delete()).catch(()=>{});
  $('edMore').classList.remove('show'); edStart(edDocOf(LEVELS[i]),'edit',false); toast('The original level is back',1800); }
function edDelete(){ const id=ed.doc.id; if(!confirm('Delete the level "'+ed.doc.name+'" forever?')) return;
  edPut('fjadra.mine',edGet('fjadra.mine',[]).filter(x=>x.id!==id)); const i=LEVELS.findIndex(l=>l.id===id); if(i>=0) LEVELS.splice(i,1);
  delete best[id]; saveBest(); try{ localStorage.removeItem('fjadra.g4.'+id); }catch(e){}
  $('edMore').classList.remove('show'); ed.dirty=false; edClose(); }

$('edClose').onclick=()=>edClose(); $('edUndo').onclick=()=>edUndo(); $('edRedo').onclick=()=>edRedo(); $('edFitB').onclick=()=>edFit();
$('edTest').onclick=()=>edTest(); $('edSave').onclick=()=>edSave(); $('edMoreB').onclick=()=>edMore(); $('edName').onclick=()=>edMore();
$('edZin').onclick=()=>edZoom(1.4); $('edZout').onclick=()=>edZoom(1/1.4); $('edOpt').onclick=()=>edOpt();
document.querySelectorAll('#ed [data-tool]').forEach(b=>b.onclick=()=>edTool(b.dataset.tool));
$('edMoreOk').onclick=edMoreDone; $('edSplitB').onclick=()=>{ edMoreDone(); edSplit(); }; $('edExtendB').onclick=()=>{ edMoreDone(); edExtend(); };
$('edCopyB').onclick=edCopy; $('edDlAll').onclick=edDownloadAll; $('edPasteB').onclick=edPasteOpen; $('edCodeGo').onclick=edPasteGo; $('edReset').onclick=edReset; $('edDelete').onclick=edDelete;
$('bEdBack').onclick=()=>edBack(); $('bToEd').onclick=()=>edBack();
