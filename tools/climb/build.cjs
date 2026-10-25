// Course builder for "Fjädra: Uppförsbacken"
const pc=require('polygon-clipping'); const fs=require('fs');
const D2R=Math.PI/180;
let x=0,y=0; const route=[[-40,0],[0,0]]; // ground route (base)
const base=[[-40,60],[-40,0],[0,0]];      // base polyline (lowest solid surface), starts with left wall
const solids=[], carves=[], after=[]; const cps=[]; const signs=[]; const zones=[]; const loops=[]; const holes=[];
let mode='ground', abyss=null;
const R=v=>Math.round(v*1000)/1000;
function pt(nx,ny){ x=nx; y=ny; if(mode==='ground'){ base.push([R(x),R(y)]); } else abyss.top.push([R(x),R(y)]); }
function cp(label,opt={}){ cps.push(Object.assign({x:R(x-4),y:R(y),label},opt)); }
function sign(txt){ signs.push({x:R(x+1),y:R(y),t:txt}); }
function zone(name,theme){ zones.push({name,theme,x0:R(x-0.5)}); }
const flat=L=>pt(x+L,y);
function slope(L,deg){ const n=Math.max(1,Math.ceil(L/2)); const t=Math.tan(deg*D2R); // eased ends
  const y0=y,x0=x; for(let i=1;i<=n;i++){ const u=i/n; pt(x0+L*u, y0+L*t*u); } }
function curve(L,dh,n=10){ const x0=x,y0=y; for(let i=1;i<=n;i++){ const u=i/n; pt(x0+L*u, y0+dh*(0.5-0.5*Math.cos(Math.PI*u))); } } // S-curve
function steps(n,h,d){ for(let i=0;i<n;i++){ pt(x,y+h); flat(d); } }
function bumps(n,amp,w){ const x0=x,y0=y; const m=n*8; for(let i=1;i<=m;i++){ const u=i/m; pt(x0+n*w*u, y0+amp*(0.5-0.5*Math.cos(2*Math.PI*n*u))); } }
function halfpipe(w,depth){ const x0=x,y0=y,m=18; for(let i=1;i<=m;i++){ const u=i/m; pt(x0+w*u, y0-depth*Math.sin(Math.PI*u)); } }
function kicker(){ const x0=x,y0=y; pt(x0+1.2,y0+0.08); pt(x0+2.5,y0+0.3); }
function groove(w,depth){ pt(x,y-depth); flat(w); pt(x,y+depth); } // shallow pit you can climb out of
function circle(cx,cy,r,n=20){ const p=[]; for(let i=0;i<n;i++){ const a=i/n*2*Math.PI; p.push([R(cx+r*Math.cos(a)),R(cy+r*Math.sin(a))]); } return p; }
function boulders(list){ // list of [dx,r]; boulders sit on the route
  let m=0; for(const [dx,r,dy=0] of list){ solids.push(circle(x+dx,y+r*0.55+dy,r,18)); m=Math.max(m,dx+r+1); } flat(m); }
function overhang(dx,w,clear,th=1.6){ const yy=y+clear; solids.push([[x+dx,yy],[x+dx+w,yy],[x+dx+w-0.6,yy+th],[x+dx+0.5,yy+th+0.4]]); }
function loopRoom(r){ // circular room you can drive through (and loop around inside, with speed)
  const cx=x+r+3, cy=y+r; flat(2*r+6);
  solids.push([[cx-r-2.5,y+2.9],[cx+r+2.5,y+2.9],[cx+r+2.5,cy+r+2],[cx-r-2.5,cy+r+2]]);
  carves.push(circle(cx,cy,r,36)); loops.push({x:R(cx),y:R(cy),r}); }
// --- tunnel/fall hole: from a hole in the approach down to the abyss floor (built when abyss starts) ---
function holeHere(gap=4.2){ kicker(); const hx=x+0.3, hy=y; holes.push({x:hx,y:hy}); pt(x+gap,y-0.25); return holes[holes.length-1]; }
// --- abyss: cliff, deep floor draining left into a tunnel to the hole; floating islands carry the route ---
function abyssBegin(depth,hole){ flat(5); kicker(); abyss={x0:x,y0:y,floor:y-depth,hole,top:[],islands:[]};
  base.push([R(x),R(y-depth)]); mode='abyss'; }
function island(gap,dh,th,fn){ // jump gap, then build island top with fn
  if(abyss.cur){ autoKick(); abyss.islands.push({pts:abyss.cur,th:abyss.curTh}); }
  x+=gap; y+=dh; abyss.cur=[[R(x),R(y)]]; abyss.curTh=th; const save=abyss.top; abyss.top=abyss.cur; fn&&fn(); abyss.top=save; }
