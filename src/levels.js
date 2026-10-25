// ===== Levels v3: pussel / trials =====
function sample(f,x0,x1,st=0.5){ const p=[]; for(let x=x0;x<=x1+1e-9;x+=st){ p.push([+x.toFixed(3),+f(x).toFixed(3)]); } return p; }
function arc(cx,cy,r,a0,a1,n){ const p=[]; for(let i=0;i<=n;i++){ const a=(a0+(a1-a0)*i/n)*Math.PI/180; p.push([+(cx+r*Math.cos(a)).toFixed(3),+(cy+r*Math.sin(a)).toFixed(3)]); } return p; }
function rect(x0,y0,x1,y1,style){ return {pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],style}; }
function crate(x,y,s){ s=s||0.9; return rect(x-s/2,y,x+s/2,y+s,'crate'); }
function log(x,y,r){ const p=[]; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; p.push([+(x+Math.cos(a)*r).toFixed(3),+(y+r+Math.sin(a)*r).toFixed(3)]); } return {pts:p,style:'log'}; }
function pillar(x0,x1,h){ return rect(x0,0,x1,h,'stone'); }
function blob(cx,cy,w,h,seed){ const p=[]; const n=14; let s=seed||1; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  p.push([cx-w/2,cy]); for(let i=1;i<n;i++){ const t=i/n; const x=cx-w/2+t*w; const y=cy-h*Math.sin(Math.PI*t)*(0.75+0.3*rnd())-0.15; p.push([+x.toFixed(3),+y.toFixed(3)]); }
  p.push([cx+w/2,cy]); p.push([cx+w/2-0.15,cy+0.25]); p.push([cx-w/2+0.15,cy+0.25]); return {pts:p}; }
function cr(ctrl,st){ const out=[]; for(let i=0;i<ctrl.length-1;i++){ const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)]; const n=Math.max(1,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/(st||0.5)));
  for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t; const f=(a,b,c,d)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); out.push([+f(p0[0],p1[0],p2[0],p3[0]).toFixed(3),+f(p0[1],p1[1],p2[1],p3[1]).toFixed(3)]); } } out.push(ctrl[ctrl.length-1]); return out; }
const sm=(e0,e1,x)=>{ const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0))); return t*t*(3-2*t); };
const TOP=40;
const LV=[];
// 1 Första stegen — a low log, a gentle wide dip and a small crate
LV.push(()=>{ const f=x=> x<12?0 : x<24? -0.45*Math.sin(Math.PI*(x-12)/12) : x<30?0 : x<38? 0.8*Math.sin(Math.PI*(x-30)/8) : 0;
  return {name:'Första stegen', theme:'meadow', hint:'Luta bakåt (↺) för att lyfta framhjulet över stocken och lådan.',
  stuck:'Fastnat? Håll GAS och tryck på ↺ en kort stund – då lyfter framhjulet över stocken.',
  rings:[{pts:[[-4,TOP],[-4,0],...sample(f,0,46),[46,TOP]]}, log(7,0,0.2), crate(27,0,0.55)],
  apples:[[18,0.3],[27,1.3],[34,1.55]], killers:[], flower:[42,0], start:[2,0]}; });
// 2 Lådorna — lådtrappa och nedfart
LV.push(()=>({name:'Lådorna', theme:'meadow', hint:'Klättra lådtrappan steg för steg. Bromsa ner på andra sidan.',
  rings:[{pts:[[-4,TOP],[-4,0],[36,0],[36,TOP]]},
    rect(8,0,10.4,0.7,'crate'), rect(10.4,0,12.8,1.3,'crate'), rect(12.8,0,15.2,1.9,'crate'), rect(15.2,0,18.4,1.9,'crate'), rect(18.4,0,20.4,1.1,'crate'), crate(25,0,0.8)],
  apples:[[16.8,2.65],[11.6,2.05],[25,1.55]], killers:[], flower:[31,0], start:[3,0]}));
// 3 Vändplatsen — två återvändsgränder
LV.push(()=>({name:'Vändplatsen', theme:'sunset', hint:'Varje hylla är en återvändsgränd. Vänd med pilknappen och kör tillbaka.',
  rings:[{pts:[[-22,TOP],[-22,3],[-13,3],[-5,0],[6,0],[12,2.6],[19,2.6],[19,TOP]]}],
  apples:[[17.5,3.35],[3,0.75],[-15,3.75]], killers:[], flower:[-19.5,3], start:[0,0]}));
