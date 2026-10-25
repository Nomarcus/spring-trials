// =====================================================================
// ================= UPPFÖRSBACKEN: climb mode (no death) ==============
// =====================================================================
P.HEAD_SAFE=1e9; // the helmet never ends the run here: a head knock is just a bump

// ---------- NARRATOR LINES (English) — edit freely ----------
// {m} = metres (fall distance or height), {n} = number of falls, {zone} = zone name
const NARRATOR_LINES={
  start:[
    "Ah, a new climber. The hill has been expecting you.",
    "There's only one way to go. Up. Mostly.",
    "Welcome. Nobody dies here. They just fall. Quite a lot.",
  ],
  fallSmall:[
    "Oops. That one doesn't count.",
    "A little backwards, a lot of learning.",
    "Gravity says hello.",
    "Just testing the ground. It's still there.",
    "Tiny setback. Barely worth a sigh.",
    "Shake it off. Literally.",
    "You meant to do that. I'll write it down as intentional.",
    "Minor rearrangement of altitude.",
  ],
  fallMedium:[
    "That didn't matter. Pick yourself up!",
    "The ground missed you, apparently.",
    "{m} metres. Some would call that a lesson.",
    "Down you go. Up you go again. That's the whole game, really.",
    "Not great, not terrible.",
    "The mountain gives, and the mountain takes back. Mostly takes.",
    "Ah. The scenic route.",
    "Well, you've seen this bit before. Now you can see it again.",
  ],
  fallHuge:[
    "Oh dear. {m} metres. Let's call that a warm-up.",
    "Can you see the view from down there? It's better up here.",
    "Breathe. The bike isn't judging you. Only I am.",
    "{m} metres. I'd clap, but it seems insensitive.",
    "And that, ladies and gentlemen, is what we call gravity.",
    "{m} metres in a few seconds. Climbing back will take a bit longer.",
    "Everything you built, gone. Isn't it wonderful? You get to build it again.",
    "Somewhere, a physics teacher is very proud of you.",
    "The good news: you know the way. The bad news: you know the way.",
    "There's an old saying about falling. I've forgotten it. It's a long way down.",
  ],
  manyFalls:[
    "Fifth time lucky? No, sixth.",
    "I have plenty of time. Do you?",
    "{n} falls and counting. I'm keeping score, by the way.",
    "Same jump again? Bold strategy.",
    "Perhaps try doing the opposite of whatever you just did.",
    "You're not stuck. You're... iterating.",
    "Persistence is a virtue. So is looking where you're going.",
    "Definition of insanity, they say. I say: definition of this game.",
  ],
  idle:[
    "You can't stare your way up the hill.",
    "The gas is the green button, just so you know.",
    "Contemplating the meaning of it all? Me too. Mostly I'm waiting.",
    "Take your time. The mountain isn't going anywhere. Neither, it seems, are you.",
    "Hello? Still there? The hill is getting bored.",
    "A short rest. Very wise. Very, very long. Short rest.",
  ],
  newBest:[
    "New record! Now you have more to lose.",
    "Look at you, rising. Literally.",
    "{m} metres. Higher than you've ever been. Don't look down.",
    "A new personal best. The ground will miss you.",
    "Higher and higher. The fall gets more impressive too, you know.",
    "Uncharted territory. For you, anyway.",
  ],
  newZone:[
    "Welcome to {zone}. Same gravity, different scenery.",
    "{zone}. It only gets steeper from here.",
    "Ah, {zone}. Many have come this far. Many have also left this far. Quickly. Downwards.",
    "You've reached {zone}. I'd say it's all downhill from here, but that's the problem.",
  ],
  loop:[
    "Round and round! Is your stomach keeping up?",
    "A full loop. Completely unnecessary. I loved it.",
    "Show-off.",
  ],
  tunnel:[
    "Ah, the tunnel of shame. Up you go.",
    "This tunnel has seen many climbers. All of them sighing.",
  ],
  nearSummit:[
    "Almost there. It would be a shame if something happened now...",
    "The top is right there. No pressure. Well, some pressure.",
    "Careful now. This is where the stories get tragic.",
  ],
  summit:[
    "You did it. I was never worried. Okay, a little.",
    "The summit! All that falling was worth it. Mostly.",
  ],
};

