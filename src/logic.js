// ================= GAME =================
const LEVELS=makeLevels();
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const $=id=>document.getElementById(id);
let W=0,Hh=0,DPR=1,SC=40,SC0=40,zoom=0.86;
let li=0, lvl=null, bike=null, got=[], state='menu', T=0, acc=0, endTimer=0, flagWarn=0, parts=[], rag=null, pops=[], shake=0, bloom=0, rec=[], recT=0, ghost=null, BASE_A=1;
const NEWLV=new Set(['fjadra-tutorial','fjadra-pack2-01','fjadra-pack2-08','fjadra-pack2-11','fjadra-p3-01','fjadra-p3-02','fjadra-p3-03','fjadra-p3-04','fjadra-p3-05','fjadra-p3-06','fjadra-p3-07','fjadra-p3-08','fjadra-p3-09','fjadra-p3-10','fjadra-p3-11','fjadra-p3-12','fjadra-p3-13','fjadra-p3-14','fjadra-p3-15','fjadra-p3-16','fjadra-p3-17','fjadra-p3-18','fjadra-p3-19','fjadra-p3-20','fjadra-p3-21','fjadra-p3-22','fjadra-p3-23','fjadra-p3-24','fjadra-p3-25','fjadra-p3-26','fjadra-p3-27','fjadra-p3-28','fjadra-p3-29','fjadra-p3-30','fjadra-p3-31','fjadra-p3-32']); let curPack=3;
let STYLE='cartoon'; try{ STYLE=localStorage.getItem('fjadra.style')==='neon'?'neon':'cartoon'; }catch(e){}
let stuckT=0, stuckCD=0, tipsSeen=new Set();
// ghosts are stored per stable level id; old name-keyed ghosts are moved over the first time
function loadGhost(lv){ ghost=null; try{ let s=localStorage.getItem('fjadra.g4.'+lv.id); if(!s){ s=localStorage.getItem('fjadra.ghost.'+lv.name); if(s) localStorage.setItem('fjadra.g4.'+lv.id,s); } ghost=s?JSON.parse(s):null; }catch(e){ ghost=null; } }
function saveGhost(lv){ try{ localStorage.setItem('fjadra.g4.'+lv.id,JSON.stringify(rec)); }catch(e){} }
const GB={b:{x:0,y:0,a:0,vx:0,vy:0,w:0},wh:[{x:0,y:0,a:0,w:0},{x:0,y:0,a:0,w:0}],r:{x:0,y:0},dir:1,flipT:-1,flipFrom:1,rider:true,gx:0,gy:-10,contact:[1,1]};
function ghostAt(t){ if(!ghost||!ghost.length) return null; const i=t*30, i0=Math.min(ghost.length-1,Math.floor(i)), i1=Math.min(ghost.length-1,i0+1), u=Math.min(1,i-i0); const a=ghost[i0], c=ghost[i1], L=(k)=>a[k]+(c[k]-a[k])*u;
  GB.b.x=L(0); GB.b.y=L(1); GB.b.a=L(2); GB.wh[0].x=L(3); GB.wh[0].y=L(4); GB.wh[0].a=L(5); GB.wh[1].x=L(6); GB.wh[1].y=L(7); GB.wh[1].a=L(8); GB.r.x=L(9); GB.r.y=L(10); GB.dir=a[11]; GB.flipT=a[12]; GB.flipFrom=a[13]; return GB; }
const inp={gas:0,brake:0,left:0,right:0};
const cam={x:0,y:0};
const GV={up:[0,P.G],down:[0,-P.G],left:[-P.G,0],right:[P.G,0]};
const GARROW={up:'↑',down:'↓',left:'←',right:'→'};
let curTheme='';
function resize(){ DPR=Math.min(2.5,window.devicePixelRatio||1); W=cv.clientWidth; Hh=cv.clientHeight;
  cv.width=Math.round(W*DPR); cv.height=Math.round(Hh*DPR);
  SC0=Math.max(Math.min(W/18,Hh/9.5),Math.min(W,Hh)/11); if(state!=='edit') SC=SC0*zoom; curTheme=''; if(lvl) setTheme(lvl.theme); }
function setTheme(name){ if(curTheme===name+STYLE+SC0+DPR) return; curTheme=name+STYLE+SC0+DPR; applyStyleColors(); TH=getTheme(name); const keepSC=SC; SC=SC0; buildSprites(); SC=keepSC; buildPattern(); BG.key=''; buildBackground(name); for(const l of LEVELS) if(l.theme===name||!l.vis) { const keep=TH; TH=getTheme(l.theme); analyze(l); TH=keep; } }
addEventListener('resize',resize);

// records are stored per stable level id (fjadra4.best); old name-keyed records (fjadra3.best) are migrated once and kept as history
let best={}; try{ const s=localStorage.getItem('fjadra4.best'); if(s) best=JSON.parse(s)||{}; else { const old=JSON.parse(localStorage.getItem('fjadra3.best')||'{}')||{}; const alias={'Spikfältet':'p1-hinderbanan'};
  for(const l of LEVELS) if(old[l.name]!=null) best[l.id]=old[l.name]; for(const n in alias) if(old[n]!=null&&best[alias[n]]==null) best[alias[n]]=old[n]; localStorage.setItem('fjadra4.best',JSON.stringify(best)); } }catch(e){ best={}; }