// 4 Trappan
LV.push(()=>{ const pts=[[-4,TOP],[-4,0],[8,0]]; let x=8,y=0; const apples=[];
  for(let i=0;i<5;i++){ x+=0.4; y+=0.55; pts.push([x,y]); x+=3.2; pts.push([x,y]); if(i===1||i===3) apples.push([x-1.6,y+0.75]); }
  pts.push([x+4,y]); apples.push([x+3,y+0.75]); pts.push([x+14,0]); pts.push([x+24,0]); pts.push([x+24,TOP]);
  return {name:'Trappan', theme:'sunset', hint:'Luta bakåt vid varje kant så framhjulet hakar i, sen fram.', rings:[{pts}], apples, killers:[], flower:[x+19,0], start:[3,0]}; });
// 5 Hakarna
LV.push(()=>({name:'Hakarna', theme:'meadow', hint:'Kör mot kanten och lyft framhjulet. Hjulen greppar och drar upp dig.',
  rings:[{pts:[[-4,TOP],[-4,0],[8,0],[8,0.9],[16,0.9],[16,2.0],[24,2.0],[24,3.3],[34,3.3],[34,2.0],[44,2.0],[44,3.0],[46,3.0],[46,2.0],[56,2.0],[56,TOP]]}],
  apples:[[12,1.65],[29,4.05],[45,3.75]], killers:[], flower:[52,2.0], start:[3,0]}));
// 6 Svävande öar
LV.push(()=>{ const v=x=>-3*Math.sin(Math.PI*(x-46)/20);
  return {name:'Svävande öar', theme:'meadow', hint:'Ta sats i rampen och landa på öarna. Missar du finns marken under.',
    rings:[{pts:[[-4,TOP],[-4,0],[10,0],[18,2.6],[19,2.9],[20.5,-1.5],[24,-1.5],[25.5,2.4],...sample(x=>2.4-2.4*(x-26)/10,26,36,1),[40,0],[45,2.2],[45.3,2.2],[45.8,0],...sample(v,46,66,0.5),[80,0],[80,TOP]]},
      blob(51.5,3.4,5,1.4,3), blob(60,2.6,4,1.2,7)],
    apples:[[22.5,4.3],[51.5,4.15],[60,3.35],[56,-2.25]], killers:[], flower:[74,0], start:[3,0]}; });
// Volten — air time and rotation
LV.push(()=>({name:'Volten', theme:'sunset', hint:'Full fart upp för rampen. Volta i luften så du landar på hjulen. Hamnar du i gropen – börja om.',
  rings:[{pts:[[-4,TOP],[-4,0],[8,0],...arc(8,6,6,-90,-50,8).slice(1),[14.6,3.7],[14.8,3.7],[14.8,0],[21,0],[21,3.5],[24,3.4],[40,0],[52,0],[52,TOP]]}],
  apples:[[18.5,5.6],[23,4.2],[31,2.66]], killers:[], flower:[46,0], start:[1,0]}));
// 7 Bron
LV.push(()=>({name:'Bron', theme:'meadow', hint:'Släpp dig ner genom hålet i bron. Kroppen glider genom tunna balkar – bara hjul och huvud krockar.',
  rings:[{pts:[[-4,TOP],[-4,0],[14,0],[14.5,-1],[16,-6],[30,-6],[40,0],[52,0],[52,TOP]]},
    {pts:[[14,0],[21,0],[21,-0.28],[14,-0.28]],style:'steel'}, {pts:[[25,0],[34,0],[34,-0.28],[25,-0.28]],style:'steel'}, rect(19.5,-3.2,24.5,-2.95,'wood')],
  apples:[[23,0.75],[22,-2.2],[20,-5.25]], killers:[], flower:[46,0], start:[3,0]}));
// 8 Grottan
LV.push(()=>{ const f=x=>sm(4,10,x)*(1-sm(52,58,x))*(1.1*Math.sin((x-4)/5)+0.7*Math.sin((x-4)/2.3));
  const cf=x=>f(x)+3.7+0.6*Math.sin(x/3.7+1);
  return {name:'Grottan', theme:'cave', hint:'Lågt i tak. Ta det lugnt – huvudet får inte nudda något.',
    rings:[{pts:[...sample(f,-4,64),...sample(cf,-4,64).reverse()]}], apples:[[18,f(18)+0.75],[33,f(33)+0.75],[47,f(47)+0.75]],
    killers:[], flower:[60,f(60)], start:[0,0]}; });