// ---------- course ----------
lvl=LEVELS[0]; const CO=lvl;
const ZONES=CO.zones.map((z,i)=>Object.assign({},z,{x1:i+1<CO.zones.length?CO.zones[i+1].x0:1e9}));
const ZNAMES_EN={'Ängen':'the Meadow','Skogen':'the Forest','Klipporna':'the Cliffs','Snöfältet':'the Snowfield','Molnen':'the Clouds','Toppen':'the Summit'};
function zoneAt(x){ let k=0; for(let i=0;i<ZONES.length;i++) if(x>=ZONES[i].x0) k=i; return k; }
// collision grid: physics only sees nearby segments (long level, mobile-friendly)
const GRID={}, GC=8; for(const s of CO.segs){ for(let gx=Math.floor((s.minx-1)/GC);gx<=Math.floor((s.maxx+1)/GC);gx++) for(let gy=Math.floor((s.miny-1)/GC);gy<=Math.floor((s.maxy+1)/GC);gy++){ const k=gx+','+gy; (GRID[k]||(GRID[k]=[])).push(s); } }
let near=[]; function updNear(x,y){ const seen=new Set(), out=[]; const r=2; const cx=Math.floor(x/GC), cy=Math.floor(y/GC);
  for(let gx=cx-r;gx<=cx+r;gx++) for(let gy=cy-r;gy<=cy+r;gy++){ const L=GRID[gx+','+gy]; if(L) for(const s of L) if(!seen.has(s)){ seen.add(s); out.push(s); } } near=out; }

// ---------- extra themes for the zones ----------
Object.assign(THEMES,{
  forest:{sky:['#7fb8d8','#b9dcea','#e8f2e4'], clouds:1, sun:null, mtn:'#9fb6cc', mtnShade:'#8fa8c2', snow:'#f3f7fa', far:'#6f9a7c', farTree:'#4f7d60', near:'#7cb36a', nearShade:'#6aa25a', nearTree:'#3f7a45', lake:null,
    dirt:'#8f6a4c', dirtDark:'#7a5a40', dirtLight:'#a57d5c', rock:'#a9a197', rockLight:'#c4bdb3', rockDark:'#918a80', top:'#5fae4a', topLight:'#93d070', topDark:'#3f8a35', edge:'#4f3624', kind:'grass',
    deco:['pine','pine','pine','mushroom','bush','grass','pine','rock']},
  rocks:{sky:['#a7b9cc','#d7dde3','#f1ede4'], clouds:1, sun:null, mtn:'#a99f9a', mtnShade:'#978d88', snow:'#f4f4f4', far:'#9a9187', farTree:'#857b72', near:'#b3a596', nearShade:'#a09282', nearTree:'#7a8a62', lake:null,
    dirt:'#9b8b7c', dirtDark:'#857667', dirtLight:'#b2a291', rock:'#c9c2b8', rockLight:'#e0dad2', rockDark:'#aaa298', top:'#b9ad9c', topLight:'#d8cdbd', topDark:'#8f8273', edge:'#4e4339', kind:'rock',
    deco:['rock','rock','bush','grass','pine','rock']},
  sky:{sky:['#6fa8e0','#a9cdf0','#e9f3fb'], clouds:1, sun:null, mtn:'#c7d8ec', mtnShade:'#b6cbe3', snow:'#ffffff', far:'#dbe8f5', farTree:'#c2d5ea', near:'#eef4fb', nearShade:'#e2ecf7', nearTree:null, lake:null,
    dirt:'#a7b4c6', dirtDark:'#95a3b6', dirtLight:'#bcc8d8', rock:'#c9d3df', rockLight:'#e3e9f0', rockDark:'#aebbca', top:'#ffffff', topLight:'#ffffff', topDark:'#c9d9ec', edge:'#5b6b80', kind:'snow',
    deco:['snowbush','rock','snowbush','snowpine']},
  summit:{sky:['#5d6fb0','#e7a2a6','#ffd9a0'], clouds:0, sun:'#ffe9b8', mtn:'#8f7fae', mtnShade:'#806f9f', snow:'#fff1e6', far:'#857aa0', farTree:'#6f6690', near:'#cfc3d6', nearShade:'#bfb2c8', nearTree:'#6b6a8a', lake:null,
    dirt:'#9a8478', dirtDark:'#857066', dirtLight:'#b09a8d', rock:'#c4b6b4', rockLight:'#dcd0ce', rockDark:'#a99a98', top:'#fff6ee', topLight:'#ffffff', topDark:'#d9c6c9', edge:'#4f4048', kind:'snow',
    deco:['snowpine','rock','snowbush']},
});
// per-theme cache of sprites / ground pattern / background so zones can share one long level
const TCACHE={}; let curZoneTheme='';
function buildThemeCache(){ const keep=TH; for(const z of ZONES){ const n=z.theme; if(TCACHE[n]&&TCACHE[n].key===SC0+'|'+DPR+'|'+W+'|'+Hh) continue;
    curTheme=''; TH=THEMES[n]; const keepSC=SC; SC=SC0; buildSprites(); SC=keepSC; buildPattern(); BG={key:'',layers:[]}; buildBackground(n);
    TCACHE[n]={key:SC0+'|'+DPR+'|'+W+'|'+Hh, spr:Object.assign({},SPR), pat:PAT, bg:BG}; }
  TH=keep; curZoneTheme=''; }