function saveBest(){ try{ localStorage.setItem('fjadra4.best',JSON.stringify(best)); }catch(e){} }
let muted=false; try{ muted=localStorage.getItem('fjadra.mute')==='1'; }catch(e){}
function fmt(t){ const m=Math.floor(t/60), s=t-m*60; return (m<10?'0':'')+m+':'+(s<10?'0':'')+s.toFixed(2); }
function medalOf(i,t){ const m=LEVELS[i]&&LEVELS[i].medal; if(t==null||!m) return 0; return t<=m[0]?3:t<=m[1]?2:1; }
const MEDAL_COL=[null,['#c27a3d','#8a4f22'],['#c9ced6','#7d8590'],['#f6c533','#b8860b']];
function medalSVG(k){ if(!k) return '<svg viewBox="-13 -13 26 26" aria-hidden="true"><circle r="10" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="2.5" stroke-dasharray="3 3"/></svg>';
  const [c,d]=MEDAL_COL[k]; return '<svg viewBox="-13 -13 26 26" aria-hidden="true"><circle r="11" fill="'+c+'" stroke="#1d2633" stroke-width="2"/><circle r="7.5" fill="none" stroke="'+d+'" stroke-width="1.5"/><path d="M0-5.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8L0 3.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill="#fff" stroke="'+d+'" stroke-width=".8"/></svg>'; }

// i = index i LEVELS; L = en bana utanför listan (testkörning från editorn, i = -1)
function loadLevel(i,L){ li=i; lvl=L||LEVELS[i]; setTheme(lvl.theme); if(!lvl.vis) analyze(lvl); bike=newBike(lvl.start[0],lvl.start[1]); got=lvl.apples.map(()=>false);
  T=0; acc=0; stuckT=0; stuckCD=0; tipsSeen=new Set(); parts=[]; rag=null; pops=[]; shake=0; bloom=0; rec=[]; recT=0; if(i>=0) loadGhost(lvl); else ghost=null; lvl.steelSegs=lvl.segs.filter(s=>s.style==='steel'); cam.x=bike.b.x+2; cam.y=bike.b.y+0.8; camBaseY=cam.y; state='play';
  const nr=LEVELS.filter(x=>x.pack===lvl.pack).indexOf(lvl)+1; $('lvlname').textContent=(i<0?'Test: ':nr+'. ')+lvl.name; updApples(); updGrav(); hideOv(); if(lvl.hint) toast(lvl.hint,3400); }
function updApples(){ $('applesTxt').textContent=got.filter(Boolean).length+'/'+got.length; }
function updGrav(){ const g=bike?(bike.gy<0&&bike.gx===0?null:(bike.gy>0?'up':bike.gx<0?'left':'right')):null; $('gravTile').style.display=g?'flex':'none'; if(g) $('gravArrow').textContent=GARROW[g]; }
function hideOv(){ $('menu').classList.remove('show'); $('endov').classList.remove('show'); }
let toastT=0; function toast(msg,ms){ const el=$('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),ms||1800); }

// ---------- audio ----------
let AC=null, eng=null;
function audioInit(){ if(AC) return; try{ AC=new (window.AudioContext||window.webkitAudioContext)();
  const o=AC.createOscillator(), o2=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain();
  o.type='sawtooth'; o2.type='square'; f.type='lowpass'; f.frequency.value=480; g.gain.value=0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(AC.destination); o.start(); o2.start(); eng={o,o2,g}; musicInit(); }catch(e){ AC=null; } }

// ---------- calm generative music: soft pads + sparse pentatonic plucks ----------
let MUS=null, musicOn=true; try{ musicOn=localStorage.getItem('fjadra.music')!=='0'; }catch(e){}
function musicInit(){ if(!AC||MUS) return;
  const out=AC.createGain(); out.gain.value=(musicOn&&!muted)?0.055:0; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1700;
  const dl=AC.createDelay(1.0); dl.delayTime.value=0.38; const fb=AC.createGain(); fb.gain.value=0.32; const wet=AC.createGain(); wet.gain.value=0.3;
  lp.connect(out); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(out); out.connect(AC.destination);
  MUS={out,lp,next:AC.currentTime+0.2,step:0}; setInterval(musicTick,250); }
const CHORDS=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]]; // Cmaj7, Am7, Fmaj7, G6 (MIDI)
const PENTA=[60,62,64,67,69,72,74,76];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function voice(freq,t,dur,type,vol,att,rel){ const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.value=freq; o.detune.value=(Math.random()-0.5)*8;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+att); g.gain.setValueAtTime(vol,t+Math.max(att,dur-rel)); g.gain.linearRampToValueAtTime(0,t+dur);
  o.connect(g); g.connect(MUS.lp); o.start(t); o.stop(t+dur+0.05); }
function musicTick(){ if(!MUS||!AC) return; const on=musicOn&&!muted; MUS.out.gain.setTargetAtTime(on?0.055:0,AC.currentTime,0.4); if(!on){ MUS.next=AC.currentTime+0.3; return; }
  while(MUS.next<AC.currentTime+1.2){ const t=MUS.next, beat=MUS.step%8;
    if(beat===0){ const ch=CHORDS[Math.floor(MUS.step/8)%CHORDS.length]; for(const n of ch) voice(mtof(n),t,4.4,'triangle',0.14,1.4,1.8); voice(mtof(ch[0]-12),t,4.4,'sine',0.18,0.8,1.6); }
    if(Math.random()<0.38){ const n=PENTA[Math.floor(Math.random()*PENTA.length)]; voice(mtof(n),t,1.6,'sine',0.09,0.02,1.4); }
    MUS.next+=0.5; MUS.step++; } }
function setMusic(on){ musicOn=on; try{ localStorage.setItem('fjadra.music',on?'1':'0'); }catch(e){} $('bMusic').textContent='Music: '+(on?'on':'off'); audioInit(); }

function beep(freq,dur,type,vol,slide){ if(!AC||muted) return; const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime;
  o.type=type||'triangle'; o.frequency.setValueAtTime(freq,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),t+dur);
  g.gain.setValueAtTime(vol||0.1,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+.02); }
function engineUpdate(){ if(!eng) return; const t=AC.currentTime; const on=state==='play'&&!muted;
  const dw=bike?bike.wh[bike.dir===1?0:1]:null; const rpm=dw?Math.min(1,Math.abs(dw.w)/P.MAXW):0; const th=bike?bike.thr:0; const f=40+rpm*110+th*14;
  eng.o.frequency.setTargetAtTime(f,t,.05); eng.o2.frequency.setTargetAtTime(f*0.5,t,.05); eng.g.gain.setTargetAtTime(on?(.013+th*.022):0,t,.12); }