// 9 Pelarna
LV.push(()=>({name:'Pelarna', theme:'sunset', hint:'Små hopp från pelare till pelare. Bromsa och balansera innan varje hopp.',
  rings:[{pts:[[-4,TOP],[-4,0],[4,0],[10,2.2],[10,0],[40,0],[40,TOP]]},
    pillar(10,11.6,2.2), pillar(12.6,14.2,2.2), pillar(15.6,17.2,2.2), pillar(19,20.6,2.2), pillar(21.8,23.4,2.2)],
  apples:[[16.4,2.95],[22.6,2.95],[30,0.75]], killers:[], flower:[35,0], start:[1,0]}));
// 10 Skålen
LV.push(()=>{ const R=6.2, cx=14, cy=6.2;
  return {name:'Skålen', theme:'sunset', hint:'Pumpa fram och tillbaka. Vänd med pilknappen högt upp på kanten.',
    rings:[{pts:[[-4,TOP],[-4,cy],...arc(cx,cy,R,180,360,48),[36,cy],[36,TOP]]}],
    apples:[[cx-R*0.9*Math.cos(Math.PI/4),cy-R*0.9*Math.sin(Math.PI/4)],[cx+R*0.9*Math.cos(Math.PI/4),cy-R*0.9*Math.sin(Math.PI/4)],[2,cy+0.75]],
    killers:[], flower:[31,cy], start:[cx,0]}; });
// 11 Hinderbanan
LV.push(()=>({name:'Hinderbanan', theme:'sunset', hint:'Stockar, ramper och en plankö. Hoppa eller klättra – ta det i din egen takt.',
  rings:[{pts:[[-4,TOP],[-4,0],[9,0],[15,1.8],[15.4,1.8],[16,0],[28,0],[34,2.2],[34.4,2.2],[35,0],[41,0],[45,2.4],[45.3,2.4],[45.8,0],[62,0],[70,0],[70,TOP]]},
         {pts:[[47.5,3.2],[54,3.2],[54,3.8],[47.5,3.8]],style:'wood'}, log(19,0,0.36), log(38.2,0,0.42), log(58.5,0,0.34)],
  apples:[[18.5,3.4],[51,4.55],[60.5,0.75]], killers:[], flower:[65,0], start:[3,0]}));
// 12 Vinterberget
LV.push(()=>{ const f=x=> x<6?0 : x<70 ? 7*sm(6,40,x)-7*sm(42,70,x)+0.9*Math.sin(x/2.2)*sm(6,12,x)*(1-sm(64,70,x)) : 0;
  return {name:'Vinterberget', theme:'winter', hint:'Uppför i snön. Lagom gas och vikten framåt, annars välter du bakåt.',
    rings:[{pts:[[-4,TOP],[-4,0],...sample(f,0,86,0.5),[86,TOP]]}],
    apples:[[24,f(24)+0.75],[41,f(41)+0.75],[58,f(58)+0.75]], killers:[], flower:[80,0], start:[2,0]}; });
// 13 Klippan
LV.push(()=>({name:'Klippan', theme:'winter', hint:'Sista stjärnan ligger i gropen. Vänd och kör tillbaka till blomman.',
  rings:[{pts:[[-4,TOP],[-4,0],[6,0],[14,3],[18,3],[24,6.5],[27,6.5],[30,9],[40,9],[49.6,4.5],[54,4.5],[54,TOP]]}],
  apples:[[16,3.75],[35,9.75],[52.5,5.25]], killers:[], flower:[25.5,6.5], start:[2,0]}));
// Upp och ner — roomy gravity oval
LV.push(()=>{ const R=7, L0=-12, L1=30;
  return {name:'Upp och ner', theme:'cave', hint:'Blå stjärnor vänder tyngdkraften. Kör upp i kurvan, kör i taket och kom ner på andra sidan.',
    rings:[{pts:[[L0,0],[8,0],[8,0.6],[9.5,0.6],[9.5,0],[L1,0],...arc(L1,R,R,-90,90,36).slice(1,-1),[L1,2*R],[20,2*R],[20,2*R-0.7],[18.5,2*R-0.7],[18.5,2*R],[4,2*R],[4,2*R-0.6],[2,2*R-0.6],[2,2*R],[L0,2*R],...arc(L0,R,R,90,270,36).slice(1,-1)]}],
    apples:[[L1+R*Math.cos(-Math.PI/4)*0.88,R+R*Math.sin(-Math.PI/4)*0.88,'up'],[24,2*R-0.75],[11,2*R-0.75],[-5,2*R-0.75],[L0-R*Math.cos(Math.PI/4)*0.88,R+R*Math.sin(Math.PI/4)*0.88,'down']],
    killers:[], flower:[-6,0], start:[0,0]}; });