function useTheme(n){ const c=TCACHE[n]; TH=THEMES[n]; Object.assign(SPR,c.spr); PAT=c.pat; BG=c.bg; }
// per-zone geometry analysis (tops, decorations) with the zone's own theme
const ZVIS=[]; function analyzeZones(){ const keep=TH; for(let i=0;i<ZONES.length;i++){ const z=ZONES[i]; TH=THEMES[z.theme]; const tmp={rings:CO.rings,name:z.name+'xx'}; analyze(tmp);
    const inZ=s=>{ const mx=(s.x1+s.x2)/2; return mx>=z.x0&&mx<z.x1; };
    ZVIS[i]={tops:tmp.vis.tops.filter(inZ),deco:tmp.vis.deco.filter(d=>d.x>=z.x0+1&&d.x<z.x1-1),hang:[]}; } TH=keep; }
// override: setTheme is used by resize(); here it (re)builds every zone theme
function setTheme(name){ if(curTheme===SC0+'|'+DPR+'|'+W+'|'+Hh) return; curTheme=SC0+'|'+DPR+'|'+W+'|'+Hh; buildThemeCache(); if(bike) useTheme(ZONES[zoneAt(bike.b.x)].theme); }

// ---------- save / load ----------
const SKEY='fjadra.climb.v1';
let SV={best:0,T:0,falls:0,maxFall:0,bike:null,zone:0,done:0,bestT:null,camY:0};
try{ const s=JSON.parse(localStorage.getItem(SKEY)||'null'); if(s) SV=Object.assign(SV,s); }catch(e){}
function save(){ try{ SV.T=T; if(bike&&state!=='menu') SV.bike=JSON.parse(JSON.stringify(bike)); localStorage.setItem(SKEY,JSON.stringify(SV)); }catch(e){} }
setInterval(()=>{ if(state==='play') save(); },2000);
addEventListener('pagehide',save); document.addEventListener('visibilitychange',()=>{ if(document.hidden) save(); });
const heightOf=bk=>bk.b.y-0.95;

// ---------- narrator ----------
let NV=null; const narrRecent=[]; let narrLast=-1e9, narrT=0;
function pickVoice(){ try{ const vs=speechSynthesis.getVoices(); NV=vs.find(v=>/^en[-_]GB/i.test(v.lang)&&/male|daniel|george|arthur|oliver/i.test(v.name))||vs.find(v=>/^en[-_]GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null; }catch(e){} }
if(window.speechSynthesis){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function say(cat,vars,force){ const now=performance.now()/1000; if(!force&&now-narrLast<10) return false; const L=NARRATOR_LINES[cat]; if(!L||!L.length) return false;
  let opts=L.filter(l=>!narrRecent.includes(l)); if(!opts.length) opts=L; let line=opts[Math.floor(Math.random()*opts.length)];
  narrRecent.push(line); if(narrRecent.length>14) narrRecent.shift(); narrLast=now;
  line=line.replace(/\{(\w+)\}/g,(_,k)=>vars&&vars[k]!=null?vars[k]:'');
  line=line.charAt(0).toUpperCase()+line.slice(1);
  const el=$('narr'); el.textContent=line; el.classList.add('show'); clearTimeout(narrT); narrT=setTimeout(()=>el.classList.remove('show'),2600+line.length*55);
  if(!muted&&narrOn&&window.speechSynthesis&&window.SpeechSynthesisUtterance){ try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(line); u.lang=NV?NV.lang:'en-GB'; if(NV) u.voice=NV; u.rate=0.9; u.pitch=0.85; u.volume=0.95; speechSynthesis.speak(u); }catch(e){} }
  return true; }
let narrOn=true; try{ narrOn=localStorage.getItem('fjadra.narr')!=='0'; }catch(e){}
$('bSound').addEventListener('click',()=>{ if(muted&&window.speechSynthesis) try{ speechSynthesis.cancel(); }catch(e){} });

// ---------- input ----------
let lastInput=performance.now()/1000;
function press(k,on){
  audioInit(); if(AC&&AC.state==='suspended') AC.resume(); lastInput=performance.now()/1000;
  if(k==='turn'){ if(on&&(state==='play')){ turn(bike); beep(520,.22,'sine',.04,.45); for(let i=0;i<2;i++){ const w=bike.wh[i]; if(bike.contact[i]>0.5) for(let j=0;j<3;j++) puff(w.x+(Math.random()-0.5)*0.4,w.y-0.32,(Math.random()-0.5)*2.2,0.3+Math.random()*0.6,0.09,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.45); } } return; }
  const was=inp[k]; inp[k]=on?1:0;
  if(on&&!was&&state==='play'&&(k==='left'||k==='right')){
    const both=inp.left&&inp.right; if(volt(bike,k==='left'?1:-1,both)) beep(both?180:150,.07,'sawtooth',.035,1.6);
  }
}
document.querySelectorAll('[data-k]').forEach(b=>{ const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); try{b.setPointerCapture(e.pointerId);}catch(_){} b.classList.add('on'); press(k,true); });
  const up=()=>{ if(!b.classList.contains('on')) return; b.classList.remove('on'); press(k,false); };
  b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('lostpointercapture',up); b.addEventListener('contextmenu',e=>e.preventDefault()); });