function sndIcon(){ $('sndWave').style.display=muted?'none':''; }
sndIcon();
$('bSound').onclick=()=>{ muted=!muted; sndIcon(); try{localStorage.setItem('fjadra.mute',muted?'1':'0');}catch(e){} audioInit(); };

// ---------- input ----------
function press(k,on){
  audioInit(); if(AC&&AC.state==='suspended') AC.resume();
  if(state==='overview'){ if(on) leaveOverview(); return; }
  if(k==='turn'){ if(on&&state==='play'){ turn(bike); beep(520,.22,'sine',.04,.45); for(let i=0;i<2;i++){ const w=bike.wh[i]; if(bike.contact[i]>0.5) for(let j=0;j<3;j++) puff(w.x+(Math.random()-0.5)*0.4,w.y-0.32,(Math.random()-0.5)*2.2,0.3+Math.random()*0.6,0.09,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.45); } } return; }
  const was=inp[k]; inp[k]=on?1:0;
  if(on&&!was&&state==='play'&&(k==='left'||k==='right')){
    const both=inp.left&&inp.right; if(volt(bike,k==='left'?1:-1,both)) beep(both?180:150,.07,'sawtooth',.035,1.6);
  }
  if(on&&k==='gas'&&state==='crash'&&endTimer>.35) restart();
}
document.querySelectorAll('[data-k]').forEach(b=>{ const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); try{b.setPointerCapture(e.pointerId);}catch(_){} b.classList.add('on'); press(k,true); });
  const up=()=>{ if(!b.classList.contains('on')) return; b.classList.remove('on'); press(k,false); };
  b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('lostpointercapture',up); b.addEventListener('contextmenu',e=>e.preventDefault()); });
const KEYS={ArrowUp:'gas',KeyW:'gas',ArrowDown:'brake',KeyS:'brake',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
  if(e.target&&e.target.closest&&e.target.closest('input,textarea')) return;
  if(state==='edit'){ if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){ e.preventDefault(); e.shiftKey?edRedo():edUndo(); } return; }
  if(e.code==='Escape'&&edTesting){ e.preventDefault(); edBack(); return; }
  if(KEYS[e.code]){ e.preventDefault(); if(!e.repeat) press(KEYS[e.code],true); return; }
  if(e.code==='Space'){ e.preventDefault(); if(!e.repeat) press('turn',true); return; }
  if(e.code==='Enter'||e.code==='KeyR'){ e.preventDefault(); if(state==='win') next(); else if(lvl&&state!=='menu') restart(); return; }
  if(e.code==='Escape'){ e.preventDefault(); toggleMenu(); } });
addEventListener('keyup',e=>{ if(KEYS[e.code]) press(KEYS[e.code],false); });
addEventListener('blur',()=>{ for(const k in inp) inp[k]=0; document.querySelectorAll('.k.on').forEach(b=>b.classList.remove('on')); });
document.addEventListener('contextmenu',e=>e.preventDefault());

function restart(){ loadLevel(li,li<0?lvl:null); }
function enterOverview(){ if(state!=='play') return; state='overview'; for(const k in inp) inp[k]=0; document.querySelectorAll('.k.on').forEach(b=>b.classList.remove('on')); toast('Overview – press any button to continue',2200); }
function leaveOverview(){ if(state!=='overview') return; state='play'; acc=0; }
// soft edge pointers toward stars and the flower when they are off-screen
function drawPointers(){ const tg=[]; lvl.apples.forEach((a,i)=>{ if(!got[i]) tg.push({x:a[0],y:a[1],k:a[2]?'g':'s'}); }); const ready=got.every(Boolean); tg.push({x:lvl.flower[0],y:lvl.flower[1]+1,k:'f'});
  const top=70, bot=Hh-165, L=18, R=W-18; const off=[];
  for(const t of tg){ const sx=W/2+(t.x-cam.x)*SC, sy=Hh/2-(t.y-cam.y)*SC; if(sx>10&&sx<W-10&&sy>10&&sy<Hh-10) continue; t.d=Math.hypot(t.x-bike.b.x,t.y-bike.b.y); t.sx=sx; t.sy=sy; off.push(t); }
  const stars=off.filter(t=>t.k!=='f').sort((a,b)=>a.d-b.d).slice(0,3), fl=off.filter(t=>t.k==='f');
  ctx.setTransform(DPR,0,0,DPR,0,0);
  for(const t of stars.concat(fl)){ const cx=W/2, cy=Hh/2, dx=t.sx-cx, dy=t.sy-cy; const s=Math.min(Math.abs((dx>0?R-cx:L-cx)/(dx||1e-6)),Math.abs((dy>0?bot-cy:top-cy)/(dy||1e-6))); const px=cx+dx*s, py=cy+dy*s, an=Math.atan2(dy,dx);
    const isF=t.k==='f'; ctx.globalAlpha=isF&&!ready?0.55:0.9;
    ctx.save(); ctx.translate(px,py); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(19,0); ctx.lineTo(11,-6); ctx.lineTo(11,6); ctx.closePath(); ctx.fillStyle=isF?'#ffffff':(t.k==='g'?'#8fd0ff':'#ffd23f'); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(px,py,11,0,6.28); ctx.fillStyle='rgba(20,42,68,.88)'; ctx.fill(); ctx.strokeStyle='rgba(160,195,230,.7)'; ctx.lineWidth=1.5; ctx.stroke();
    if(isF){ for(let i=0;i<6;i++){ const a=i*Math.PI/3; ctx.beginPath(); ctx.ellipse(px+Math.cos(a)*4,py+Math.sin(a)*4,3,1.8,a,0,6.28); ctx.fillStyle='#fff'; ctx.fill(); } ctx.beginPath(); ctx.arc(px,py,2.4,0,6.28); ctx.fillStyle='#f7c51e'; ctx.fill(); }
    else { ctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?3:7; ctx.lineTo(px+Math.cos(a)*r,py+Math.sin(a)*r); } ctx.closePath(); ctx.fillStyle=t.k==='g'?'#8fd0ff':'#ffd23f'; ctx.fill(); } }
  ctx.globalAlpha=1; }