// Stockarna — bunny hop
LV.splice(2,0,()=>({name:'Stockarna', theme:'meadow', hint:'Bunny hop: luta bakåt en kort stund och kasta sen vikten framåt. Hoppa över gropar och stockar.',
  rings:[{pts:[[-4,TOP],[-4,0],[9,0],[9,-1.2],[10.4,-1.2],[10.4,0],[17,0],[17,-1.2],[18.5,-1.2],[18.5,0],[27,0],[27,-1.2],[28.7,-1.2],[28.7,0],[40,0],[40,TOP]]},
    log(13.5,0,0.42), log(23,0,0.38), log(32.5,0,0.45)],
  apples:[[13.5,1.75],[23,1.6],[32.5,1.85]], killers:[], flower:[37,0], start:[3,0]}));
// Hänget — hang from the rear wheel
LV.push(()=>({name:'Hänget', theme:'meadow', hint:'Kör sakta ut på balken. Bromsa när bakhjulet är vid kanten – då greppar det och du hänger. Släpp bromsen för att falla.',
  rings:[{pts:[[-4,TOP],[-4,0],[12,0],[12,-3.6],[34,-3.6],[44,0],[56,0],[56,TOP]]},
    {pts:[[12,0],[18,0],[18,-0.26],[12,-0.26]],style:'steel'}],
  apples:[[17.0,-1.6],[26,-2.85],[48,0.75]], killers:[], flower:[52,0], start:[3,0]}));
// Svävaren — fall up onto the underside of a long floating island and ride it upside down
LV.push(()=>{ const u=x=>7.2-0.35*Math.sin((x-12)/2.6)*(x>16&&x<52?1:0);
  const under=sample(u,10,58,0.5); const top=[[58.5,8.3],[57,9.6],[50,10.4],[30,10.6],[16,10.3],[11,9.5],[9.5,8.3]];
  return {name:'Svävaren', theme:'sunset', hint:'Kör in i den blå stjärnan under ön – du faller uppåt och vänds automatiskt. Kör upp och ner längs öns undersida.',
  rings:[{pts:[[-4,TOP],[-4,0],[70,0],[70,TOP]]}, {pts:[...under,...top]}],
  apples:[[15,0.75,'up'],[24,u(24)-0.75],[33,u(33)-0.75],[42,u(42)-0.75],[53,u(53)-0.75,'down']], killers:[], flower:[64,0], start:[2,0]}; });
// Balkarna — hop between thin beams over spikes
LV.push(()=>({name:'Balkarna', theme:'winter', hint:'Tunna balkar över en grop. Bunny hoppa från balk till balk – bromsa och ladda innan varje hopp.',
  rings:[{pts:[[-4,TOP],[-4,0],[8,0],[8,-3],[38,-3],[46,0],[56,0],[56,TOP]]},
    {pts:[[8,0],[12,0],[12,-0.26],[8,-0.26]],style:'steel'},
    {pts:[[13.3,0],[17.5,0],[17.5,-0.26],[13.3,-0.26]],style:'steel'},
    {pts:[[19.1,0],[23,0],[23,-0.26],[19.1,-0.26]],style:'steel'},
    {pts:[[24.9,0],[29,0],[29,-0.26],[24.9,-0.26]],style:'steel'},
    {pts:[[30.8,0],[38,0],[38,-0.26],[30.8,-0.26]],style:'steel'}],
  apples:[[12.65,1.0],[18.3,1.1],[24,1.1],[29.9,1.1]], killers:[], flower:[51,0], start:[2,0]}));