const KEYS={ArrowUp:'gas',KeyW:'gas',ArrowDown:'brake',KeyS:'brake',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
  if(KEYS[e.code]){ e.preventDefault(); if(!e.repeat) press(KEYS[e.code],true); return; }
  if(e.code==='Space'){ e.preventDefault(); if(!e.repeat) press('turn',true); return; }
  if(e.code==='Escape'||e.code==='KeyP'){ e.preventDefault(); toggleMenu(); } });
addEventListener('keyup',e=>{ if(KEYS[e.code]) press(KEYS[e.code],false); });
addEventListener('blur',()=>{ for(const k in inp) inp[k]=0; document.querySelectorAll('.k.on').forEach(b=>b.classList.remove('on')); });
document.addEventListener('contextmenu',e=>e.preventDefault());

// ---------- start / menu ----------
let fallFlag=false, falls=0, fallStreak=0, maxZone=0, nearSummitSaid=false, airStartH=null, airT=0, upsideT=0, lastGood=null, lastGoodT=0, loopAcc=0, loopIn=-1, loopDone=false, lastBestSaid=0, idleSaid=0, inTunnelSaid=false;
function startClimb(fresh){ audioInit(); state='play';
  if(fresh||!SV.bike){ SV={best:0,T:0,falls:0,maxFall:0,bike:null,zone:0,done:SV.done||0,bestT:SV.bestT,camY:0}; bike=newBike(CO.start[0],CO.start[1]); T=0; }
  else { bike=Object.assign(newBike(0,0),SV.bike); T=SV.T||0; }
  falls=SV.falls||0; maxZone=SV.zone||0; fallStreak=0; nearSummitSaid=false; airStartH=null; parts=[]; pops=[]; acc=0; bloom=0;
  cam.x=bike.b.x+1; cam.y=bike.b.y+0.8; camBaseY=cam.y; curZoneTheme=''; hideOv(); updHud(true); save();
  if(fresh||!SV.T) setTimeout(()=>say('start',{},true),900); else toast('Välkommen tillbaka. Backen väntade på dig.',2600); }
let pausedState=null;
function hideOv(){ $('menu').classList.remove('show'); $('endov').classList.remove('show'); }
function showMenu(){ buildMenu(); $('endov').classList.remove('show'); $('menu').classList.add('show'); }
function toggleMenu(){ if($('menu').classList.contains('show')){ if(pausedState){ state=pausedState; pausedState=null; hideOv(); } return; }
  pausedState=(state==='play'||state==='win')?state:null; state='menu'; save(); showMenu(); }
function buildMenu(){ const has=!!SV.bike; $('bResume').style.display=pausedState?'':'none';
  $('bContinue').style.display=(!pausedState&&has)?'':'none'; $('bContinue').textContent='Fortsätt klättringen ('+Math.max(0,Math.round(heightOf(SV.bike||{b:{y:0}})))+' m)';
  $('bNew').textContent=has?'Börja om från början':'Börja klättra'; $('bNew').className=has?'btn alt':'btn'; $('bNew').dataset.arm='';
  $('stats').textContent=has?('Bästa höjd '+Math.round(SV.best)+' m · '+(SV.falls||0)+' fall · längsta fall '+Math.round(SV.maxFall||0)+' m · tid '+fmt(SV.T||0)+(SV.bestT!=null?' · rekord till toppen '+fmt(SV.bestT):'')):'Toppen ligger '+Math.round(CO.flower[1])+' meter upp. Ingen har sagt att det skulle vara lätt.';
  $('bMusic').textContent='Musik: '+(musicOn?'på':'av'); $('bNarr').textContent='Berättare: '+(narrOn?'på':'av'); }
$('bMenu').onclick=toggleMenu;
$('bResume').onclick=()=>{ if(pausedState){ state=pausedState; pausedState=null; hideOv(); } };
$('bContinue').onclick=()=>{ pausedState=null; startClimb(false); };
let armT=0; $('bNew').onclick=()=>{ const b=$('bNew'); if(SV.bike&&b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='Säker? Tryck igen – allt försvinner'; clearTimeout(armT); armT=setTimeout(()=>{ b.dataset.arm=''; b.textContent='Börja om från början'; },3500); return; }
  pausedState=null; startClimb(true); };