// en liten träskylt med ett "i" vid varje tips; lästa skyltar bleknar
function drawSigns(l){ const v=view(); worldT();
  l.tips.forEach((t,k)=>{ const x=t[0], y=t[1]; if(x<v[0]-2||x>v[2]+2) return; ctx.globalAlpha=(state==='play'&&tipsSeen.has(k))?0.45:1;
    ctx.fillStyle='#7a5230'; ctx.fillRect(x-0.05,y,0.1,1.25); ctx.beginPath(); ctx.rect(x-0.42,y+1.05,0.84,0.62); ctx.fillStyle='#f3e3bf'; ctx.fill(); ctx.strokeStyle=OUT; ctx.lineWidth=0.06; ctx.stroke();
    ctx.save(); ctx.translate(x,y+1.36); ctx.scale(1,-1); ctx.fillStyle='#18324f'; ctx.font='bold 0.46px "Lilita One",Arial,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('i',0,0.02); ctx.restore(); });
  ctx.globalAlpha=1; }
function next(){ const pk=LEVELS.filter(l=>l.pack===lvl.pack); loadLevel(LEVELS.indexOf(pk[(pk.indexOf(lvl)+1)%pk.length])); }
// knapparna i slutrutan: under testkörning från editorn finns bara Kör igen och Till editorn
function endButtons(won){ $('bNext').style.display=won&&!edTesting?'':'none'; $('bLevels').style.display=edTesting?'none':''; $('bToEd').style.display=edTesting?'':'none'; }
let pausedState=null;
function showMenu(){ state='menu'; buildMenu(); $('endov').classList.remove('show'); $('menu').classList.add('show'); }
function toggleMenu(){ if($('menu').classList.contains('show')){ if(pausedState){ state=pausedState; pausedState=null; hideOv(); if(state==='win'||state==='crash') $('endov').classList.add('show'); } return; }
  pausedState=(state==='play'||state==='crash'||state==='win')?state:null; showMenu(); }
$('bMenu').onclick=()=>{ if(edTesting) edBack(); else toggleMenu(); }; $('bMap').onclick=()=>{ audioInit(); if(state==='overview') leaveOverview(); else enterOverview(); }; $('bRestart').onclick=()=>{ if(lvl) restart(); };
$('bResume').onclick=()=>{ if(pausedState){ state=pausedState; pausedState=null; hideOv(); if(state==='win'||state==='crash') $('endov').classList.add('show'); } };
$('bNext').onclick=next; $('bEditCur').onclick=()=>{ if(lvl&&li>=0) edOpen(li); }; $('bNewLevel').onclick=()=>edOpen(-1);
$('tabMain').onclick=()=>{ curPack=3; buildMenu(); }; $('tabMine').onclick=()=>{ curPack='mine'; buildMenu(); }; $('bAgain').onclick=restart; $('bLevels').onclick=()=>{ pausedState=null; showMenu(); };
const fsOK=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen; if(!fsOK) $('bFull').style.display='none';
$('bMusic').onclick=()=>setMusic(!musicOn);
// fjädringsval: ändrar bara fjäder, dämpning och fjäderväg (setSusp i core.js); gäller direkt, även mitt i en åkning
const SUSP_UI=[['hard','Hard','Stiff and stable. Hardly any bobbing.'],['normal','Normal','The way the levels were built and tested.'],['soft','Soft','More travel and a little bobbing after landings.'],
  ['elma','Elma','Elasto Mania feel: deep suspension that bobs for long and bounces high.'],['bouncy','Bouncy','Extremely springy. Bobs and bounces the most of all.']];
let suspK='normal'; try{ const v=localStorage.getItem('fjadra.susp'); if(SUSP_UI.some(o=>o[0]===v)) suspK=v; }catch(e){}
function setSuspension(k){ suspK=k; setSusp(k); try{ localStorage.setItem('fjadra.susp',k); }catch(e){}
  const box=$('suspBtns'); box.innerHTML=''; for(const [id,name] of SUSP_UI){ const b=document.createElement('button'); b.className='tab'+(id===k?' on':''); b.textContent=name; b.onclick=()=>setSuspension(id); box.appendChild(b); }
  $('suspTxt').textContent=SUSP_UI.find(o=>o[0]===k)[2]; }
setSuspension(suspK);
function setStyle(s){ STYLE=s; try{ localStorage.setItem('fjadra.style',s); }catch(e){} document.body.classList.toggle('neon',s==='neon'); $('bStyle').textContent='Style: '+(s==='neon'?'Neon':'Cartoon'); curTheme=''; if(lvl) setTheme(lvl.theme); buildMenu(); }
$('bStyle').onclick=()=>setStyle(STYLE==='neon'?'cartoon':'neon');
$('bNextUnplayed').onclick=()=>{ audioInit(); pausedState=null; let i=LEVELS.findIndex(l=>l.pack===curPack&&best[l.id]==null); if(i<0) i=LEVELS.findIndex((l,k)=>l.pack===curPack&&medalOf(k,best[l.id])<3); if(i<0) i=LEVELS.findIndex(l=>l.pack===curPack); loadLevel(i); };

$('bFull').onclick=()=>{ const d=document.documentElement; try{ if(document.fullscreenElement) document.exitFullscreen(); else { (d.requestFullscreen||d.webkitRequestFullscreen).call(d); if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); } }catch(e){} };
const PENCIL='<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-7 7l1.2-4.8L4.5-8.1a1.6 1.6 0 0 1 2.3 0l1.3 1.3a1.6 1.6 0 0 1 0 2.3L-2.2 5.8z" fill="#fff" stroke="#18324f" stroke-width="1.6" stroke-linejoin="round"/><path d="M2.6-6.2l3.6 3.6" stroke="#18324f" stroke-width="1.6"/></svg>';
function buildMenu(){ const box=$('lvls'); box.innerHTML=''; const shown=[], mine=curPack==='mine';
  $('tabMain').classList.toggle('on',!mine); $('tabMine').classList.toggle('on',mine); $('bNewLevel').style.display=mine?'':'none'; $('bNextUnplayed').style.display=mine?'none':'';
  LEVELS.forEach((l,i)=>{ if(l.pack!==curPack) return; const n=shown.length+1; shown.push(l); const wr=document.createElement('div'); wr.className='lvw'; const b=document.createElement('button'); b.className='lv'; const t=best[l.id];
    const badge=l.edited?'<span class="newb edb">EDITED</span>':(NEWLV.has(l.id)?'<span class="newb">NEW</span>':'');
    b.innerHTML='<canvas></canvas>'+badge+'<div class="meta"><div class="nm"><b>'+n+'. '+l.name.replace(/[<>&]/g,'')+'</b><i>'+(t!=null?fmt(t):'Not cleared')+(l.medal?' · gold '+l.medal[0]+' s':'')+'</i></div>'+(l.medal?medalSVG(medalOf(i,t)):'')+'</div>';
    b.onclick=()=>{ audioInit(); pausedState=null; loadLevel(i); };
    const e=document.createElement('button'); e.className='edp'; e.setAttribute('aria-label','Edit '+l.name); e.innerHTML=PENCIL; e.onclick=ev=>{ ev.stopPropagation(); edOpen(i); };
    wr.appendChild(b); wr.appendChild(e); box.appendChild(wr); });
  if(mine&&!shown.length) box.innerHTML='<p class="help" style="grid-column:1/-1;margin:4px 0 8px">No levels of your own yet. Tap <b>＋ New level</b> and build your first! You can also tap the pencil on a built-in level to adjust it.</p>';
  $('resumeRow').style.display=pausedState==='play'?'flex':'none'; $('bEditCur').style.display=pausedState==='play'&&li>=0?'':'none';
  const inPack=LEVELS.filter(l=>l.pack===curPack), done=inPack.filter(l=>best[l.id]!=null).length, golds=inPack.filter(l=>medalOf(LEVELS.indexOf(l),best[l.id])===3).length;
  $('progress').textContent=mine?(inPack.length?inPack.length+(inPack.length===1?' own level':' own levels'):''):'Cleared '+done+' of '+inPack.length+' · '+golds+' gold';
  $('bMusic').textContent='Music: '+(musicOn?'on':'off');
  requestAnimationFrame(()=>{ box.querySelectorAll('canvas').forEach((c,i)=>drawPreview(c,shown[i])); }); }

// ---------- rules ----------
function crash(){ if(state!=='play') return; state='crash'; endTimer=0; const [hx,hy]=headPos(bike);
  rag=makeRagdoll(bike); bike.rider=false; for(const k in rag.pts){ const q=rag.pts[k]; q.px+=(Math.random()-0.5)*0.01; q.py-= 0.004; }
  for(let i=0;i<14;i++){ const a=Math.random()*6.283, v=1.5+Math.random()*3; parts.push({k:'star',x:hx,y:hy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:.07+Math.random()*.06,l:.5,L:.5,c:i%2?'#ffe36b':'#ffffff'}); }
  beep(130,.35,'sawtooth',.13,.3); try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){}
  $('endTitle').textContent='Crash!'; $('endTime').innerHTML=''; $('endNote').textContent='Press GAS or Enter to ride again'; endButtons(false);
  setTimeout(()=>{ if(state==='crash') $('endov').classList.add('show'); },1100); }
