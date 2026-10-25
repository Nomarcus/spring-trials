// Builder for "Flödet" - one long flow level in the main game's level format.
// Output: levels/flodet.json (paste into CAMPAIGN_LEVELS in game/index.html)
let pc; try{ pc=require('polygon-clipping'); }catch(e){ pc=require('/workspace/climb/node_modules/polygon-clipping'); }
const fs=require('fs'); const R=v=>Math.round(v*1000)/1000; const D2R=Math.PI/180;
let x=0,y=0; const base=[]; const solids=[], carves=[], apples=[], killers=[], secs=[];
function pt(nx,ny){ x=nx; y=ny; base.push([R(x),R(y)]); }
const flat=L=>pt(x+L,y);
function curve(L,dh,n){ n=n||Math.max(8,Math.ceil(Math.hypot(L,dh)/0.4)); const x0=x,y0=y; for(let i=1;i<=n;i++){ const u=i/n; pt(x0+L*u, y0+dh*(0.5-0.5*Math.cos(Math.PI*u))); } }
function waves(n,amp,w){ const x0=x,y0=y,m=n*16; for(let i=1;i<=m;i++){ const u=i/m; pt(x0+n*w*u, y0+amp*(0.5-0.5*Math.cos(2*Math.PI*n*u))); } }
function bowl(w,depth){ const x0=x,y0=y,m=Math.ceil(w/0.35); for(let i=1;i<=m;i++){ const u=i/m; pt(x0+w*u, y0-depth*Math.sin(Math.PI*u)); } }
function arcPts(cx,cy,r,a0,a1,n){ const p=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); } return p; }
function circle(cx,cy,r,n=64){ return arcPts(cx,cy,r,0,2*Math.PI*(n-1)/n,n-1); }
function sec(name,move){ secs.push({name,move,x0:R(x),y0:R(y),wp:[]}); }
function addStar(px,py){ apples.push([R(px),R(py)]); secs[secs.length-1].wp.push([R(px),R(py),apples.length-1]); }
function wp(px,py){ secs[secs.length-1].wp.push([R(px),R(py)]); }
function star(dx,dy){ addStar(x+dx,y+dy); }
function rect(x0,y0,x1,y1){ return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]; }
// stroke a centre polyline into a tube polygon of half-width hw
function tube(line,hw){ const L=[],Rr=[]; for(let i=0;i<line.length;i++){ const a=line[Math.max(0,i-1)], b=line[Math.min(line.length-1,i+1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy); dx/=l; dy/=l;
  L.push([line[i][0]-dy*hw,line[i][1]+dx*hw]); Rr.push([line[i][0]+dy*hw,line[i][1]-dx*hw]); } return L.concat(Rr.reverse()); }
function bez(P0,P1,P2,n=24){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n,s=1-t; o.push([s*s*P0[0]+2*s*t*P1[0]+t*t*P2[0], s*s*P0[1]+2*s*t*P1[1]+t*t*P2[1]]); } return o; }

// ============================ THE LEVEL ============================
const START=[2,40]; pt(-10,40); pt(0,40);
sec('Utförsstarten','Släpp bromsen: lång mjuk utförsbacke ger fart'); flat(8); curve(30,-16); star(-6,0.9);
sec('Pumpbanan','Pumpa: luta bakåt i svackan, framåt på krönet'); waves(4,1.4,7); star(-17.5,2.3); flat(4);
sec('Hoppet','Kicker över en dödsgrop – full gas'); { pt(x+3,y+0.6); pt(x+1.2,y+0.55); const gx=x; pt(x,y-5); flat(5.5); for(let k=0;k<5;k++) killers.push([R(gx+0.6+k*1.1),R(y+0.35)]); pt(x,y+5.6); star(-3.5,1.8); curve(9,-1.2); flat(3); }
// ---- loop room (dead end) + hole + chute: the turnaround ----
sec('Loopen','Kör runt loopen (stjärnan sitter i taket), vänd, släpp dig ner i hålet');
{ const yF=y, x0=x; const r=2.35; const cx=x0+16, cy=yF+r-0.05; const low=yF-8;
  flat(1); pt(x0+1,low); pt(x0+21.5,low); // ground under the block (block solid covers it)
  solids.push(rect(x0+1,low-0.01,x0+19,yF+r*2+5));
  carves.push(rect(x0-1,yF,cx-0.5,yF+2.7)); carves.push(circle(cx,cy,r,72));
  const hx=x0+6.0, hw=2.9; carves.push(rect(hx,yF-0.6,hx+hw,yF+0.2));
  const ch=bez([hx+hw/2,yF-0.2],[hx+hw/2+1.5,low+1.4],[x0+24,low+1.45],30); carves.push(tube(ch,1.45));
  addStar(cx,cy+r-0.75); wp(hx+hw/2,yF+1.0); wp(hx+hw/2+1,yF-3); addStar(x0+16,low+0.9);
  x=x0+21.5; y=low; }