$('bMusic').onclick=()=>setMusic(!musicOn);
$('bNarr').onclick=()=>{ narrOn=!narrOn; try{ localStorage.setItem('fjadra.narr',narrOn?'1':'0'); }catch(e){} if(!narrOn&&window.speechSynthesis) try{ speechSynthesis.cancel(); }catch(e){} buildMenu(); };
const fsOK=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen; if(!fsOK) $('bFull').style.display='none';
$('bFull').onclick=()=>{ const d=document.documentElement; try{ if(document.fullscreenElement) document.exitFullscreen(); else { (d.requestFullscreen||d.webkitRequestFullscreen).call(d); if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); } }catch(e){} };
$('bOn').onclick=()=>{ state='play'; hideOv(); };
$('bAgain').onclick=()=>{ $('endov').classList.remove('show'); startClimb(true); };

// ---------- HUD ----------
let hudH=-1;
function updHud(force){ const h=Math.max(0,heightOf(bike)); const hr=Math.round(h); if(hr!==hudH||force){ hudH=hr; $('applesTxt').textContent=hr+' m'; }
  $('bestTxt').textContent='Bäst '+Math.round(SV.best)+' m'; const z=zoneAt(bike.b.x); $('lvlname').textContent=ZONES[z].name+' · zon '+(z+1)+' av '+ZONES.length; }
function fallBanner(m){ const el=$('fallTxt'); el.textContent='−'+m+' m'; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }

// ---------- rules ----------
function win(){ if(state!=='play') return; state='win'; endTimer=0; SV.done=(SV.done||0)+1; if(SV.bestT==null||T<SV.bestT) SV.bestT=T; save();
  const cols=['#ffe08a','#9bd37f','#8fb7ee','#f2a7a0','#ffffff','#b9e3ff']; for(let i=0;i<90;i++){ const an=Math.PI/2+(Math.random()-0.5)*2.2, v=3.5+Math.random()*6; parts.push({k:'conf',x:lvl.flower[0],y:lvl.flower[1]+1.1,vx:Math.cos(an)*v,vy:Math.sin(an)*v,rot:Math.random()*6,vr:(Math.random()-0.5)*14,l:2.6+Math.random(),L:3.4,c:cols[i%cols.length]}); }
  spark(lvl.flower[0],lvl.flower[1]+1); spark(lvl.flower[0],lvl.flower[1]+1); spark(lvl.flower[0],lvl.flower[1]+1.5);
  beep(660,.12,'triangle',.11); setTimeout(()=>beep(880,.12,'triangle',.11),110); setTimeout(()=>beep(1320,.28,'triangle',.11),220); setTimeout(()=>beep(1760,.4,'triangle',.09),360);
  say('summit',{},true);
  $('endTitle').textContent='Toppen!'; $('endTime').innerHTML='<span>'+fmt(T)+'</span>';
  $('endNote').textContent=falls+' fall · längsta fall '+Math.round(SV.maxFall||0)+' m'+(SV.bestT===T?' · nytt rekord!':'');
  setTimeout(()=>{ if(state==='win') $('endov').classList.add('show'); },1600); }
function contactPts(){ const [hx,hy]=headPos(bike); return [[bike.wh[0].x,bike.wh[0].y,0.8],[bike.wh[1].x,bike.wh[1].y,0.8],[hx,hy,0.65]]; }
function checkItems(){ const pts=contactPts(); const fx=lvl.flower[0], fy=lvl.flower[1]+0.6;
  if(pts.some(([x,y])=>Math.hypot(x-fx,y-fy)<1.1)) win(); }