function win(){ state='win'; endTimer=0; const test=li<0, prev=best[lvl.id]; const isRec=!test&&(prev==null||T<prev); if(isRec){ best[lvl.id]=T; saveBest(); saveGhost(lvl); } const rec_=isRec;
  const cols=['#ffe08a','#9bd37f','#8fb7ee','#f2a7a0','#ffffff','#b9e3ff']; for(let i=0;i<50;i++){ const an=Math.PI/2+(Math.random()-0.5)*2.0, v=3.5+Math.random()*4.5; parts.push({k:'conf',x:lvl.flower[0],y:lvl.flower[1]+1.1,vx:Math.cos(an)*v,vy:Math.sin(an)*v,rot:Math.random()*6,vr:(Math.random()-0.5)*14,l:2.2+Math.random(),L:3,c:cols[i%cols.length]}); }
  spark(lvl.flower[0],lvl.flower[1]+1); spark(lvl.flower[0],lvl.flower[1]+1);
  beep(660,.12,'triangle',.11); setTimeout(()=>beep(880,.12,'triangle',.11),110); setTimeout(()=>beep(1320,.28,'triangle',.11),220);
  const md=lvl.medal, m=md?medalOf(li,T):0; $('endTitle').textContent='Finished!'; $('endTime').innerHTML=(m?medalSVG(m):'')+'<span>'+fmt(T)+'</span>';
  const nxt=!md?'':m===3?'Gold!':(m===2?'Gold under '+fmt(md[0]):'Silver under '+fmt(md[1])+', gold under '+fmt(md[0]));
  $('endNote').textContent=test?'Test ride – the level can be finished!':((rec_&&prev!=null?'New record! ':'')+nxt+(rec_?(nxt?' · ':'')+'Ghost saved':''));
  endButtons(true); const pk=LEVELS.filter(l=>l.pack===lvl.pack); $('bNext').textContent=pk.indexOf(lvl)===pk.length-1?'First level':'Next level'; setTimeout(()=>{ if(state==='win') $('endov').classList.add('show'); },1000); }