// Pumpbanan — pump the rollers for speed
LV.push(()=>{ const f=x=> x<6?0 : x<46? -0.55*Math.cos((x-6)*Math.PI*2/5)+0.55 : x<50? 0 : 0;
  return {name:'Pumpbanan', theme:'meadow', hint:'Pumpa: luta bakåt upp för varje puckel och kasta vikten fram på väg ner. Bygg fart utan gas!',
    rings:[{pts:[[-4,TOP],[-4,0],...sample(f,0,50,0.25),[56,0],[56,2.6],[56.4,2.6],[57,0],[64,0],[64,-2.5],[69,-2.5],[74,0],[86,0],[86,TOP]]}],
    apples:[[18.5,2.35],[33.5,2.45],[43.5,2.5],[60.5,2.9]], killers:[], flower:[80,0], start:[2,0]}; });
// Studsen — drop, squeeze the spring and brake to bounce
LV.push(()=>({name:'Studsen', theme:'sunset', hint:'Hoppa ner från klippan och tryck BROMS precis när fjädrarna är i botten – studsen tar dig upp på hyllan.',
  rings:[{pts:[[-4,TOP],[-4,4],[6,4],[6,0],[14,0],[14,2.1],[22,2.1],[22,0.8],[30,0.8],[30,TOP]]}],
  apples:[[10,0.75],[18,2.85],[26,1.55]], killers:[], flower:[28,0.8], start:[2,4]}));
// Schaktet — zig-zag down a deep shaft
LV.push(()=>{ const W=13, D=3.4, N=5; const rings=[{pts:[[-6,TOP],[-6,0],[0,0],[0,-D*N-3],[W+10,-D*N-3],[W+10,-D*N],[W,-D*N],[W,TOP]]}];
  const apples=[];
  for(let k=1;k<N;k++){ const y=-D*k; if(k%2){ rings.push({pts:[[W-8.5,y],[W,y],[W,y-0.45],[W-8.5,y-0.45]]}); apples.push([W-0.9,y+0.75]); }
    else { rings.push({pts:[[0,y],[8.5,y],[8.5,y-0.45],[0,y-0.45]]}); apples.push([0.9,y+0.75]); } }
  return {name:'Schaktet', theme:'cave', hint:'Kör ner för schaktet hylla för hylla. Vänd på varje hylla – stjärnorna ligger inne vid väggen.',
    rings, apples, killers:[], flower:[W+7,-D*N-3], start:[-3,0]}; });
// Klätterväggen — hops and wheel hooks up a big wall
LV.push(()=>({name:'Klätterväggen', theme:'winter', hint:'Hoppa och haka i kanterna med hjulen. Är kanten för hög: bunny hop först, sen volt bakåt.',
  rings:[{pts:[[-4,TOP],[-4,0],[8,0],[8,1.0],[13,1.0],[13,2.2],[17,2.2],[17,0.8],[20,0.8],[20,2.4],[25,2.4],[25,3.7],[30,3.7],[30,5.0],[37,5.0],[37,3.4],[40,3.4],[40,TOP]]},
    log(15,2.2,0.32)],
  apples:[[10.5,1.75],[18.5,1.55],[27.5,4.45],[33,5.75]], killers:[], flower:[38.6,3.4], start:[3,0]}));
// Finalen — everything at once, lots of room
LV.push(()=>({name:'Finalen', theme:'sunset', hint:'Allt du lärt dig: studs, bunny hop, balk och volter. Ta det lugnt – det finns gott om plats.',
  rings:[{pts:[[-4,TOP],[-4,0],[10,0],[16,2.4],[16.4,2.4],[17,0],[24,0],[24,-3.5],[41,-3.5],[48,0.8],[52,0.8],[52,2.0],[60,2.0],[66,0],[90,0],[90,TOP]]},
    {pts:[[30,0.6],[38,0.6],[38,0.34],[30,0.34]],style:'steel'}, log(56,2.0,0.36)],
  apples:[[20,0.75],[37.2,-1.0],[41,-2.75],[49,1.55],[56,3.55],[75,0.75]], killers:[], flower:[85,0], start:[2,0]}));
// Spegeln — flip gravity mid-air, ride the ceiling, flip back
LV.push(()=>({name:'Spegeln', theme:'cave', hint:'Blå stjärna = tyngdkraften vänder. Volta i luften så du landar på hjulen i taket – och tillbaka igen.',
  rings:[{pts:[[-6,0],[70,0],[70,9],[-6,9]]}],
  apples:[[12,0.75,'up'],[24,8.25],[36,8.25],[48,8.25,'down'],[58,0.75]], killers:[], flower:[66,0], start:[2,0]}));