function autoKick(){ const c=abyss.cur; const p=c[c.length-1]; c.push([R(p[0]+6),p[1]]); c.push([R(p[0]+7.2),R(p[1]+0.08)]); c.push([R(p[0]+8.5),R(p[1]+0.3)]); x=p[0]+8.5; y=p[1]+0.3; }
function abyssEnd(gap,dh){ if(abyss.cur){ autoKick(); } if(abyss.cur) abyss.islands.push({pts:abyss.cur,th:abyss.curTh}); abyss.cur=null;
  x+=gap; y+=dh; const fl=abyss.floor; const fx=x;
  // floor drains left (rises 2.5 deg to the right)
  const rise=(fx-abyss.x0)*Math.tan(2.5*D2R); base.push([R(abyss.x0),R(fl)]); base.push([R(fx),R(fl+rise)]); base.push([R(fx),R(y)]);
  for(const is of abyss.islands){ const p=is.pts; const top=p.map(q=>[q[0],q[1]]); const bot=p.slice().reverse().map(q=>[q[0],q[1]-is.th]);
    // taper the underside a little for a floating-rock look
    if(bot.length>=2){ bot[0][0]-=0; } solids.push(top.concat(bot));
    for(const q of p) if(q[1]-is.th<fl+rise+4.5 && q[0]>abyss.x0+4) throw new Error('island too low over floor at x='+q[0]); }
  // tunnel from hole to abyss floor at cliff bottom
  const h=abyss.hole; if(h){ const P0=[h.x-0.3,h.y+1.2], P1=[h.x+6,h.y-3.0], P2=[abyss.x0+3,fl+1.45];
    const line=[P0,P1,P2]; const HH=1.45; const top=line.map(p=>[p[0],p[1]+HH]), bot=line.map(p=>[p[0],p[1]-HH]).reverse();
    carves.push(top.concat(bot)); abyss.tunnel=line; }
  abysses.push({x0:abyss.x0,x1:fx,floor:fl,lip:abyss.y0,hole:h}); mode='ground'; abyss=null; }
const abysses=[];
function islandFlat(L){ const c=abyss.top; const p=c[c.length-1]; c.push([R(p[0]+L),p[1]]); x=p[0]+L; }
function iSlope(L,deg){ const c=abyss.top; const p=c[c.length-1]; const n=Math.max(1,Math.ceil(L/2)),t=Math.tan(deg*D2R); for(let i=1;i<=n;i++) c.push([R(p[0]+L*i/n),R(p[1]+L*t*i/n)]); x=p[0]+L; y=p[1]+L*t; }
function iSteps(n,h,d){ const c=abyss.top; for(let i=0;i<n;i++){ const p=c[c.length-1]; c.push([p[0],R(p[1]+h)]); c.push([R(p[0]+d),R(p[1]+h)]); } const p=c[c.length-1]; x=p[0]; y=p[1]; }
function iKick(){ const c=abyss.top; const p=c[c.length-1]; c.push([R(p[0]+1.2),R(p[1]+0.08)]); c.push([R(p[0]+2.5),R(p[1]+0.3)]); x=p[0]+2.5; y=p[1]+0.3; }
function iBumps(n,amp,w){ const c=abyss.top; const p=c[c.length-1]; const m=n*8; for(let i=1;i<=m;i++){ const u=i/m; c.push([R(p[0]+n*w*u),R(p[1]+amp*(0.5-0.5*Math.cos(2*Math.PI*n*u)))]); } x=p[0]+n*w; y=p[1]; }
function iPipe(w,depth){ const c=abyss.top; const p=c[c.length-1]; const m=16; for(let i=1;i<=m;i++){ const u=i/m; c.push([R(p[0]+w*u),R(p[1]-depth*Math.sin(Math.PI*u))]); } x=p[0]+w; y=p[1]; }
function iCP(label){ const c=abyss.top; const p=c[c.length-1]; cps.push({x:R(p[0]-4),y:p[1],label}); }
function iSign(t){ const c=abyss.top; const p=c[c.length-1]; signs.push({x:R(p[0]+1),y:p[1],t}); }