let dustT=0, bumpCD=0;
function physics(dt){ acc+=dt; const h=P.H; let n=0; const lean=(inp.left?1:0)-(inp.right?1:0); const I={gas:inp.gas,brake:inp.brake,lean};
  updNear(bike.b.x,bike.b.y);
  while(acc>=h&&n<40){ acc-=h; n++; if(state==='win'){ if(endTimer<6) step(bike,{brake:1},near,h); continue; } if(state!=='play') continue; step(bike,I,near,h); T+=h;
    { const hr=headResolve(bike,near); if(hr==='bump'&&bumpCD<=0){ bumpCD=0.35; beep(110,.08,'sine',.05); const [hx,hy]=headPos(bike); puff(hx,hy,0,0.5,0.1,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.35); } } if(n%3===0) checkItems();
    if(n%60===0) updNear(bike.b.x,bike.b.y);
    if(!isFinite(bike.b.x)||!isFinite(bike.b.y)){ if(lastGood) bike=Object.assign(newBike(0,0),JSON.parse(lastGood)); else bike=newBike(CO.start[0],CO.start[1]); acc=0; return; } }
  if(n>=40) acc=0;
  if(state==='play'&&bike.impact>4.5){ const s=Math.min(1,(bike.impact-4)/8); for(const w of bike.wh){ for(let i=0;i<2+s*3;i++) puff(w.x+(Math.random()-0.5)*0.4,w.y-0.32,(Math.random()-0.5)*4*(0.5+s),Math.random()*1.2,0.13+s*0.12,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.5+s*0.4); } beep(90,.12,'sine',.08*s+.02); if(bike.impact>9) shake=Math.min(0.5,bike.impact*0.03); }
  if(state==='play') bike.impact=0;
  bumpCD-=dt;
  if(bike.bounced>0){ const s=Math.min(1,bike.bounced/0.5); bike.bounced=0; for(const w of bike.wh) for(let i=0;i<7;i++) puff(w.x+(Math.random()-0.5)*0.6,w.y-0.32,(Math.random()-0.5)*4,Math.random()*1.8,0.13+s*0.1,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.6); beep(150,.25,'sine',.1,3.2); try{ navigator.vibrate&&navigator.vibrate(20); }catch(e){} }
  if(bike.pumped>0){ bike.pumped=0; const di=bike.dir===1?0:1, w=bike.wh[di]; for(let i=0;i<3;i++) puff(w.x-bike.dir*0.3,w.y-0.32,-bike.dir*(1+Math.random()*1.5),0.4+Math.random()*0.6,0.09,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.45); beep(200,.1,'triangle',.04,1.6); }
  if(bike.hopped>0){ const s=bike.hopped; bike.hopped=0; for(const w of bike.wh) for(let i=0;i<5;i++) puff(w.x+(Math.random()-0.5)*0.5,w.y-0.32,(Math.random()-0.5)*3,Math.random()*1.4,0.12+s*0.08,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.55); beep(260,.18,'triangle',.07,2.2); }
  dustT-=dt; if(state==='play'&&inp.gas&&dustT<=0){ const di=bike.dir===1?0:1, dw=bike.wh[di]; if(bike.contact[di]>0.5){ const sp=Math.abs(dw.w)*P.WR;
      if(sp>1.5){ dustT=0.09; puff(dw.x-bike.dir*0.25,dw.y-0.3,-bike.dir*(0.8+Math.random()*1.5),0.6+Math.random()*0.8,0.09+Math.random()*0.06,TH.kind==='snow'?'#ffffff':TH.dirtLight,0.5);
        if(TH.kind==='grass'&&Math.random()<0.3) parts.push({k:'blade',x:dw.x-bike.dir*0.2,y:dw.y-0.3,vx:-bike.dir*(1+Math.random()*2.5),vy:1.5+Math.random()*2,rot:Math.random()*6,vr:(Math.random()-0.5)*20,l:0.6,L:0.6,c:Math.random()<.5?TH.top:TH.topDark});
        if(TH.kind==='snow') parts.push({k:'bit',x:dw.x-bike.dir*0.2,y:dw.y-0.3,vx:-bike.dir*(1+Math.random()*3),vy:1+Math.random()*2.5,l:0.6,c:'#ffffff',r:0.04+Math.random()*0.04}); } } }
}
// climb logic once per frame: falls, records, zones, narrator, self-righting
function climbLogic(dt){ if(state!=='play') return; const now=performance.now()/1000; const h=heightOf(bike);
  const grounded=bike.contact[0]>0.5||bike.contact[1]>0.5;
  if(airStartH==null) airStartH=h; airStartH=Math.max(airStartH,h); if(bike.b.vy<-6) fallFlag=true;
  const slow=grounded&&Math.abs(bike.b.vy)<2; airT=slow?airT+dt:0;
  if(airT>0.4){ const drop=airStartH-h;
    if(fallFlag&&drop>=3){ falls++; SV.falls=falls; fallStreak++; const m=Math.round(drop); if(m>(SV.maxFall||0)) SV.maxFall=m;
      if(drop>=6) fallBanner(m);
      if(fallStreak>=4&&Math.random()<0.5) say('manyFalls',{n:falls}); else say(drop>=20?'fallHuge':drop>=8?'fallMedium':'fallSmall',{m},drop>=20); save(); }
    airStartH=h; fallFlag=false; }
  if(h>SV.best){ const old=SV.best; SV.best=h; if(Math.floor(h/10)>Math.floor(old/10)&&h>15&&now-lastBestSaid>45){ if(say('newBest',{m:Math.round(h)})){ lastBestSaid=now; fallStreak=0; } } }
  const z=zoneAt(bike.b.x); if(z>maxZone&&grounded){ maxZone=z; SV.zone=z; toast(ZONES[z].name,2600); say('newZone',{zone:ZNAMES_EN[ZONES[z].name]||ZONES[z].name},true); fallStreak=0; }
  if(!nearSummitSaid&&CO.flower[1]-h<30&&bike.b.x>CO.flower[0]-160){ nearSummitSaid=true; say('nearSummit',{},true); }
  if(now-lastInput>25&&now-idleSaid>40){ idleSaid=now; say('idle'); }
  // tunnel back from an abyss
  for(const a of CO.abysses){ if(a.hole&&bike.b.x>a.hole.x+8&&bike.b.x<a.x0&&h<a.hole.y-3&&!inTunnelSaid){ inTunnelSaid=true; say('tunnel'); } }
  if(h>(CO.abysses[0]?0:0)&&grounded&&inTunnelSaid&&CO.abysses.every(a=>!(bike.b.x>a.hole.x+2&&bike.b.x<a.x0&&h<a.hole.y-2))) inTunnelSaid=false;
  // loop rooms: a full turn inside a circle
  let inLoop=-1; CO.loops.forEach((L,i)=>{ if(Math.hypot(bike.b.x-L.x,bike.b.y-L.y)<L.r+0.3) inLoop=i; });
  if(inLoop!==loopIn){ loopIn=inLoop; loopAcc=0; }
  if(inLoop>=0){ loopAcc+=bike.b.w*dt; if(Math.abs(loopAcc)>6.0){ loopAcc=0; say('loop',{},true); parts.push({k:'ring',x:bike.b.x,y:bike.b.y,r:0.5,l:0.6,L:0.6,c:'#ffe36b'}); } }
  // self-righting: stuck upside down -> a gentle shove back onto the wheels (no teleport)
  const up=Math.cos(bike.b.a); if(up<-0.2&&Math.hypot(bike.b.vx,bike.b.vy)<2.5) upsideT+=dt; else upsideT=Math.max(0,upsideT-dt*2);
  if(upsideT>1.3){ upsideT=0; const sgn=Math.sin(bike.b.a)>=0?-1:1; const kick=3.6; bike.b.vy+=kick; for(const w of bike.wh) w.vy+=kick; bike.r.vy+=kick; bike.b.w=sgn*6.5; beep(240,.15,'triangle',.05,1.8); }
  if(grounded&&up>0.6&&now-lastGoodT>1){ lastGoodT=now; lastGood=JSON.stringify(bike); }
}