// Trapphoppet — bunny hop up a staircase of thin beams
LV.push(()=>({name:'Trapphoppet', theme:'winter', hint:'Hoppa uppåt från balk till balk. Ramlar du ner kör du bara tillbaka uppför backen och försöker igen.',
  rings:[{pts:[[-4,TOP],[-4,0],[4,0],[10,-3],[34,-3],[35.5,3.5],[50,3.5],[50,TOP]]},
    {pts:[[8.5,0],[12,0],[12,-0.26],[8.5,-0.26]],style:'steel'}, {pts:[[13.5,0.7],[17.5,0.7],[17.5,0.44],[13.5,0.44]],style:'steel'},
    {pts:[[19,1.4],[23,1.4],[23,1.14],[19,1.14]],style:'steel'}, {pts:[[24.5,2.1],[28.5,2.1],[28.5,1.84],[24.5,1.84]],style:'steel'},
    {pts:[[30,2.8],[34.2,2.8],[34.2,2.54],[30,2.54]],style:'steel'}],
  apples:[[12.75,1.6],[18.25,2.3],[23.75,3.0],[29.25,3.7],[40,4.25]], killers:[], flower:[46,3.5], start:[1,0]}));
// Flowbanan — rollers, a double and a tabletop: pump and float
LV.push(()=>{ const r=x=>0.7*(0.5-0.5*Math.cos((x-6)*Math.PI*2/6));
  return {name:'Flowbanan', theme:'meadow', hint:'Pumpa över vågorna, flyg över dubbelhoppet och landa mjukt på bordet. Lugnt och flytande.',
  rings:[{pts:[[-4,TOP],[-4,0],[6,0],...sample(r,6.25,30,0.25),[34,0],[38,1.8],[38.3,0.8],[43.7,0.8],[44,2.0],[50,0],[54,0],[60,2.4],[66,2.4],[72,0],[90,0],[90,TOP]]}],
  apples:[[21,2.0],[41,3.6],[63,3.4],[80,0.75]], killers:[], flower:[86,0], start:[2,0]}; });

// ================= BANPAKET 2 =================
const LV2=[];
// 01 Dalens rytm — three soft valleys, tighter and tighter, then a wide climb
LV2.push(()=>{ const s=cr([[-4,3],[3,3],[5,2.8],[11,0],[17,2.2],[22.5,0.2],[27,2.0],[31,0.4],[35,1.2],[40,3.6],[44,5.4],[50,5.5]],0.4);
  return {id:'fjadra-pack2-01', name:'Dalens rytm', theme:'meadow', hint:'Känn hur fjädringen trycks ihop i dalarna och lättar på krönen. Pumpa i takt om du vill ha fart.',
    rings:[{pts:[[-4,TOP],...s,[50,TOP]]}], apples:[[11,0.85],[27,2.8],[40,4.4]], killers:[], flower:[47,5.5], start:[1,3]}; });
// 08 Gruvans andra våning — two tunnels on top of each other, joined by a wide ramp and a turning chamber
LV2.push(()=>({id:'fjadra-pack2-08', name:'Gruvans andra våning', theme:'cave', hint:'Övre tunneln ut åt höger, bred nedfart, vänd i kammaren och ta nedre tunneln tillbaka till blomman.',
  rings:[{pts:[[-2,6],[33,6],[35,5.92],[37,5.5],[39,4.82],[50,0],[50,-0.6],[37,5.0],[36,5.0],[36,-0.8],[-6,-0.8],[-6,1.6],[-12,1.6],[-12,-4],[58,-4],[58,9.4],[-2,9.4]]}],
  apples:[[12,6.8],[28,6.8],[30,-3.2],[10,-3.2]], killers:[], flower:[-9.5,-4], start:[1,6]}));
// 11 Stenhyllan — an overhanging rock shelf: hang from the lip by the rear wheel to reach the star underneath
LV2.push(()=>({id:'fjadra-pack2-11', name:'Stenhyllan', theme:'sunset', hint:'Kör sakta mot kanten. BROMSA så fort framhjulet är ute över kanten (den gula zonen) och håll inne – bakhjulet hakar i kanten och du hänger. Ta stjärnan, släpp sen.',
  rings:[{pts:[[-14,TOP],[-14,4.5],[9.3,4.5],[9.55,4.62],[9.95,4.64],[10.05,4.55],[10.05,4.08],[8.5,3.98],[6.5,3.9],[5.2,3.6],[5,3.1],[5,2.3],[8,1.6],[11,0.75],[14,0.1],[15,0],[22,0],[29,4.5],[38,4.5],[38,TOP]]}],
  apples:[[4,5.25],[8.2,2.85],[25.5,2.95]], killers:[], flower:[34,4.5], start:[-10,4.5], marks:[[7.6,9.6]]}));