function contactPts(){ const [hx,hy]=headPos(bike); return [[bike.wh[0].x,bike.wh[0].y,0.8],[bike.wh[1].x,bike.wh[1].y,0.8],[hx,hy,0.65]]; }
function checkItems(){ const pts=contactPts();
  for(let k=0;k<lvl.apples.length;k++){ if(got[k]) continue; const a=lvl.apples[k];
    for(const [x,y,r] of pts) if(Math.hypot(x-a[0],y-a[1])<r){ got[k]=true; updApples(); spark(a[0],a[1]); parts.push({k:'ring',x:a[0],y:a[1],r:0.3,l:0.45,L:0.45,c:a[2]?'#8fd0ff':'#ffe36b'}); pops.push({x:a[0],y:a[1]+0.4,t:0,txt:a[2]?'⟳':'+1'}); const tl=$('appleTile'); tl.classList.remove('pop'); void tl.offsetWidth; tl.classList.add('pop'); beep(988,.08,'square',.06); setTimeout(()=>beep(1480,.12,'square',.05),70);
      if(a[2]){ setGravity(bike,GV[a[2]][0],GV[a[2]][1]); updGrav(); toast('Gravity now points '+({up:'up',down:'down',left:'left',right:'right'})[a[2]],1500); beep(330,.3,'sine',.08,a[2]==='up'?2:.5); }
      try{ navigator.vibrate&&navigator.vibrate(15); }catch(e){} break; } }
  for(const s of lvl.killers) for(const [x,y,r] of pts) if(Math.hypot(x-s[0],y-s[1])<r-0.05) return crash();
  const fx=lvl.flower[0], fy=lvl.flower[1]+0.6;
  if(pts.some(([x,y])=>Math.hypot(x-fx,y-fy)<0.95)){ if(got.every(Boolean)) return win(); if(flagWarn<=0){ toast('Collect all the stars first ('+got.filter(Boolean).length+'/'+got.length+')',1600); flagWarn=2; } }
}
let dustT=0, bumpCD=0;
function physics(dt){ acc+=dt; const h=P.H; let n=0; const lean=(inp.left?1:0)-(inp.right?1:0); const I={gas:inp.gas,brake:inp.brake,lean};
  while(acc>=h&&n<40){ acc-=h; n++; if(state==='crash'||state==='win'){ if(endTimer<6) step(bike,state==='win'?{brake:1}:{},lvl.segs,h); continue; } if(state!=='play') continue; step(bike,I,lvl.segs,h); T+=h;
    recT+=h; if(recT>=1/30){ recT-=1/30; const b=bike.b,w0=bike.wh[0],w1=bike.wh[1]; rec.push([b.x,b.y,b.a,w0.x,w0.y,w0.a,w1.x,w1.y,w1.a,bike.r.x,bike.r.y,bike.dir,bike.flipT,bike.flipFrom].map(v=>Math.round(v*100)/100)); }
    { const hr=headResolve(bike,lvl.segs); if(hr==='crash'){ crash(); continue; } if(hr==='bump'&&bumpCD<=0){ bumpCD=0.35; beep(110,.08,'sine',.05); const [hx,hy]=headPos(bike); puff(hx,hy,0,0.5,0.1,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.35); } } if(n%3===0) checkItems();
    if(bike.b.y<lvl.bounds[1]-25||bike.b.y>lvl.bounds[3]+25||bike.b.x<lvl.bounds[0]-25||bike.b.x>lvl.bounds[2]+25) crash();
    if(!isFinite(bike.b.x)){ restart(); return; } }
  if(n>=40) acc=0;
  // skyltar (lvl.tips = [x, y, text]): texten visas en gång när cykeln passerar skylten
  if(state==='play'&&lvl.tips) lvl.tips.forEach((t,k)=>{ if(!tipsSeen.has(k)&&Math.abs(bike.b.x-t[0])<1.5&&Math.abs(bike.b.y-t[1])<4){ tipsSeen.add(k); toast(t[2],Math.max(4500,t[2].length*55)); } });
  if(state==='play'){ const spd=Math.hypot(bike.b.vx,bike.b.vy); stuckT=spd<0.35?stuckT+dt:0; stuckCD-=dt;
    if(stuckT>4.5&&stuckCD<=0&&T>3){ stuckT=0; stuckCD=25; toast(lvl.stuck||'Stuck? Pump (lean back, then throw your weight forward), try a bunny hop – or press RESTART.',4600); } }
  // landing dust
  if(state==='play'&&bike.impact>4.5){ const s=Math.min(1,(bike.impact-4)/8); for(const w of bike.wh){ for(let i=0;i<2+s*3;i++) puff(w.x+(Math.random()-0.5)*0.4,w.y-0.32,(Math.random()-0.5)*4*(0.5+s),Math.random()*1.2,0.13+s*0.12,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.5+s*0.4); } beep(90,.12,'sine',.08*s+.02); }
  if(state==='play') bike.impact=0;
  bumpCD-=dt;
  if(bike.bounced>0){ const s=Math.min(1,bike.bounced/0.5); bike.bounced=0; for(const w of bike.wh) for(let i=0;i<7;i++) puff(w.x+(Math.random()-0.5)*0.6,w.y-0.32,(Math.random()-0.5)*4,Math.random()*1.8,0.13+s*0.1,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.6); beep(150,.25,'sine',.1,3.2); try{ navigator.vibrate&&navigator.vibrate(20); }catch(e){} }
  if(bike.pumped>0){ bike.pumped=0; const di=bike.dir===1?0:1, w=bike.wh[di]; for(let i=0;i<3;i++) puff(w.x-bike.dir*0.3,w.y-0.32,-bike.dir*(1+Math.random()*1.5),0.4+Math.random()*0.6,0.09,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.45); beep(200,.1,'triangle',.04,1.6); }
  if(bike.hopped>0){ const s=bike.hopped; bike.hopped=0; for(const w of bike.wh) for(let i=0;i<5;i++) puff(w.x+(Math.random()-0.5)*0.5,w.y-0.32,(Math.random()-0.5)*3,Math.random()*1.4,0.12+s*0.08,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.55); beep(260,.18,'triangle',.07,2.2); }
  dustT-=dt; if(state==='play'&&(inp.gas||inp.brake)&&dustT<=0){ const di=bike.dir===1?0:1, dw=bike.wh[di]; if(bike.contact[di]>0.5){ const sp=Math.abs(dw.w)*P.WR, vs=Math.hypot(dw.vx,dw.vy);
      let onSteel=false; if(lvl.steelSegs.length) nearest(lvl.steelSegs,dw.x,dw.y,P.WR+0.08,()=>{ onSteel=true; return true; });
      if(onSteel&&(sp>1.5||(inp.brake&&vs>1.2))){ dustT=0.04; for(let i=0;i<3;i++) parts.push({k:'spark',x:dw.x-bike.dir*0.2,y:dw.y-0.38,vx:-bike.dir*(2+Math.random()*3),vy:1+Math.random()*2.5,l:0.35,L:0.35,c:Math.random()<.5?'#ffd27a':'#fff2b0'}); }
      else if(inp.gas&&sp>1.5){ dustT=0.09; puff(dw.x-bike.dir*0.25,dw.y-0.3,-bike.dir*(0.8+Math.random()*1.5),0.6+Math.random()*0.8,0.09+Math.random()*0.06,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.5);
        if(TH.kind==='grass'&&Math.random()<0.3) parts.push({k:'blade',x:dw.x-bike.dir*0.2,y:dw.y-0.3,vx:-bike.dir*(1+Math.random()*2.5),vy:1.5+Math.random()*2,rot:Math.random()*6,vr:(Math.random()-0.5)*20,l:0.6,L:0.6,c:Math.random()<.5?TH.top:TH.topDark});
        if(TH.kind==='snow') for(let i=0;i<1;i++) parts.push({k:'bit',x:dw.x-bike.dir*0.2,y:dw.y-0.3,vx:-bike.dir*(1+Math.random()*3),vy:1+Math.random()*2.5,l:0.6,c:'#ffffff',r:0.04+Math.random()*0.04}); } } }
}

