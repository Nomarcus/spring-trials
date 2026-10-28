// ================= TOPPLISTA OCH COMMUNITY-BANOR =================
// Topplista per bana (namn + tid) och banor som spelare delar med alla.
// Sparas i Supabase när ONLINE är ifyllt. Nyckeln är den publika "anon"-nyckeln: databasens regler (docs/supabase.sql)
// tillåter bara att läsa och lägga till – aldrig ändra eller ta bort. Huvudbanorna ligger i spelets kod och kan inte
// ändras härifrån. Utan ONLINE finns en lokal topplista per enhet och fliken Community syns inte.
const ONLINE={url:'',key:''};
const onl=()=>!!(ONLINE.url&&ONLINE.key);
async function sb(path,opt){ opt=opt||{};
  const r=await fetch(ONLINE.url.replace(/\/$/,'')+'/rest/v1/'+path,{method:opt.method||'GET',body:opt.body,
    headers:Object.assign({apikey:ONLINE.key,Authorization:'Bearer '+ONLINE.key,'Content-Type':'application/json'},opt.headers||{})});
  if(!r.ok) throw new Error('http '+r.status); const t=await r.text(); return t?JSON.parse(t):null; }
let lbName=''; try{ lbName=localStorage.getItem('fjadra.name')||''; }catch(e){}

// ---------- topplista ----------
function lbLocal(id){ return (edGet('fjadra.top',{})[id]||[]).slice(0,10); }
function lbLocalAdd(id,name,t){ const all=edGet('fjadra.top',{}), l=all[id]||[]; l.push({name,time:+t.toFixed(2)}); l.sort((a,b)=>a.time-b.time); all[id]=l.slice(0,10); edPut('fjadra.top',all); }
const lbOnline=id=>onl()&&!String(id).startsWith('mine-');   // egna osparade banor finns bara på enheten
async function lbGet(id){ if(lbOnline(id)){ try{ return await sb('scores?select=name,time&level_id=eq.'+encodeURIComponent(id)+'&order=time.asc&limit=10'); }catch(e){} } return lbLocal(id); }
async function lbAdd(id,name,t){ lbLocalAdd(id,name,t); if(lbOnline(id)) await sb('scores',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({level_id:id,name,time:+t.toFixed(2)})}); }
let lbCtx=null;
function lbRender(list,hiT){ const box=$('lbList'); box.innerHTML='';
  if(!list.length){ box.textContent='No times yet – be the first!'; return; }
  list.slice(0,5).forEach((e,i)=>{ const row=document.createElement('div'); row.className='lbr'+(hiT!=null&&Math.abs(e.time-hiT)<0.006?' me':'');
    const a=document.createElement('span'), b=document.createElement('span'); a.textContent=(i+1)+'. '+String(e.name).slice(0,16); b.textContent=fmt(+e.time); row.append(a,b); box.appendChild(row); }); }
// visas i slutrutan efter mål; är tiden bland de 10 bästa kan man skriva in sitt namn
async function lbShow(l,t){ if(!l){ lbCtx=null; $('lbBox').style.display='none'; return; }
  lbCtx={id:l.id,t,saved:false}; $('lbBox').style.display=''; $('lbForm').style.display='none';
  $('lbTitle').textContent=lbOnline(l.id)?'Leaderboard':'Leaderboard (this device)'; $('lbList').textContent='Loading …';
  const list=await lbGet(l.id); if(!lbCtx||lbCtx.id!==l.id) return; lbRender(list);
  if(list.length<10||t<list[list.length-1].time){ $('lbName').value=lbName; $('lbForm').style.display='flex'; } }
async function lbSave(){ if(!lbCtx||lbCtx.saved) return; const n=$('lbName').value.trim().replace(/\s+/g,' ').slice(0,16); if(!n) return toast('Write your name first',1800);
  lbName=n; try{ localStorage.setItem('fjadra.name',n); }catch(e){} lbCtx.saved=true; $('lbForm').style.display='none'; const c=lbCtx;
  try{ await lbAdd(c.id,n,c.t); toast('Saved to the leaderboard!',2000); }catch(e){ toast('Could not reach the online leaderboard – saved on this device',2800); }
  if(lbCtx===c) lbRender(await lbGet(c.id),c.t); }
$('lbSave').onclick=lbSave; $('lbName').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); lbSave(); } });

// ---------- community-banor ----------
let commState='idle';   // idle | loading | ok | error
async function commLoad(force){ if(!onl()||commState==='loading'||(commState==='ok'&&!force)) return; commState='loading'; buildMenu();
  try{ const rows=await sb('levels?select=id,name,author,doc&order=created_at.desc&limit=40');
    for(let i=LEVELS.length-1;i>=0;i--) if(LEVELS[i].pack==='community'&&LEVELS[i]!==lvl) LEVELS.splice(i,1);
    for(const r of rows||[]){ try{ const L=levelFromDoc(Object.assign({},r.doc,{id:'c-'+r.id,name:String(r.name).slice(0,40)}),{pack:'community',medal:null}); L.author=String(r.author||'').slice(0,16); LEVELS.push(L); }catch(e){} }
    commState='ok'; }catch(e){ commState='error'; }
  if(state==='menu') buildMenu(); }
async function commShare(){ if(!onl()) return toast('Sharing is not set up yet',2200); if(ed.dirty) return toast('Save the level first',2000);
  let who=lbName; if(!who){ who=(prompt('Your name (shown with the level):','')||'').trim().slice(0,16); if(!who) return; lbName=who; try{ localStorage.setItem('fjadra.name',who); }catch(e){} }
  const c=edClean(ed.doc); toast('Sharing …',1500);
  try{ await sb('levels',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({name:c.name,author:who,doc:c})}); commState='idle'; toast('Shared! Everyone can now play it under Community.',3000); }
  catch(e){ toast('Could not share the level right now – try again later',2800); } }
$('edShareB').onclick=()=>{ edMoreDone(); commShare(); };