// ======================= THE COURSE =======================
zone('Ängen','meadow'); cp('start');
sign('Uppförsbacken. Det går bara uppåt. Oftast.');
flat(14); slope(10,8); flat(6); cp('a1'); sign('Luta bakåt i backen, framåt på krönet.');
curve(14,3); flat(5); steps(2,0.4,3); flat(5); cp('a2'); bumps(3,0.6,5); flat(4); slope(12,15); flat(5); cp('a3');
sign('Ingen dör här. Man ramlar bara. Långt.');
groove(3,0.8); flat(6); steps(3,0.6,3.5); flat(5); cp('a4'); halfpipe(12,2.2); flat(5); boulders([[3,0.6]]); flat(6); cp('a5');
slope(14,20); flat(6); steps(2,0.6,3.5); flat(5); cp('a6'); bumps(2,0.9,6); flat(10); cp('a7');
const h1=holeHere(4.0); flat(6); cp('a8'); sign('Hoppa över luckan. Den leder neråt.'); slope(14,18); flat(8); curve(10,2.5); flat(6); cp('a9');
sign('Första stupet. Titta inte ner.');
abyssBegin(14,h1);
 island(2.6,0,1.4,()=>{ islandFlat(9); iCP('a10'); });
 island(2.6,0.3,1.2,()=>{ islandFlat(8); iSlope(6,12); islandFlat(5); iCP('a11'); });
 island(2.8,0,1.2,()=>{ islandFlat(6); iBumps(2,0.5,4); islandFlat(5); iCP('a12'); });
 island(2.8,0.3,1.2,()=>{ islandFlat(9); iSteps(2,0.5,3); islandFlat(5); iCP('a13'); });
abyssEnd(3.5,0);
zone('Skogen','forest'); flat(10); cp('b1'); sign('Skogen. Här växer både träd och självförtroende.');
slope(14,24); flat(5); overhang(1,6,3.0); flat(8); cp('b2'); loopRoom(3.4); flat(6); cp('b3');
sign('Cirkeln är valfri. Varvet är ärans.');
steps(3,0.8,3); flat(5); cp('b4'); halfpipe(14,3); slope(10,22); flat(5); cp('b5'); boulders([[2,0.7],[4.2,0.55]]); flat(7); cp('b6');
bumps(3,0.8,5); flat(5); cp('b7'); const h2=holeHere(4.2); flat(8); cp('b8'); slope(16,25); flat(5); steps(2,0.9,3); flat(6); cp('b9'); slope(12,20); flat(8); cp('b10');
sign('Det som går upp måste komma ner. Försök att vara undantaget.');
abyssBegin(22,h2);
 island(2.8,0.2,1.0,()=>{ islandFlat(7); iCP('b11'); iSlope(8,15); islandFlat(5); iCP('b12'); });
 island(3.0,0.3,0.6,()=>{ islandFlat(10); iCP('b13'); });            // beam
 island(3.0,0.3,0.6,()=>{ islandFlat(6); iBumps(2,0.6,4); islandFlat(5); iCP('b14'); });
 island(3.5,0,1.2,()=>{ islandFlat(6); iSteps(3,0.7,3); islandFlat(5); iCP('b15'); iPipe(10,2); islandFlat(5); iCP('b16'); });
 island(3.0,0.4,0.5,()=>{ islandFlat(8); iCP('b17'); });
abyssEnd(3.5,0);
zone('Klipporna','rocks'); flat(8); cp('c1'); sign('Klipporna. Stenar har tålamod. Har du?');
boulders([[3,0.8],[5.2,0.6],[7,0.9]]); flat(10); cp('c2'); slope(14,26); flat(5); cp('c3'); steps(4,0.9,2.6); flat(5); cp('c4');
overhang(2,8,2.9); halfpipe(16,3.5); flat(5); cp('c5'); boulders([[2.5,1.0],[4.6,0.7],[6.8,1.0],[9,0.6]]); flat(13); cp('c6');
const h3=holeHere(4.2); flat(8); cp('c7'); slope(18,30); flat(5); steps(3,1.0,3); flat(5); cp('c8'); curve(12,4); flat(6); cp('c9'); slope(10,26); flat(8); cp('c10');
sign('Härifrån är det långt ner. Det är meningen.');
abyssBegin(32,h3);
 island(3.0,0.3,1.0,()=>{ islandFlat(6); iSlope(8,22); islandFlat(5); iCP('c11'); });
 island(4.2,0,0.5,()=>{ islandFlat(9); iCP('c12'); });
 island(3.0,0.4,0.9,()=>{ islandFlat(4); iSteps(3,0.9,2.8); islandFlat(5); iCP('c13'); });
 island(4.2,-0.4,0.5,()=>{ islandFlat(7); iCP('c14'); iBumps(3,0.8,4); islandFlat(5); iCP('c15'); });
 island(3.0,0.4,1.0,()=>{ islandFlat(4); iSlope(10,28); islandFlat(5); iCP('c16'); });
 island(4.2,0,0.45,()=>{ islandFlat(10); iCP('c17'); });