sec('Skålen','Fart ner i skålen, ta dig upp på den högre kanten'); flat(5); curve(7,-4.5); curve(9,8.5); star(-1,1.2); flat(4);
sec('Berg-och-dalbanan','Stora gungor: släpp gasen på krönen så du inte flyger'); curve(10,-4); curve(10,4); star(-1,0.9); curve(9,-3.5); curve(9,3.5); flat(4);
sec('Trappsteget','Broms-sving: lyft framhjulet och dra upp dig på kanten'); pt(x,y+1.25); flat(5); star(-2,0.9); flat(2);
sec('Tunneln','Trång tunnel med vågigt golv och lågt tak – håll huvudet nere');
{ const x0=x,y0=y; waves(3,0.7,6); const ceil=[]; for(let i=0;i<=72;i++){ const u=i/72; const xx=x0+18*u; const g=y0+0.7*(0.5-0.5*Math.cos(2*Math.PI*3*u)); ceil.push([xx-0, g+2.55-0.35*Math.sin(Math.PI*3*u)**2]); }
  const top=y0+9; solids.push([[x0-0.5,top],...ceil.map(p=>[R(p[0]),R(p[1])]),[x0+18.5,top]].concat([[x0+18.5,top]]));
  star(-9,0.9); flat(3); }
sec('Taklisterna','Trappa uppåt under överhäng – wheelie in under taket'); for(let k=0;k<3;k++){ pt(x,y+0.75); flat(4.2); solids.push([[x+0.6,y+2.45],[x+4.6,y+2.45],[x+4.6,y+3.4],[x+0.9,y+3.4]]); } star(-2,0.9); flat(4);
sec('Svingen','Hög kant: bromsa med framhjulet mot kanten och sving upp'); flat(3); pt(x,y+1.6); flat(4); star(-2,0.9); flat(3);
sec('Avstampet','Brant ramp, flyg över dödsgropen upp på platån'); curve(8,-1.5); curve(7,3.2); { const gx=x; pt(x,y-5); flat(6); for(let k=0;k<5;k++) killers.push([R(gx+0.7+k*1.2),R(y+0.35)]); pt(x,y+5+1.0); star(-4.5,1.8); flat(18); }
sec('Schaktet','Släpp dig ner, vänd under hyllan, släpp igen, vänd igen');
{ const x0=x,yT=y; flat(2); const y1=yT-4.2, y2=yT-8.4; // drop 1 into a pit; go LEFT under the plateau (carved), drop 2, go RIGHT
  pt(x,y2); pt(x0+30,y2);
  solids.push(rect(x0-16,y2-0.01,x0+30,yT)); // fill under plateau, then carve galleries
  carves.push(rect(x0+2,y1,x0+9,yT+0.5)); // pit 1 (open to sky)
  carves.push(rect(x0-14,y1,x0+9,y1+2.9)); // gallery 1 going left
  carves.push(rect(x0-14,y2,x0-9,y1)); // drop 2
  carves.push(rect(x0-14,y2,x0+30,y2+3.0)); // gallery 2 going right
  addStar(x0+5,y1+0.9); addStar(x0-11.5,y1+0.9); addStar(x0+10,y2+0.9);
  x=x0+30; y=y2; }
sec('Målrakan','Flyt ut ur berget, en sista våg till blomman'); waves(2,1.0,7); flat(10);
const flower=[R(x-4),R(y)]; flat(6);
// ============================ ASSEMBLE ============================
const BOT=Math.min(...base.map(p=>p[1]))-12, TOP=Math.max(...base.map(p=>p[1]))+30;
const ground=[[base[0][0],BOT]].concat(base).concat([[base[base.length-1][0],BOT]]);
let U=pc.union([ground],...solids.map(p=>[p])); if(carves.length) U=pc.difference(U,...carves.map(p=>[p]));
const x0b=base[0][0], x1b=base[base.length-1][0];
const box=[[x0b,TOP],[x1b,TOP],[x1b,BOT+0.5],[x0b,BOT+0.5]];
const rings=[{pts:box}]; let np=0;
for(const poly of U) for(const ring of poly){ const o=[]; for(const p of ring.slice(0,-1)){ const q=o[o.length-1]; if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>0.02) o.push([R(p[0]),R(p[1])]); } rings.push({pts:o}); np+=o.length; }
const level={name:'Flödet',theme:'sunset',hint:'En lång flytande bana: pumpa, loopa, vänd och klättra. Stjärnan i loopens tak kräver fart – vänd sedan och släpp dig ner i hålet.',
  rings,apples,killers,flower,start:START,startDir:1,noDeco:false,medal:[90,140],difficulty:'Svår',campaignId:'flow-v1-flodet'};
fs.mkdirSync(__dirname+'/../../levels',{recursive:true});
fs.writeFileSync(__dirname+'/../../levels/flodet.json',JSON.stringify(level));
fs.writeFileSync(__dirname+'/sections.json',JSON.stringify(secs,null,1));
console.log('rings',rings.length,'pts',np,'len',x1b-x0b,'stars',apples.length,'flower',flower);