// ================= BANPAKET 3 (30 banor, lätt → svår) =================
const LV3=[];
// 01 Första turen — gas: platt start, mjuka gupp, stjärnor på marken
LV3.push(()=>{ const bump=(x,c,h,w)=>Math.abs(x-c)<w? h*0.5*(1+Math.cos(Math.PI*(x-c)/w)) : 0;
  const f=x=>bump(x,20,0.6,3)+bump(x,26,0.6,3)+bump(x,52,0.7,4.5)+bump(x,61,0.7,4.5)+bump(x,70,0.7,4.5);
  return {id:'fjadra-p3-01', name:'Första turen', theme:'meadow', hint:'Håll in GAS. Känn hur fjädrarna trycks ihop i guppen.',
    rings:[{pts:[[-4,TOP],[-4,0],...sample(f,0,96,0.25),[96,TOP]]}],
    apples:[[36,0.75],[42,0.75],[80,0.75]], killers:[], flower:[90,0], start:[2,0]}; });
// 02 Mjuka backen — broms: uppför, brant nedför med en liten kant, stjärna i dalen, blomma på platån
LV3.push(()=>{ const s=cr([[-4,0],[4,0],[10,0.9],[15,2.6],[19,3.7],[22,4.1],[25,4.15],[28,3.8],[31,2.7],[34,1.0],[37,-0.8],[40,-1.9],[42.5,-2.2],[45,-2.0],[47.5,-1.0],[50,0.5],[53,1.4],[56,1.6],[70,1.6]],0.25);
  return {id:'fjadra-p3-02', name:'Mjuka backen', theme:'meadow', hint:'Uppför med gas. På toppen: BROMSA och luta BAKÅT (↺) samtidigt hela vägen ner i dalen.',
    stuck:'Tvärbromsar du utan att luta bakåt slår cykeln runt framåt. Håll ↺ medan du bromsar.',
    rings:[{pts:[[-4,TOP],...s,[70,TOP]]}],
    apples:[[42.5,-1.45]], killers:[], flower:[65,1.6], start:[1,0]}; });
// 03 Lutbacken — luta: två branta ramper med spetsiga krön, den andra brantare
LV3.push(()=>{ const s=cr([[-4,0],[2,0],[5,0.35],[8,1.6],[10,3.0],[11.4,4.0],[12.4,4.4],[13.2,4.45],[14,4.3],[16,3.5],[20,2.2],[25,1.2],[29,0.9],
      [32,1.4],[34,2.6],[35.4,4.0],[36.5,5.3],[37.4,6.1],[38.2,6.45],[39,6.45],[39.8,6.2],[42,5.2],[47,3.4],[53,1.8],[60,0.7],[66,0.3],[74,0.3]],0.25);
  return {id:'fjadra-p3-03', name:'Lutbacken', theme:'sunset', hint:'Branta ramper. Luta FRAMÅT (↻) medan du gasar uppför, annars tippar du bakåt.',
    stuck:'Tippar du bakåt? Håll ↻ hela vägen upp och gasa lugnare.',
    rings:[{pts:[[-4,TOP],...s,[74,TOP]]}],
    apples:[[13.2,5.2],[38.6,7.2]], killers:[], flower:[69,0.3], start:[1,0]}; });
// 04 Bakhjulstrappan — wheelie: tre kanter, varje lite högre
LV3.push(()=>{ const pts=[[-4,TOP],[-4,0]]; let y=0; const steps=[[10,0.6],[19,0.8],[28,1.0]];
  for(const [x,h] of steps){ pts.push([x-0.12,y]); const y1=y+h; pts.push([x,y+0.06],[x,y1-0.1],[x+0.04,y1-0.03],[x+0.12,y1]); y=y1; }
  pts.push([44,y],[44,TOP]);
  return {id:'fjadra-p3-04', name:'Bakhjulstrappan', theme:'meadow', hint:'Luta BAKÅT (↺) precis före varje kant så framhjulet lyfter upp på steget. Sen fram igen.',
    stuck:'Kör sakta mot kanten, tryck ↺ – framhjulet upp – och gasa. Bakhjulet klättrar efter.',
    rings:[{pts}], apples:[[23.5,2.15],[34,3.15]], killers:[], flower:[40,2.4], start:[3,0]}; });