abyssEnd(3.0,0.3);
zone('Snöfältet','winter'); flat(8); cp('d1'); sign('Snöfältet. Kallt, halt och helt ditt fel.');
slope(16,28); flat(4); boulders([[2,0.75]]); flat(5); cp('d2'); loopRoom(3.8); flat(5); cp('d3'); steps(4,0.85,3); flat(5); cp('d4');
bumps(4,1.1,4.5); flat(5); cp('d5'); const h4=holeHere(4.2); flat(7); cp('d6'); slope(20,28); flat(5); steps(3,0.7,3); flat(9); overhang(-8.5,6,3.0); cp('d7');
curve(12,5); flat(6); cp('d8'); slope(12,30); flat(8); cp('d9'); sign('Djupt andetag. Lång väg ner.');
abyssBegin(42,h4);
 island(3.0,0.4,0.45,()=>{ islandFlat(8); iCP('d10'); });
 island(4.2,0,0.45,()=>{ islandFlat(7); iCP('d11'); iSteps(2,1.0,2.6); islandFlat(5); iCP('d12'); });
 island(4.2,-0.3,0.45,()=>{ islandFlat(6); iCP('d13'); iBumps(3,1.0,4); islandFlat(5); iCP('d14'); });
 island(3.0,0.5,0.8,()=>{ islandFlat(3); iSlope(10,30); islandFlat(5); iCP('d15'); });
 island(4.2,0,0.4,()=>{ islandFlat(6); iCP('d16'); iPipe(9,2.2); islandFlat(5); iCP('d17'); });
 island(4.2,0,0.4,()=>{ islandFlat(7); iCP('d18'); });
abyssEnd(3.0,0.4);
zone('Molnen','sky'); flat(8); cp('e1'); sign('Molnen. Härifrån ser man allt man tappat.');
slope(14,32); flat(4); steps(3,1.0,2.6); flat(5); cp('e2'); boulders([[2,1.0],[4.2,0.8],[6.6,1.1]]); flat(10); cp('e3');
const h5=holeHere(4.2); flat(7); cp('e4'); slope(22,32); flat(5); cp('e5'); steps(5,0.85,3); flat(5); cp('e6'); curve(14,6); flat(8); cp('e7');
sign('Snart. Kanske. Om allt går bra.');
abyssBegin(52,h5);
 island(3.0,0.4,0.4,()=>{ islandFlat(6); iCP('e8'); });
 island(4.2,0,0.4,()=>{ islandFlat(5); iCP('e9'); iSteps(3,1.0,2.4); islandFlat(5); iCP('e10'); });
 island(4.2,-0.4,0.4,()=>{ islandFlat(6); iCP('e11'); iBumps(3,1.1,3.6); islandFlat(5); iCP('e12'); });
 island(4.2,-0.5,0.4,()=>{ islandFlat(5); iCP('e13'); iSlope(10,32); islandFlat(5); iCP('e14'); });
 island(4.2,0,0.35,()=>{ islandFlat(6); iCP('e15'); iPipe(8,2.4); islandFlat(5); iCP('e16'); });
 island(4.2,-0.3,0.35,()=>{ islandFlat(5); iCP('e17'); iSteps(2,1.0,2.4); islandFlat(5); iCP('e18'); });
 island(4.2,0,0.35,()=>{ islandFlat(7); iCP('e19'); });
abyssEnd(3.0,0.4);
zone('Toppen','summit'); flat(8); cp('f1'); sign('Toppen syns. Den syns alltid. Det är det som är grejen.');
slope(18,28); flat(5); steps(4,0.85,3); flat(5); cp('f2'); bumps(3,1.2,4); flat(5); cp('f3'); slope(16,33); flat(5); cp('f4');
boulders([[2,1.1],[4.4,0.9]]); flat(9); cp('f5'); steps(5,0.85,3); flat(5); cp('f6'); slope(14,30); flat(6); cp('f7');
const summit={x:R(x+8),y:R(y)}; flat(22); sign('');
// right wall
base.push([R(x),R(y+60)]);
// ======================= ASSEMBLE =======================
const BOT=-260; const ground=[[base[0][0],BOT]].concat(base).concat([[base[base.length-1][0],BOT]]);
let U=pc.union([ground],...solids.map(p=>[p]));
if(carves.length) U=pc.difference(U,...carves.map(p=>[p]));
const rings=[]; for(const poly of U) for(const ring of poly){ const r=ring.slice(0,-1); // drop near-duplicates
  const o=[]; for(const p of r){ const q=o[o.length-1]; if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>0.02) o.push([R(p[0]),R(p[1])]); } rings.push(o); }
let np=0; for(const r of rings) np+=r.length;
const xs=rings.flat().map(p=>p[0]), ys=rings.flat().map(p=>p[1]);
const out={rings,cps,signs,zones,loops,abysses,summit,start:[2,0],bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
fs.writeFileSync(__dirname+'/course.json',JSON.stringify(out));
console.log('rings',rings.length,'points',np,'summit',summit,'cps',cps.length,'bounds',out.bounds.map(Math.round));