// ---------- signs ----------
function drawSigns(){ ctx.setTransform(DPR,0,0,DPR,0,0); const v=view();
  for(const s of CO.signs){ if(!s.t||s.x<v[0]-4||s.x>v[2]+4||s.y<v[1]-3||s.y>v[3]+3) continue;
    const sx=W/2+(s.x-cam.x)*SC, sy=Hh/2-(s.y-cam.y)*SC; const fs=Math.max(10,SC*0.24); ctx.font='800 '+fs+'px Nunito,system-ui,sans-serif';
    const words=s.t.split(' '), lines=[]; let cur=''; for(const w of words){ const t=cur?cur+' '+w:w; if(ctx.measureText(t).width>SC*3.0&&cur){ lines.push(cur); cur=w; } else cur=t; } if(cur) lines.push(cur);
    const bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+fs*1.2, bh=lines.length*fs*1.2+fs*0.8, top=sy-SC*1.35-bh;
    ctx.fillStyle='#6b4a2a'; ctx.strokeStyle=OUT; ctx.lineWidth=Math.max(1.5,SC*0.04); ctx.fillRect(sx-SC*0.06,top+bh-2,SC*0.12,sy-(top+bh)+2); ctx.strokeRect(sx-SC*0.06,top+bh-2,SC*0.12,sy-(top+bh)+2);
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(sx-bw/2,top,bw,bh,fs*0.35); else ctx.rect(sx-bw/2,top,bw,bh); ctx.fillStyle='#e9c995'; ctx.fill(); ctx.stroke();
    ctx.fillStyle='#4a3218'; ctx.textAlign='center'; ctx.textBaseline='middle'; lines.forEach((l,i)=>ctx.fillText(l,sx,top+fs*0.4+fs*1.2*(i+0.5))); }
  ctx.textAlign='start'; ctx.textBaseline='alphabetic'; }
function drawSummitFlag(t){ const fx=CO.flower[0]+2.2, fy=CO.flower[1]; const v=view(); if(fx<v[0]-5||fx>v[2]+5||fy<v[1]-6||fy>v[3]+6) return; worldT();
  ctx.strokeStyle=OUT; ctx.lineWidth=0.09; ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx,fy+3.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fx,fy+3.35); for(let i=0;i<=10;i++){ const u=i/10; ctx.lineTo(fx+u*1.6,fy+3.35-0.05+Math.sin(t*4+u*5)*0.12*u); } for(let i=10;i>=0;i--){ const u=i/10; ctx.lineTo(fx+u*1.6,fy+2.45+Math.sin(t*4+u*5)*0.12*u); } ctx.closePath(); ctx.fillStyle='#e8433a'; ctx.fill(); ctx.lineWidth=0.05; ctx.stroke(); }