// 05 Pumpdalen — pumpa: fyra vågor, stjärnor på topparna
LV3.push(()=>{ const H=[1.0,1.15,1.3,1.45], W=7, X0=8;
  const f=x=>{ const k=Math.floor((x-X0)/W); return k>=0&&k<4? H[k]*0.5*(1-Math.cos(2*Math.PI*(x-X0)/W)) : 0; };
  return {id:'fjadra-p3-05', name:'Pumpdalen', theme:'sunset', hint:'Försök utan gas: luta BAKÅT uppför vågen och kasta dig FRAMÅT nerför. Då pumpar du fart.',
    stuck:'Luta ↺ när du kör uppför, ↻ när det lutar nedåt. Gas får du använda om du vill.',
    rings:[{pts:[[-4,TOP],[-4,0],...sample(f,0,58,0.25),[58,TOP]]}],
    apples:[[X0+W*1.5,H[1]+0.75],[X0+W*3.5,H[3]+0.75]], killers:[], flower:[52,0], start:[2,0]}; });
const MEDALS3={'fjadra-p3-01':[16,26],'fjadra-p3-02':[14,24],'fjadra-p3-03':[24,38],'fjadra-p3-04':[12,20],'fjadra-p3-05':[13,22]};
const MEDALS={'Första stegen':[10,16],'Lådorna':[16,26],'Vändplatsen':[12,20],'Trappan':[11,17],'Hakarna':[16,26],'Svävande öar':[16,25],'Bron':[14,22],'Grottan':[10,16],'Pelarna':[14,24],'Skålen':[25,45],'Hinderbanan':[13,20],'Vinterberget':[12,19],'Klippan':[16,26],'Upp och ner':[14,24],'Hänget':[16,28],'Svävaren':[14,24],'Balkarna':[14,24],'Pumpbanan':[14,22],'Studsen':[12,20],'Schaktet':[22,34],'Klätterväggen':[18,30],'Finalen':[28,45],'Spegeln':[16,26],'Trapphoppet':[16,26],'Flowbanan':[14,22],'Stockarna':[9,15],'Volten':[9,15]};
const MEDALS2={'fjadra-pack2-01':[12,20],'fjadra-pack2-08':[26,40],'fjadra-pack2-11':[14,24]};
const slug=n=>n.toLowerCase().replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function makeLevels(){
  const L1=LV.map(f=>f()), L2=LV2.map(f=>f()), L3=LV3.map(f=>f());
  for(const l of L1){ l.pack=1; l.id='p1-'+slug(l.name); l.medal=MEDALS[l.name]||[15,25]; }
  for(const l of L2){ l.pack=2; l.medal=MEDALS2[l.id]||[20,35]; }
  for(const l of L3){ l.pack=3; l.medal=MEDALS3[l.id]||[20,35]; }
  const L=L1.concat(L2,L3);
  for(const l of L){ l.segs=buildSegs(l.rings);
    let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9; for(const r of l.rings) for(const p of r.pts){ mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mny=Math.min(mny,p[1]);mxy=Math.max(mxy,p[1]); }
    l.bounds=[mnx,mny,mxx,mxy];
    // "view" bounds for the overview map: ignore the invisible sky lid at TOP
    let vx0=1e9,vx1=-1e9,vy0=1e9,vy1=-1e9; const add=(x,y)=>{ vx0=Math.min(vx0,x); vx1=Math.max(vx1,x); vy0=Math.min(vy0,y); vy1=Math.max(vy1,y); };
    for(const r of l.rings) for(const p of r.pts) if(p[1]<TOP-1) add(p[0],p[1]); for(const a of l.apples) add(a[0],a[1]+1); add(l.flower[0],l.flower[1]+2); add(l.start[0],l.start[1]+2.5);
    l.vbounds=[vx0,vy0,vx1,vy1]; }
  return L;
}
if(typeof module!=='undefined'){ const C=require('./core.js'); global.buildSegs=C.buildSegs; module.exports={makeLevels}; }