// ---------- frame ----------
let last=performance.now(), tt=0;
function frame(now){
  let dt=Math.min(.05,(now-last)/1000); last=now; tt+=dt; flagWarn-=dt;
  if(state==='play') physics(dt); else if(state==='crash'){ endTimer+=dt; physics(dt); if(rag&&endTimer<6) stepRagdoll(rag,lvl.segs,dt); } else if(state==='win'){ endTimer+=dt; physics(dt*(endTimer<1.0?0.3:1)); }
  engineUpdate();
  if(lvl){
    if(state==='overview'){ const vb=lvl.vbounds, bw=vb[2]-vb[0]+3, bh=vb[3]-vb[1]+3; const sco=Math.min(W/bw,(Hh-130)/bh); const k=Math.min(1,dt*4);
      cam.x+=((vb[0]+vb[2])/2-cam.x)*k; cam.y+=((vb[1]+vb[3])/2-6/sco-cam.y)*k; SC+=(sco-SC)*k; }
    else if(state!=='edit'){ const fx0=rag?rag.pts.hip.x:bike.b.x, fy0=rag?rag.pts.hip.y:bike.b.y; const lx=fx0+(rag?0:Math.max(-3,Math.min(3,bike.b.vx*.28))), ly=fy0+.7+(rag?0:Math.max(-2.2,Math.min(2,bike.b.vy*0.3)));
    const k=Math.min(1,dt*2.8); cam.x+=(lx-cam.x)*k; cam.y+=(ly-cam.y)*k*0.85;
    const spd=Math.hypot(bike.b.vx,bike.b.vy), air=(bike.contact[0]<0.5&&bike.contact[1]<0.5)?1:0; const zt=0.86-Math.min(0.12,spd*0.008)-air*0.05; zoom+=(zt-zoom)*Math.min(1,dt*1.2); const tsc=SC0*zoom; SC+=(tsc-SC)*Math.min(1,dt*5); }
    shake*=Math.exp(-dt*7); const shx=(Math.random()-0.5)*shake, shy=(Math.random()-0.5)*shake; cam.x+=shx; cam.y+=shy;
    drawBackground(tt); drawLife(tt);
    for(const d of lvl.vis.deco) blit(SPR[d.kind],d.x,d.y,0,d.s);
    drawGround(lvl,tt); drawMarks(lvl); drawLanterns(lvl,tt); if(lvl.tips) drawSigns(lvl);
    for(const hng of lvl.vis.hang) blit(SPR.stalac,hng.x,hng.y,0,hng.s);
    // flower: bud until all stars are collected, then it blooms with a light beam
    const ready=got.every(Boolean); const fx=lvl.flower[0], fy=lvl.flower[1]; bloom+=((ready?1:0)-bloom)*Math.min(1,dt*3);
    if(bloom>0.02){ const sx=W/2+(fx-cam.x)*SC, sy=Hh/2-(fy+1-cam.y)*SC; ctx.setTransform(DPR,0,0,DPR,0,0);
      const bw=SC*0.9*bloom; const lg=ctx.createLinearGradient(0,sy-SC*9,0,sy); lg.addColorStop(0,'rgba(255,250,210,0)'); lg.addColorStop(1,'rgba(255,250,210,'+(0.2*bloom)+')'); ctx.fillStyle=lg; ctx.fillRect(sx-bw/2,sy-SC*9,bw,SC*9);
      const r=SC*(0.9+0.06*Math.sin(tt*1.8))*bloom; const gr=ctx.createRadialGradient(sx,sy,2,sx,sy,r); gr.addColorStop(0,'rgba(255,250,200,.85)'); gr.addColorStop(1,'rgba(255,250,200,0)'); ctx.fillStyle=gr; ctx.fillRect(sx-r,sy-r,r*2,r*2); }
    if(bloom<0.98) blit(SPR.bud,fx,fy,Math.sin(tt*2)*0.04,1,1-bloom);
    if(bloom>0.02) blit(SPR.flower,fx,fy,Math.sin(tt*2)*0.05,0.75+0.25*bloom+0.04*Math.sin(tt*4)*bloom,bloom);
    // killers with glow
    for(const s of lvl.killers){ const sx=W/2+(s[0]-cam.x)*SC, sy=Hh/2-(s[1]-cam.y)*SC; ctx.setTransform(DPR,0,0,DPR,0,0); const r=SC*(0.75+0.08*Math.sin(tt*5+s[0])); const gr=ctx.createRadialGradient(sx,sy,2,sx,sy,r); gr.addColorStop(0,s[2]==='saw'?'rgba(255,90,60,.28)':'rgba(255,60,40,.35)'); gr.addColorStop(1,'rgba(255,60,40,0)'); ctx.fillStyle=gr; ctx.fillRect(sx-r,sy-r,r*2,r*2);
      if(s[2]==='saw'){ ctx.beginPath(); ctx.arc(sx,sy,SC*0.47,0,6.28); ctx.strokeStyle='rgba(220,225,232,.35)'; ctx.lineWidth=SC*0.08; ctx.stroke(); }
      blit(s[2]==='saw'?SPR.saw:SPR.ball,s[0],s[1],s[2]==='saw'?tt*9:Math.sin(tt*1.5)*0.3); }
    lvl.apples.forEach((a,i)=>{ if(got[i]) return; const bob=REDUCED?0:Math.sin(tt*1.6+a[0])*0.05;
      { const sx=W/2+(a[0]-cam.x)*SC, sy=Hh/2-(a[1]+bob-cam.y)*SC; ctx.setTransform(DPR,0,0,DPR,0,0); const r=SC*(0.6+0.04*Math.sin(tt*1.5+a[0])); const gr=ctx.createRadialGradient(sx,sy,1,sx,sy,r); gr.addColorStop(0,a[2]?'rgba(120,200,255,.55)':'rgba(255,225,120,.6)'); gr.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=gr; ctx.fillRect(sx-r,sy-r,r*2,r*2);
        if(!REDUCED&&Math.random()<dt*0.8) parts.push({k:'star',x:a[0]+(Math.random()-0.5)*0.6,y:a[1]+bob+(Math.random()-0.5)*0.6,vx:0,vy:0.3,r:0.05+Math.random()*0.04,l:0.5,L:0.5,c:a[2]?'#c9ecff':'#fff6c2'}); }
      blit(a[2]?SPR.gapple:SPR.apple,a[0],a[1]+bob,REDUCED?0:Math.sin(tt*0.9+a[0])*0.15);
      if(a[2]){ const sx=W/2+(a[0]+0.28-cam.x)*SC, sy=Hh/2-(a[1]+0.3+bob-cam.y)*SC; ctx.setTransform(DPR,0,0,DPR,0,0); const r=SC*0.17;
        ctx.fillStyle='#18324f'; ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(1,SC*0.03); ctx.beginPath(); ctx.arc(sx,sy,r,0,6.28); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.translate(sx,sy); ctx.rotate({up:0,down:Math.PI,left:-Math.PI/2,right:Math.PI/2}[a[2]]); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(0,-r*0.65); ctx.lineTo(r*0.5,r*0.05); ctx.lineTo(r*0.18,r*0.05); ctx.lineTo(r*0.18,r*0.6); ctx.lineTo(-r*0.18,r*0.6); ctx.lineTo(-r*0.18,r*0.05); ctx.lineTo(-r*0.5,r*0.05); ctx.closePath(); ctx.fill(); ctx.restore(); } });
    worldT();
    // ghost of your best run
    if(state==='play'&&ghost){ const g=ghostAt(T); if(g){ const keep=bike; bike=g; BASE_A=0.32; ctx.globalAlpha=0.32; drawBike(0); BASE_A=1; ctx.globalAlpha=1; bike=keep; } }
    if(!rag) drawShadow(bike,1);
    drawBike(state==='edit'?0:dt); if(rag) drawRagdoll(rag); drawParts(dt); if(state==='edit') edDraw();
    // floating "+1"
    for(const p of pops){ p.t+=dt; } pops=pops.filter(p=>p.t<0.9);
    for(const p of pops){ ctx.save(); ctx.translate(p.x,p.y+p.t*1.2); ctx.scale(1,-1); ctx.globalAlpha=Math.max(0,1-p.t/0.9); ctx.font='bold 0.55px "Lilita One",Arial,sans-serif'; ctx.textAlign='center'; ctx.lineWidth=0.12; ctx.strokeStyle='#1d2633'; ctx.strokeText(p.txt,0,0); ctx.fillStyle=p.txt==='+1'?'#ffd23f':'#8fd0ff'; ctx.fillText(p.txt,0,0); ctx.restore(); }
    ctx.globalAlpha=1;
    drawGrade(); if(state!=='overview'&&state!=='edit') drawPointers(); drawVignette();
    cam.x-=shx; cam.y-=shy;
    ctx.setTransform(1,0,0,1,0,0);
    $('timer').textContent=fmt(T);
  }
  requestAnimationFrame(frame);
}
resize();
document.body.classList.toggle('neon',STYLE==='neon'); $('bStyle').textContent='Style: '+(STYLE==='neon'?'Neon':'Cartoon');
(function(){ edBoot(); lvl=LEVELS[0]; setTheme(lvl.theme); bike=newBike(lvl.start[0],lvl.start[1]); got=lvl.apples.map(()=>false); cam.x=bike.b.x+5; cam.y=bike.b.y+1.2; camBaseY=cam.y; state='menu'; $('lvlname').textContent=''; updApples(); buildMenu(); })();
requestAnimationFrame(frame);