// ---------- world drawing per zone ----------
function drawWorld(t){ const v=view(); for(let i=0;i<ZONES.length;i++){ const z=ZONES[i]; if(z.x1<v[0]-1||z.x0>v[2]+1) continue;
    useTheme(z.theme); const zv=ZVIS[i];
    for(const d of zv.deco) if(d.x>v[0]-4&&d.x<v[2]+4&&d.y>v[1]-6&&d.y<v[3]+2) blit(SPR[d.kind],d.x,d.y,0,d.s);
    worldT(); ctx.save(); ctx.beginPath(); ctx.rect(z.x0,v[1]-400,Math.min(z.x1,v[2]+400)-z.x0,v[3]-v[1]+800); ctx.clip();
    drawGround({bounds:CO.bounds,rings:CO.rings,vis:{tops:zv.tops}},t); ctx.restore(); }
  useTheme(ZONES[zoneAt(bike.b.x)].theme); }

// ---------- frame ----------
let last=performance.now(), tt=0;
function frame(now){
  let dt=Math.min(.05,(now-last)/1000); last=now; tt+=dt;
  if(state==='play'){ physics(dt); climbLogic(dt); } else if(state==='win'){ endTimer+=dt; physics(dt*(endTimer<1.0?0.3:1)); }
  engineUpdate();
  if(lvl&&bike){
    const fx0=bike.b.x, fy0=bike.b.y; const lx=fx0+Math.max(-3,Math.min(3,bike.b.vx*.28)), ly=fy0+.7+Math.max(-2.5,Math.min(2,bike.b.vy*.15));
    const k=Math.min(1,dt*2.8); cam.x+=(lx-cam.x)*k; cam.y+=(ly-cam.y)*k*0.85; if(Math.abs(ly-cam.y)>12) cam.y+=(ly-cam.y)*Math.min(1,dt*3);
    camBaseY+=(cam.y-camBaseY)*Math.min(1,dt*0.35);
    const spd=Math.hypot(bike.b.vx,bike.b.vy), air=(bike.contact[0]<0.5&&bike.contact[1]<0.5)?1:0; const zt=0.86-Math.min(0.12,spd*0.008)-air*0.05-(bike.b.vy<-9?0.08:0); zoom+=(zt-zoom)*Math.min(1,dt*1.2); SC=SC0*zoom;
    shake*=Math.exp(-dt*7); const shx=(Math.random()-0.5)*shake, shy=(Math.random()-0.5)*shake; cam.x+=shx; cam.y+=shy;
    const zc=ZONES[zoneAt(bike.b.x)].theme; if(zc!==curZoneTheme){ curZoneTheme=zc; useTheme(zc); }
    drawBackground(tt); drawLife(tt);
    drawWorld(tt);
    const fx=lvl.flower[0], fy=lvl.flower[1]; bloom+=(1-bloom)*Math.min(1,dt*3);
    { const sx=W/2+(fx-cam.x)*SC, sy=Hh/2-(fy+1-cam.y)*SC; if(sx>-200&&sx<W+200&&sy>-SC*12&&sy<Hh+SC*12){ ctx.setTransform(DPR,0,0,DPR,0,0);
      const bw=SC*0.9*bloom; const lg=ctx.createLinearGradient(0,sy-SC*12,0,sy); lg.addColorStop(0,'rgba(255,250,210,0)'); lg.addColorStop(1,'rgba(255,250,210,'+(0.25*bloom)+')'); ctx.fillStyle=lg; ctx.fillRect(sx-bw/2,sy-SC*12,bw,SC*12);
      const r=SC*(0.9+0.06*Math.sin(tt*1.8))*bloom; const gr=ctx.createRadialGradient(sx,sy,2,sx,sy,r); gr.addColorStop(0,'rgba(255,250,200,.85)'); gr.addColorStop(1,'rgba(255,250,200,0)'); ctx.fillStyle=gr; ctx.fillRect(sx-r,sy-r,r*2,r*2);
      blit(SPR.flower,fx,fy,Math.sin(tt*2)*0.05,1+0.04*Math.sin(tt*4)); drawSummitFlag(tt); } }
    drawSigns();
    worldT();
    drawShadow(bike,1);
    drawBike(dt); drawParts(dt);
    ctx.globalAlpha=1;
    drawVignette();
    cam.x-=shx; cam.y-=shy;
    ctx.setTransform(1,0,0,1,0,0);
    $('timer').textContent=fmt(T); updHud();
  }
  requestAnimationFrame(frame);
}
resize();
analyzeZones();
(function(){ bike=SV.bike?Object.assign(newBike(0,0),SV.bike):newBike(CO.start[0],CO.start[1]); T=SV.T||0; cam.x=bike.b.x+3; cam.y=bike.b.y+1.2; camBaseY=cam.y; state='menu'; useTheme(ZONES[zoneAt(bike.b.x)].theme); updHud(true); buildMenu(); })();
requestAnimationFrame(frame);
window.__climb={get bike(){return bike;}, set bike(b){bike=b;}, get state(){return state;}, CO, get SV(){return SV;}, say, cam, heightOf, newBike, save, get T(){return T;}};
