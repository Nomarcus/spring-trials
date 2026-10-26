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
var P28={cx:92,h:22};
var P30={c1:76,c2:134,f2:-15,h:24,k2:2.5};
var P23={cx:76,cy:6.5,h:19,s:12.6};
var P19={c1:48,c2:94,f2:-7};
var P13={cx:66,cy:6.5,R:4.6,kx:63.5,kr:3.5,ka:60};
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
// träplankor längs en cirkelbåge (loopar, rör): små fyrkanter så att ritningen följer bågen. Huvudet går igenom trä.
function woodArc(cx,cy,r,a0,a1,th,n){ const out=[]; for(let i=0;i<n;i++){ const u0=(a0+(a1-a0)*i/n)*Math.PI/180, u1=(a0+(a1-a0)*(i+1)/n)*Math.PI/180;
  const P=(u,rr)=>[+(cx+rr*Math.cos(u)).toFixed(3),+(cy+rr*Math.sin(u)).toFixed(3)];
  out.push({pts:[P(u0,r),P(u1,r),P(u1,r+th),P(u0,r+th)],style:'wood'}); } return out; }
// 06 Lilla gapet — hopp: ramp, ett gap med en stjärna i luften, landningsbacke
LV3.push(()=>{ const s=cr([[-4,0],[10,0],[13,0.1],[15.5,0.5],[17.5,1.2],[19,1.75],[19.6,1.85],[20.4,1.4],[21.3,0.1],[22.2,-0.8],[23,-1.0],[23.8,-0.8],[24.7,0.2],[25.5,1.3],[26.1,1.8],[27.2,1.9],[30,1.45],[34,0.7],[38,0.15],[42,0],[54,0]],0.25);
  return {id:'fjadra-p3-06', name:'Lilla gapet', theme:'meadow', hint:'Gasa mot rampen och hoppa över gapet. Stjärnan hänger mitt i luften.',
    stuck:'Hamnade du i gropen? Tryck OMSTART och ta mer fart.',
    rings:[{pts:[[-4,TOP],...s,[54,TOP]]}], apples:[[22.9,3.5]], killers:[], flower:[48,0], start:[2,0]}; });
// 07 Halfpipe-gungan — halfpipe: gunga fram och tillbaka och flyg upp över kanterna
LV3.push(()=>{ const L=[[-4,TOP],[-4,0],[4.6,0],[4.95,-0.12],...arc(10,0,5,180,270,24).slice(1),[14,-5],...arc(14,0,5,270,343,18).slice(1),[19.0,-1.2],[19.3,-0.25],[19.6,0],[24,0],
      ...cr([[24,0],[27,-0.4],[31,-2.0],[35,-3.2],[38,-3.5],[48,-3.5]],0.3).slice(1),[48,TOP]];
  return {id:'fjadra-p3-07', name:'Halfpipe-gungan', theme:'sunset', hint:'Släpp dig ner i röret och gunga upp på båda sidor. Stjärnorna hänger ovanför kanterna.',
    stuck:'Gunga: gasa nerför, släpp upp mot kanten, vänd med pilknappen i luften eller på väggen.',
    rings:[{pts:L}], apples:[[5.55,1.3],[5.55,2.6],[19.4,1.6],[20.6,2.8]], killers:[], flower:[44,-3.5], start:[1,0]}; });
// 08 Första loopen — lång nedförsbacke för fart, ett hopp in i loopen, stjärnan högst upp
LV3.push(()=>{ const lp=loopParts(54,6.5,4,51.5,3.5,60,0);
  const s=cr([[-4,12],[3,12],[6,11.6],[12,8.5],[20,3.6],[27,0.6],[32,0],[lp.k0-2,0]],0.3);
  return {id:'fjadra-p3-08', name:'Första loopen', theme:'meadow', hint:'Full gas nerför backen, ta hoppet och låt farten bära dig runt loopen.',
    stuck:'För lite fart? Gasa hela vägen från toppen.',
    rings:[{pts:[[-4,TOP],...s,...lp.ground,[90,0],[90,TOP]]}, ...lp.rings],
    apples:[lp.top], killers:[], flower:[84,0], start:[1,12]}; });
// 09 Grytet — ner i ett hål, kort tunnel med lågt tak, stjärna i en nisch, upp igen
LV3.push(()=>{ const F=-4.5, C=F+2.8;
  const ground=[[-4,TOP],[-4,0],[10,0],...cr([[10,0],[11.5,-0.3],[13.5,-1.3],[16,-3.0],[18,-4.1],[20,F],[21.5,F]],0.25).slice(1),[41,F],...cr([[41,F],[44,-3.7],[48,-1.7],[51,-0.2],[53,0.4],[55,0.5]],0.3).slice(1),[65,0.5],[65,TOP]];
  const roof={pts:[[21.2,0],[41.5,0],[41.6,-0.5],[40.6,C+0.15],[39.6,C],[34.4,C],[33.6,C+0.6],[33,-0.7],[27.6,-0.7],[27,C+0.6],[26.2,C],[22.6,C],[21.2,C+0.4],[20.5,-0.9],[20.6,-0.3]]};
  return {id:'fjadra-p3-09', name:'Grytet', theme:'meadow', hint:'Ner i hålet och in i tunneln. Lågt i tak – ta det lugnt så huvudet inte slår i.',
    stuck:'Stjärnan sitter i nischen i taket. Lyft framhjulet en aning under den.',
    rings:[{pts:ground}, roof], apples:[[30.3,F+2.55]], killers:[], flower:[60,0.5], start:[2,0]}; });
// 10 Skorstenen — smalt lodrätt schakt. Blå stjärna vänder tyngden: fall uppåt, kör på avsatsernas undersidor i sicksack, ut genom toppen
LV3.push(()=>{ const W=6.4, rings=[];
  const ledge=(left,y)=>{ const x0=left?0:2.4, x1=left?4.0:W; return {pts:[[x0,y],[x1,y],[x1+(left?0.25:0),y-0.25],[x1,y-0.55],[x0,y-0.55]].map(p=>[+p[0].toFixed(2),p[1]])}; };
  for(let k=1;k<=4;k++) rings.push(ledge(k%2===1,3.2*k));
  const top=16;
  rings.unshift({pts:[[-8,TOP],[-8,top+4],[0,top+4],[0,0],[W,0],[W,13.3],[W+0.2,13.1],[24,13.1],[24,TOP]]});
  rings.push({pts:[[-0.5,top],[W+1.2,top],[W+1.2,top+0.7],[-0.5,top+0.7]]});
  return {id:'fjadra-p3-10', name:'Skorstenen', theme:'cave', hint:'Blå stjärna vänder tyngden – du faller uppåt genom skorstenen. Kör längs undersidorna, ut genom öppningen i toppen och ta den blå stjärnan där.',
    stuck:'Kör till kanten av avsatsen så faller du upp till nästa. Vänd med pilknappen om du landar åt fel håll.',
    rings, apples:[[3.0,0.75,'up'],[W-0.7,2*3.2-0.55-0.75],[0.7,3*3.2-0.55-0.75],[W+0.9,14.6,'down']], killers:[], flower:[19,13.1], start:[1.2,0]}; });
// 11 Fram och tillbaka — ner för två trappsteg ut till väggen, vänd, och klättra tillbaka till blomman bakom starten
LV3.push(()=>{ const bump=(x,c,h,w)=>Math.abs(x-c)<w? h*0.5*(1+Math.cos(Math.PI*(x-c)/w)) : 0;
  const pts=[[-16,TOP],[-16,1.6],[11.85,1.6],[11.96,1.56],[12,1.48],[12,0.8],[29.85,0.8],[29.96,0.76],[30,0.68],[30,0],
    ...sample(x=>bump(x,42,0.6,3)+bump(x,52,0.7,3)+bump(x,60,0.5,2.5),34,66,0.25),[72,0],[72,TOP]];
  return {id:'fjadra-p3-11', name:'Fram och tillbaka', theme:'winter', hint:'Stjärnorna sitter vid väggen långt bort. Vänd där (pilknappen) och kör hem till blomman bakom starten.',
    stuck:'På vägen hem: luta bakåt (↺) vid trappstegen så framhjulet kommer upp.',
    rings:[{pts}], apples:[[71.2,0.75],[71.3,2.15]], killers:[], flower:[-12,1.6], start:[-6,1.6]}; });
// 12 Vågor och gap — pumpa över vågorna, hoppa två gap via en svävande ö, sista rampen upp till blomman
LV3.push(()=>{ const w=x=>(x>6&&x<27)? 0.45*(1-Math.cos(2*Math.PI*(x-6)/7)) : 0;
  const ground=[[-4,TOP],[-4,0],...sample(w,0,30,0.25),...cr([[30,0],[32,0.1],[34,0.55],[35.2,0.95],[35.5,0.9]],0.25).slice(1),[35.6,0.4],[35.7,-4.5],[52.4,-4.5],[52.5,-0.3],[52.6,-0.05],[52.9,0.05],[58,0.05],
    ...cr([[58,0.05],[60,0.4],[62.5,1.4],[64.5,2.4],[66.5,2.9],[68,3.0],[78,3.0]],0.3).slice(1),[78,TOP]];
  const island={pts:[[39.6,0.25],[40,0.32],[45,0.32],[45.6,0.45],[46,0.7],[46.1,0.4],[45.6,-0.6],[44.5,-1.6],[43,-2.2],[41.6,-1.8],[40.4,-0.9],[39.7,-0.2]]};
  return {id:'fjadra-p3-12', name:'Vågor och gap', theme:'sunset', hint:'Pumpa fart över vågorna och hoppa till ön, sen över det stora gapet. Landa och kör uppför till blomman.',
    stuck:'Ner i gropen? Tryck OMSTART. Pumpa mer på vågorna för att hinna över.',
    rings:[{pts:ground}, island], apples:[[37.6,2.0],[42.6,1.2],[49.3,2.6]], killers:[], flower:[73,3.0], start:[2,0]}; });
// 13 Berg-och-dalbanan — flow: vågor nerför, en loop, ett hopp och ett rör på slutet
LV3.push(()=>{ const lp=loopParts(P13.cx,P13.cy,P13.R,P13.kx,P13.kr,P13.ka,0); const E=lp.end;
  const top=cr([[-4,19.5],[2,19.5],[5,19.1],[10,15.6],[14,13.8],[17,13.9],[20,12.8],[25,9.6],[29,8.2],[32,8.2],[36,6.4],[42,2.5],[47,0.4],[51,0],[lp.k0-2,0]],0.3);
  const after=cr([[E,0],[E+8,0],[E+12,0.3],[E+15,1.2],[E+17,1.9],[E+17.6,2.0],[E+18.1,1.6],[E+18.3,-3],[E+25.4,-3],[E+25.5,1.4],[E+26,1.75],[E+27,1.7],[E+31,0.6],[E+35,0],[E+38,0],
    [E+41,-1.2],[E+44,-2.6],[E+47,-3.0],[E+50,-2.6],[E+53,-1.2],[E+56,0],[E+66,0]],0.3);
  return {id:'fjadra-p3-13', name:'Berg-och-dalbanan', theme:'meadow', hint:'Flow! Låt cykeln rulla genom vågorna, gasa in i loopen, hoppa gapet och susa genom röret.',
    stuck:'Mer fart in i loopen: håll gasen nere genom vågorna.',
    rings:[{pts:[[-4,TOP],...top,...lp.ground,...after.slice(1),[E+66,TOP]]}, ...lp.rings],
    apples:[[14.5,14.5],[30.5,8.9],lp.top,[E+21.8,3.7],[E+47,-2.25]], killers:[], flower:[E+61,0], start:[1,19.5]}; });
// 14 Upp och ner — kvartsrör upp mot ett klippvalv, blå stjärna vänder tyngden, kör i taket, blå stjärna tillbaka
LV3.push(()=>{ const qp=[[-4,TOP],[-4,0],[8,0],...arc(8,5,5,270,360,20).slice(1),[13,5.15],[13.25,5.3],[13.5,5.15],[13.5,0],[54,0],[54,TOP]];
  const und=cr([[9,7.6],[14,7.5],[18,7.2],[23,6.6],[27,5.6],[30,5.3],[33,5.6],[37,6.6],[41,7.2],[45,7.5],[48,7.6]],0.3);
  const roof={pts:[...und,[48.6,8.2],[48,9.6],[40,10.6],[28,10.9],[16,10.6],[9.4,9.6],[8.6,8.2]]};
  return {id:'fjadra-p3-14', name:'Upp och ner', theme:'sunset', hint:'Full fart uppför kvartsröret. Den blå stjärnan vänder tyngden – kör i taket och ta den blå stjärnan i slutet för att komma ner.',
    stuck:'Ta mer fart mot kvartsröret så du flyger upp till den blå stjärnan.',
    rings:[{pts:qp}, roof], apples:[[12.6,6.4,'up'],[30,4.55],[44.5,6.85,'down']], killers:[], flower:[50,0], start:[1,0]}; });
// 15 Bromssvingen — kör upp för en hög, lodrät kant och svinga upp cykeln över krönet
LV3.push(()=>{ const H=5.0, s=cr([[-4,0],[14,0],[17,0.25],[19.5,1.0],[21.3,2.2],[22.5,3.5],[23.1,4.4],[23.3,H-0.25]],0.25);
  return {id:'fjadra-p3-15', name:'Bromssvingen', theme:'winter', hint:'Fart mot väggen. Uppe vid krönet: BROMSA så framhjulet greppar kanten och luta FRAMÅT (↻) – cykeln svingar upp.',
    stuck:'Når du inte upp? Längre ansats och full gas hela vägen upp för väggen.',
    rings:[{pts:[[-4,TOP],...s,[23.32,H-0.08],[23.42,H],[23.6,H+0.05],[30,H+0.05],[30.15,H-0.05],[30.2,3.2],[48,3.2],[48,TOP]]}],
    apples:[[27,H+0.8]], killers:[], flower:[44,3.2], start:[1,0]}; });
// loop: man kör rakt in i loopens botten (den ligger strax under vägen, som en bro över ett dike), varvet runt,
// och efter varvet faller man ut genom öppningen nere till vänster, ner i diket som leder ut under loopen.
// Signaturen är kvar från den gamla hopp-loopen; bara cx och fy används. k0-2 = där vägen före loopen ska sluta.
function loopParts(cx,cy,R,kx,kr,ka,fy){ const lr=loopRide(cx,4.6,fy); return {k0:lr.lip+1.7,end:lr.end,ground:lr.ground,rings:lr.rings,top:lr.top}; }
// 16 Vändgrottan — grotta i fyra våningar: ner genom breda hål, vänd i återvändsgränderna och hämta stjärnorna bakom dig
LV3.push(()=>{ const D=4.2, Y=[3*D,2*D,D,0], sl=(x0,x1,y)=>({pts:[[x0,y],[x1,y],[x1,y-0.5],[x0,y-0.5]]});
  const air=[[-16,TOP],[-16,Y[0]],[0,Y[0]],[0,0],[41,0],...cr([[41,0],[43,-0.2],[45,-0.75],[47,-0.9],[50,-0.9]],0.25).slice(1),[50,Y[0]+3.3],[0.4,Y[0]+3.3],[0,Y[0]+3.7],[0,TOP]];
  return {id:'fjadra-p3-16', name:'Vändgrottan', theme:'cave', hint:'Ner genom grottan våning för våning. Stjärnorna ligger i återvändsgränderna – vänd (pilknappen) och kör tillbaka. Luta bakåt när du kör ner i ett hål.',
    stuck:'Återvändsgränd? Tryck VÄND. Kör ner i hålen med lite fart och luta bakåt så du landar på hjulen.',
    rings:[{pts:air}, sl(0,28,Y[0]), sl(34,50,Y[0]), sl(0,4,Y[1]), sl(10,50,Y[1]), {pts:[[16,Y[1]-0.5],[24,Y[1]-0.5],[23.6,Y[1]-0.85],[22,Y[1]-1.0],[18,Y[1]-1.0],[16.4,Y[1]-0.85]]}, sl(0,30,Y[2]), sl(36,50,Y[2])],
    apples:[[49.2,Y[1]+0.75],[0.8,Y[2]+0.75],[49.1,-0.15]], killers:[], flower:[2.5,0], start:[-10,Y[0]]}; });
// 17 Störtloppet — lång nedfart: branter, klippor och smala avsatser. Stjärnorna ligger där man landar – flyger du för fort missar du dem
LV3.push(()=>{ const s=cr([[-4,24],[5,24],[5.8,23.9],[6.6,23.3],[8.2,21.7],[9.2,21.25],[10,21.2],[14.6,21.2],[15.1,21.1],[15.3,20.8]],0.25);
  const s2=cr([[15.3,18.4],[16,18.42],[21,18.4],[21.8,18.1],[23.4,16.4],[24.4,15.65],[25.2,15.6],[28.6,15.6],[29.2,15.75],[29.5,15.85],[29.7,15.6]],0.25);
  const s3=cr([[29.8,12.8],[30.5,12.82],[36,12.8],[36.8,12.5],[39,11.2],[41.4,9.7],[42.4,9.32],[43.2,9.3],[48,9.3],[48.6,9.0],[50.2,7.0],[51.2,6.45],[52,6.4],[55.8,6.4],[56,6.2]],0.25);
  const s4=cr([[56.1,3.4],[56.8,3.42],[62,3.4],[62.8,3.1],[64.6,1.2],[65.8,0.2],[67,0],[84,0]],0.25);
  return {id:'fjadra-p3-17', name:'Störtloppet', theme:'winter', hint:'Hela vägen ner. Broms och luta bakåt i branterna – stjärnorna ligger precis där du landar på avsatserna.',
    stuck:'Missade du en stjärna? Den ligger nära där avsatsen börjar. Bromsa mer innan kanten.',
    rings:[{pts:[[-4,TOP],...s,[15.3,18.45],...s2.slice(1),[29.75,12.85],...s3.slice(1),[56.05,3.45],...s4.slice(1),[84,TOP]]}, log(18,18.4,0.3)],
    apples:[[11.2,21.95],[17,19.15],[26.2,16.35],[31.6,13.55],[44.4,10.05],[57.8,4.15]], killers:[], flower:[79,0], start:[2,24]}; });
// 18 Gömda fickor — nischer under klippkanterna och ett hål rakt genom en vägg som man måste hoppa in i
LV3.push(()=>{ const g=[[-4,TOP],[-4,0],[8,0],...cr([[8,0],[10,0.3],[12,1.5],[13.5,2.6],[14.6,3.0],[15.5,3.0]],0.25).slice(1),[22,3.0],[22.05,2.9],[22.05,2.65],[18.6,2.65],[18.4,2.5],[18.4,0.1],[18.5,0],
    [34,0],...cr([[34,0],[36,0.4],[38,1.8],[39.6,3.4],[40.8,4.1],[41.6,4.2]],0.25).slice(1),[48,4.2],[48.2,4.1],[48.2,3.6],[44,3.6],[43.7,3.45],[43.6,1.05],[43.8,1.0],[48.2,1.0],[48.2,0],
    [58,0],...cr([[58,0],[60,0.15],[62,0.6],[63.2,1.1],[63.6,1.25]],0.2).slice(1),[63.8,1.0],[64,0],[67,0],[67,2.0],[73,2.0],[73.2,1.6],[73.6,0.2],[74,0],[88,0],[88,TOP]];
  const wall={pts:[[67,2.0+2.6],[73,2.0+2.6],[73,8.5],[72,9.2],[68,9.2],[67,8.5]]};
  return {id:'fjadra-p3-18', name:'Gömda fickor', theme:'sunset', hint:'Stjärnorna gömmer sig i fickor under klippkanterna. Kör över, vänd och kör in under. Sista: hoppa rakt in i hålet i väggen.',
    stuck:'Fickan sitter en meter upp? Luta bakåt (↺) precis före kanten. Hålet i väggen: full fart från rampen.',
    rings:[{pts:g}, wall], apples:[[19.3,0.75],[18,3.75],[45,1.75],[70,2.75]], killers:[], flower:[82,0], start:[2,0]}; });
// 19 Dubbelloopen — två loopar efter varandra med en ny nedförsbacke emellan, sen ett gap
LV3.push(()=>{ const A=loopParts(P19.c1,8+6.5,4.6,P19.c1-2.5,3.5,60,8), F=P19.f2, B=loopParts(P19.c2,F+6.5,4.6,P19.c2-2.5,3.5,60,F);
  const s=cr([[-4,22],[2,22],[5,21.6],[10,18.6],[17,13.2],[23,9.6],[28,8.2],[32,8],[A.k0-2,8]],0.3);
  const m=cr([[A.end,8],[A.end+5,8],[A.end+10,6.4],[A.end+18,F+(8-F)*0.45],[A.end+26,F+0.8],[A.end+31,F],[B.k0-2,F]],0.3);
  const e=cr([[B.end,F],[B.end+8,F],[B.end+12,F+0.4],[B.end+15,F+1.4],[B.end+16.6,F+2.05],[B.end+17,F+2.1],[B.end+17.3,F+1.7],[B.end+17.4,F-4],[B.end+23.6,F-4],[B.end+23.7,F+1.6],[B.end+24.2,F+1.95],[B.end+25.5,F+2],[B.end+30,F+0.8],[B.end+34,F],[B.end+46,F]],0.3);
  return {id:'fjadra-p3-19', name:'Dubbelloopen', theme:'meadow', hint:'Två loopar! Gasa hela vägen ner, genom första loopen, nerför igen och in i den andra. Sist ett gap.',
    stuck:'Ramlar du ur en loop? Mer fart – håll gasen nere i backarna.',
    rings:[{pts:[[-4,TOP],...s,...A.ground,...m.slice(1),...B.ground,...e.slice(1),[B.end+46,TOP]]}, ...A.rings, ...B.rings],
    apples:[A.top,[A.end+18,F+(8-F)*0.45+0.75],B.top,[B.end+20.5,F+4.6]], killers:[], flower:[B.end+41,F], start:[1,22]}; });
// 20 Labyrinten — tre våningar gångar: ner genom schakt, stjärnor i hörnen, och ut genom en skorsten i slutet (blå stjärnor)
LV3.push(()=>{ const sl=(x0,x1,y0,y1)=>({pts:[[x0,y1],[x1,y1],[x1,y0],[x0,y0]]});
  const air=[[-8,TOP],[-8,18],[0,18],[0,0],[24,0],...cr([[24,0],[25.5,-0.5],[27,-1.2],[28.5,-0.5],[30,0]],0.25).slice(1),[54,0],[54,14.5],[66,14.5],[66,TOP]];
  const slabs=[{pts:[[0,10.5],[38,10.5],[38,9],[22,9],[21.6,9.6],[20.6,10.0],[19.4,10.0],[18.4,9.6],[18,9],[0,9]]}, sl(40.4,48,9,10.5), sl(4.4,48,4.5,6), sl(48,50,4.5,14.5), sl(-0.2,48,13.5,18), sl(50,61,17.2,18), sl(48,51,14.5,18.2)];
  return {id:'fjadra-p3-20', name:'Labyrinten', theme:'cave', hint:'Hitta vägen genom gångarna. Hål i golvet tar dig ner, stjärnorna sitter i hörnen. Den blå stjärnan längst ner skjuter dig upp ur schaktet.',
    stuck:'Kolla översikten (kartknappen). Stjärnan i taket når du med en liten bunny hop.',
    rings:[{pts:air}, ...slabs, log(12,10.5,0.3), log(30,10.5,0.3), log(36,6,0.32)],
    apples:[[47.2,6.75],[20,8.9],[0.8,0.75],[27,-0.45],[52,0.75,'up'],[57.5,16.5,'down']], killers:[], flower:[62,14.5], start:[2,10.5]}; });
// 21 Takgapet — två överhäng: kvartsrör upp, kör upp och ner (glapp i taket!), släpp och flyg över en djup grop
LV3.push(()=>{ const out=[[-4,TOP],[-4,0]], rings=[], apples=[];
  const sec=(x0,y0,last)=>{ // kvartsrör vid x0+8, valv x0+11..x0+40 med glapp, grop efter
    out.push([x0+8,y0],...arc(x0+8,y0+5,5,270,360,20).slice(1),[x0+13,y0+5.15],[x0+13.25,y0+5.3],[x0+13.5,y0+5.15],[x0+13.5,y0],[x0+40,y0],[x0+40.3,y0-0.4],[x0+40.4,y0-10],[x0+46,y0-10],[x0+46.1,y0-1.2],[x0+46.5,y0-1.0],...cr([[x0+46.5,y0-1.0],[x0+50,y0-2.6],[x0+54,y0-4.6],[x0+58,y0-5.6],[x0+62,y0-6]],0.3).slice(1));
    const U=y0+7.2; rings.push({pts:[[x0+9,U],[x0+24,U],[x0+24.3,U+0.5],[x0+24,U+2.2],[x0+16,U+2.6],[x0+9.5,U+2.0],[x0+8.6,U+0.8]]});
    rings.push({pts:[[x0+27,U],[x0+40.6,U],[x0+41.2,U+0.8],[x0+40.4,U+2.4],[x0+32,U+2.8],[x0+27.2,U+2.2],[x0+26.8,U+0.5]]});
    rings.push({pts:[[x0+23.6,U+3.6],[x0+27.6,U+3.6],[x0+27.6,U+4.4],[x0+23.6,U+4.4]]});
    apples.push([x0+12.6,y0+6.2,'up'],[x0+19,U-0.75],[x0+33.5,U-0.75],[x0+40,U-0.8,'down']); };
  sec(0,0); sec(62,-6);
  out.push([62+62+14,-12],[62+62+14,TOP]);
  return {id:'fjadra-p3-21', name:'Takgapet', theme:'sunset', hint:'Upp för kvartsröret – blå stjärnan vänder tyngden. Kör i taket, över glappet, och släpp vid nästa blå stjärna. Farten bär dig över gropen.',
    stuck:'Föll du upp i glappet? Tryck OMSTART och håll mer fart i taket.',
    rings:[{pts:out}, ...rings], apples, killers:[], flower:[62+62+8,-12], start:[1,0]}; });
// 22 Svingtornet — fyra höga, böjda väggar på rad: ta sats, kör uppför och svinga upp över varje krön
LV3.push(()=>{ const H=4.0, pts=[[-4,TOP],[-4,0]], apples=[], logs=[]; let x=0, y=0;
  for(let k=0;k<4;k++){ const q=cr([[x,y],[x+12,y],[x+15,y+0.25],[x+17.5,y+1.0],[x+19.3,y+2.0],[x+20.4,y+3.0],[x+20.9,y+H-0.5],[x+21.05,y+H-0.2]],0.25);
    pts.push(...q.slice(k?1:0),[x+21.07,y+H-0.06],[x+21.17,y+H],[x+21.35,y+H+0.04]); x+=21.35; y+=H; apples.push([x+5,y+0.8]); if(k===1) logs.push(log(x+9,y,0.3)); }
  pts.push([x+16,y],[x+16,TOP]);
  return {id:'fjadra-p3-22', name:'Svingtornet', theme:'winter', hint:'Fyra väggar uppåt. Full fart mot varje vägg – uppe vid krönet: BROMSA och luta FRAMÅT (↻) så svingar cykeln upp.',
    stuck:'Ta sats från bortre änden av avsatsen och håll gasen hela vägen upp för väggen.',
    rings:[{pts}, ...logs], apples, killers:[], flower:[x+11,y], start:[1,0]}; });
// 23 Rördrömmen — halfpipe, loop, tunnel genom en kulle och en sista djup halfpipe man måste gunga sig upp ur
LV3.push(()=>{ const S=P23.s, lp=loopParts(P23.cx,P23.cy,4.6,P23.cx-2.5,3.5,60,0), E=lp.end;
  const s=cr([[-4,P23.h],[2,P23.h],[5,P23.h-0.4],[9,(P23.h+S+0.6)/2],[12,S+0.6],[14,S-1.0],[16,S-1.4],[18,S-1.0],[20,S-0.3],[22,S],[28,S],[33,S-0.8],[38,S*0.78],[43,S*0.54],[48,S*0.29],[53,S*0.08],[57,0],[lp.k0-2,0]],0.3);
  const t=cr([[E,0],[E+6,0],[E+10,0.6],[E+14,1.4],[E+20,1.6],[E+30,1.6],[E+36,1.2],[E+40,0.4],[E+44,0],[E+50,0],[E+53,-1.2],[E+56,-3.4],[E+59,-5.0],[E+62,-5.5],[E+65,-5.0],[E+68,-3.4],[E+70.5,-1.0],[E+72,1.0],[E+72.6,2.0],[E+73,2.2],[E+80,2.2]],0.3);
  const hill={pts:[[E+13,4.6],[E+16,5.6],[E+22,6.6],[E+28,6.6],[E+34,5.6],[E+38,4.4],[E+37,4.2],[E+33,4.4],[E+20,4.6],[E+16,4.6],[E+13.6,4.4]]};
  return {id:'fjadra-p3-23', name:'Rördrömmen', theme:'meadow', hint:'Genom röret, in i loopen, igenom tunneln i kullen – och gunga dig upp ur den sista djupa halfpipen.',
    stuck:'Sista röret: gasa nerför, släpp upp mot kanten och vänd i luften för att bygga fart.',
    rings:[{pts:[[-4,TOP],...s,...lp.ground,...t.slice(1),[E+80,TOP]]}, ...lp.rings, hill],
    apples:[[16,S-0.65],lp.top,[E+25,2.35],[E+62,-4.75],[E+73.8,4.0]], killers:[], flower:[E+77,2.2], start:[1,P23.h]}; });
// 24 Trånga passet — slingrig smal tunnel, stjärnor uppe i krönen, en återvändsgränd och ett hål ner till en undre tunnel ut
LV3.push(()=>{ const env=x=>sm(6,14,x)*(1-sm(70,78,x)); const f=x=>env(x)*(1.5*Math.sin((x-6)/4.2)+0.5*Math.sin((x-6)/1.9));
  const c=x=>f(x)+3.0-0.35*Math.exp(-((x-30)**2)/3)-0.35*Math.exp(-((x-52)**2)/3);
  const floor=sample(f,0,84,0.25), ceil=sample(c,0,92,0.25).reverse();
  const ramp=cr([[100,-7.2],[104,-6.4],[109,-4],[113,-1.2],[116,0.6],[118,1.0]],0.3);
  const pts=[[-8,TOP],[-8,0],...floor,[84,-4],[60,-4],[60,-7.2],...ramp,[128,1.0],[128,TOP],[100,TOP],[100,-4],[86.4,-4],[86.4,0],[92,0],[92,3.0],...ceil,[0,TOP]];
  return {id:'fjadra-p3-24', name:'Trånga passet', theme:'cave', hint:'Smal, slingrig tunnel – ta det lugnt så huvudet inte slår i. Stjärnorna sitter uppe i krönen. Längst bort: vänd och ta hålet ner.',
    stuck:'Hålet i golvet nära slutet tar dig ner till den undre tunneln. Den undre har en stjärna i vänstra änden.',
    rings:[{pts}],
    apples:[[6+4.2*Math.PI/2+0.4,f(6+4.2*Math.PI/2+0.4)+0.8],[6+4.2*Math.PI*2.5,f(6+4.2*Math.PI*2.5)+0.8],[6+4.2*Math.PI*4.5,f(6+4.2*Math.PI*4.5)+0.8],[91.2,0.75],[61,-6.45]], killers:[], flower:[123,1.0], start:[-5,3.0]}; });
// 25 Fritt fall — svävande plattformar på fyra nivåer. Stjärnorna hänger i luften: farten när du kör över kanten avgör var du landar
LV3.push(()=>{ const pl=(x0,x1,y,th)=>({pts:[[x0,y],[x1,y],[x1+0.2,y-0.3],[x1-0.4,y-th],[x0+0.4,y-th],[x0-0.2,y-0.3]]});
  const wave=(x0,x1,y)=>({pts:[...sample(x=>y+0.6*Math.sin((x-x0)/1.6)*sm(x0,x0+2,x)*(1-sm(x1-2,x1,x)),x0,x1,0.25),[x1+0.2,y-0.4],[x1-0.6,y-1.4],[x0+0.6,y-1.4],[x0-0.2,y-0.4]]});
  const rings=[{pts:[[-6,TOP],[-6,-2],[70,-2],[70,TOP]]}, pl(-2,10,24,1.2), pl(14,26,18,1.0), pl(29,34,18,1.0), wave(6,28,12), pl(36,50,12,1.0), pl(30,40,6,1.0), pl(46,60,6,1.0)];
  return {id:'fjadra-p3-25', name:'Fritt fall', theme:'sunset', hint:'Hoppa ner från plattform till plattform. Stjärnorna hänger i luften – kör över kanten långsamt eller snabbt för att träffa dem.',
    stuck:'Föll du förbi en stjärna? Tryck OMSTART och prova en annan fart över kanten.',
    rings, apples:[[11.6,22.4],[27.4,16.2],[35,15.0],[29,9.4],[51.2,10.5],[43,3.6]], killers:[], flower:[64,-2], start:[1,24]}; });
// gemensam bit: kvartsrör upp mot ett valv + blå stjärnor (tak-körning). Returnerar markpunkter, valvet och stjärnor.
function ceilingRide(x0,y0,len,dip){ const U=y0+7.2, und=cr([[x0+9,U],[x0+14,U-0.1],[x0+9+len*0.4,U-dip],[x0+9+len*0.6,U-dip],[x0+4+len,U-0.1],[x0+9+len,U]],0.3);
  return {ground:[[x0+8,y0],...arc(x0+8,y0+5,5,270,360,20).slice(1),[x0+13,y0+5.15],[x0+13.25,y0+5.3],[x0+13.5,y0+5.15],[x0+13.5,y0]],
    roof:{pts:[...und,[x0+9.6+len,U+0.8],[x0+9+len,U+2.4],[x0+9+len/2,U+3.0],[x0+9.5,U+2.4],[x0+8.6,U+0.8]]},
    apples:[[x0+12.6,y0+6.2,'up'],[x0+9+len*0.5,U-dip-0.75],[x0+8+len,U-0.8,'down']]}; }
// 26 Dit och tillbaka — ut över kullarna, ner i schaktet längst bort, och hem genom den långa undre tunneln till blomman under starten
LV3.push(()=>{ const surf=cr([[-6,4],[6,4],[10,4.6],[14,6.4],[17,7.2],[20,6.6],[24,4.8],[27,4.4],[30,4.8],[33,6.0],[34.6,6.6],[35,6.65],[35.3,6.3],[35.4,2.2],[40.6,2.2],[40.7,5.6],[41.2,5.9],[43,5.8],[47,5.0],[52,4.2],[56,5.6],[60,8.0],[63,8.8],[66,8.4],[72,6.0],[78,5.0],[86,5.0]],0.3);
  const ceil=cr([[86,-3],[70,-3],[64,-3],[62,-3.2],[40,-3.2],[38,-3.7],[30,-3.7],[28,-3.2],[-2,-3.2]],0.3);
  const fl=cr([[-2,-6],[50,-6],[53,-6.8],[56,-7.6],[59,-7.6],[62,-6.8],[65,-6],[98,-6]],0.3);
  const pts=[[-6,TOP],...surf,...ceil,[-2,-6],...fl.slice(1),[98,-3],[90,-3],[90,5.0],[104,5.0],[104,TOP]];
  return {id:'fjadra-p3-26', name:'Dit och tillbaka', theme:'meadow', hint:'Ut över kullarna, ner i schaktet längst bort – och hem genom den långa tunneln till blomman under starten.',
    stuck:'I tunneln: stjärnan till höger om schaktet först, vänd sen och kör hela vägen hem.',
    rings:[{pts}, log(20,6.6,0.3), log(48,-6,0.32), log(22,-6,0.3)], apples:[[17,8.6],[38,3.6],[63,9.6],[83,5.75],[96.6,-5.25],[57.5,-6.85]], killers:[], flower:[1.5,-6], start:[2,4]}; });
// 27 Spiralschaktet — tre våningar: kvartsrör upp mot taket, blå stjärna, fall uppåt runt plattornas ändar och kör i taket högst upp
LV3.push(()=>{ const W=44, sl=(x0,x1,y0,y1)=>({pts:[[x0,y1],[x1,y1],[x1,y0],[x0,y0]]});
  const pts=[[-8,TOP],[-8,12.8],[-0.01,12.8],[0,0],[W-5,0],...arc(W-5,5,5,270,360,16).slice(1),[W,15.6],[W+16,15.6],[W+16,TOP],[W+6,TOP],[W+6,21.5],[-0.01,21.5],[0,TOP]];
  const slabs=[sl(0,W-5.6,3.6,4.6), {pts:[[7,9.4],[W,9.4],[W,5.4],...arc(W-3,5.4,3,0,90,12).slice(1),[7,8.4]]}, sl(-0.01,W-5,12.8,13.8)];
  const bumps=[{pts:[[10,12.8],[16,12.8],[14.5,12.3],[11.5,12.3]]},{pts:[[24,8.4],[30,8.4],[28.5,7.9],[25.5,7.9]]}];
  return {id:'fjadra-p3-27', name:'Spiralschaktet', theme:'cave', hint:'Spiralen: varje blå stjärna vrider tyngden (upp, vänster, upp, höger, ner). Kör på taket, på väggen och på taket igen – ut högst upp.',
    stuck:'Landar du åt fel håll? Pilknappen vänder. Kör hela vägen till plattans ände så faller du vidare.',
    rings:[{pts}, ...slabs, ...bumps],
    apples:[[W-1.0,6.7,'up'],[W-7,8.4-0.75],[5.0,7.6,'left'],[0.8,11.4,'up'],[20,12.8-0.75],[W-3.5,12.2,'right'],[W+1.0,16.6,'down']], killers:[], flower:[W+12,15.6], start:[2,0]}; });
// 28 Stora flödet — allt i en rytm: vågor, loop, tak-körning, stort hopp och en hög vägg på slutet
LV3.push(()=>{ const lp=loopParts(P28.cx,6.5,4.6,P28.cx-2.5,3.5,60,0), E=lp.end, cr2=ceilingRide(E+8,0,30,1.2), J=E+8+40;
  const s=cr([[-4,P28.h],[2,P28.h],[6,P28.h-0.6],[10,P28.h-2.4],[13,P28.h-3.2],[16,P28.h-2.6],[19,P28.h-3.6],[23,P28.h-5.4],[26,P28.h-5.8],[29,P28.h-5.4],[34,P28.h-6.6],[40,P28.h-9.0],[46,P28.h-12.4],[52,P28.h-15.6],[58,P28.h-18.4],[63,P28.h-20.4],[68,P28.h-21.6],[72,0],[lp.k0-2,0]],0.3);
  const after=[...cr2.ground,[J,0],...cr([[J,0],[J+6,0.4],[J+10,1.6],[J+12.6,2.6],[J+13,2.65],[J+13.3,2.3],[J+13.4,-6],[J+23.6,-6],[J+23.7,1.4],[J+24.2,1.75],[J+26,1.7],[J+31,0.4],[J+35,0],[J+45,0],
    [J+48,0.25],[J+50.5,1.0],[J+52.3,2.0],[J+53.4,3.0],[J+53.9,4.0],[J+54.05,4.3]],0.25),[J+54.07,4.44],[J+54.17,4.5],[J+54.35,4.54],[J+66,4.54],[J+66,TOP]];
  return {id:'fjadra-p3-28', name:'Stora flödet', theme:'sunset', hint:'Allt i en rytm: flyt över vågorna, gasa in i loopen, kör i taket, flyg över gapet och svinga upp på väggen.',
    stuck:'Loopen behöver fart – håll gasen nere genom vågorna. Väggen: full fart och luta fram uppe vid krönet.',
    rings:[{pts:[[-4,TOP],...s,...lp.ground,[E+8,0],...after]}, ...lp.rings, cr2.roof],
    apples:[[13,P28.h-2.45],[19,P28.h-2.85],[26,P28.h-5.05],lp.top,...cr2.apples,[J+18.5,4.2],[J+60,5.3]], killers:[], flower:[J+63,4.54], start:[1,P28.h]}; });
// 29 Gatloppet — tunnel, en brant topp, ett schakt du faller uppåt ur, ett brett gap och gömda fickor
LV3.push(()=>{ const pts=[[-4,TOP],[-4,0],[30,0],...cr([[30,0],[34,1.2],[38,3.4],[41,5.2],[43,6.1],[44.5,6.3],[46,6.2],[46.4,5.9]],0.25).slice(1),[46.5,-6],[53,-6],[53,9.0],
    ...cr([[53,9.0],[60,9.0],[66,9.4],[69,10.4],[70.6,11.1],[71,11.15],[71.3,10.8],[71.4,2]],0.25).slice(1),[81,2],[81.1,7.8],[81.6,8.2],...cr([[81.6,8.2],[84,8.0],[88,6.0],[92,4.0],[96,3.4],[100,3.4]],0.3).slice(1),
    [106,3.4],[106.05,3.3],[106.05,2.9],[102.6,2.9],[102.4,2.7],[102.4,0.1],[102.5,0],[114,0],...cr([[114,0],[116,0.3],[118,1.5],[119.5,2.6],[120.6,3.0],[121.5,3.0]],0.25).slice(1),[126,3.0],[126.05,2.9],[126.05,2.65],[122.6,2.65],[122.4,2.5],[122.4,0.1],[122.5,0],[140,0],[140,TOP]];
  const roof={pts:[[8,2.75],[26,2.75],[26.6,3.4],[26,4.2],[17,4.6],[8.4,4.2],[7.6,3.4]]};
  const cap={pts:[[45.4,11.4],[56,11.4],[56.4,11.8],[56,12.6],[46,12.6],[45.2,12.0]]};
  return {id:'fjadra-p3-29', name:'Gatloppet', theme:'winter', hint:'Gatloppet: låg tunnel, brant topp, schaktet (blå stjärna – fall uppåt), stort gap och stjärnor gömda i fickor.',
    stuck:'Schaktet: ta den blå stjärnan nere på botten, kör i taket åt höger och släpp vid nästa blå.',
    rings:[{pts}, roof, cap], apples:[[17,2.1],[44.6,7.05],[49.6,-5.25,'up'],[51,11.4-0.75],[55.2,10.6,'down'],[76,5.2],[103.4,0.75],[123.4,0.75]], killers:[], flower:[136,0], start:[2,0]}; });
// 30 Maraton — extremt lång bana: fem klättringsdelar upp till toppen, toppen, och fyra delar downhill hela vägen ner till blomman.
// Höjderna är halverade mot skissen (topp 120 m i stället för 240 m): fysiken har inget luftmotstånd, så 240 m nerför ger orimliga farter.
// Varje del slutar på en viloplatå; l.parts = [x,y] för varje gräns (används av tools/fjadra/test/run_marathon.js).
LV3.push(()=>{ const LID=170, P=[[-8,LID],[-8,0],[0,0]], R=[], A=[], parts=[[0,0]]; let X=0, Y=0;
  const add=pts=>{ for(const p of pts) P.push([+p[0].toFixed(3),+p[1].toFixed(3)]); const q=pts[pts.length-1]; X=q[0]; Y=q[1]; };
  const curve=(rel,st)=>{ const abs=[[X,Y],...rel.map(([dx,dy])=>[X+dx,Y+dy])]; add(cr(abs,st||0.45).slice(1)); };
  const fn=(L,f,st)=>{ st=st||0.6; const x0=X,y0=Y,pts=[]; for(let x=st;x<=L+1e-9;x+=st) pts.push([x0+x,y0+f(x)]); add(pts); };
  const ease=(L,dy)=>fn(L,x=>dy*(0.5-0.5*Math.cos(Math.PI*x/L)));
  const flat=L=>add([[X+L,Y]]);
  const star=(dx,dy)=>A.push([X+(dx||0),Y+(dy==null?0.75:dy)]);
  const rest=L=>{ flat(L/2); star(); flat(L/2); parts.push([X,Y]); };
  const hills=(n,w,h,rise)=>fn(n*w,x=>h*0.5*(1-Math.cos(2*Math.PI*x/w))+(rise||0)*x/(n*w),0.4);
  const dips=(n,w,h,drop)=>fn(n*w,x=>-h*0.5*(1-Math.cos(2*Math.PI*x/w))-(drop||0)*(x/(n*w)),0.4);           // pumpgropar (downhill)
  const gap=(w,d)=>{ curve([[3,0.15],[5,0.6],[6,0.95]],0.25); curve([[1.0,-0.5],[w*0.3,-d],[w*0.7,-d],[w-1.0,-0.5],[w,-0.95]],0.3); };   // ramp + grop man också kan köra igenom
  const canyon=(w,drop)=>{ curve([[3,0.2],[5,0.7],[6,1.0]],0.25); curve([[0.6,-0.4],[w*0.35,-drop*0.45],[w*0.7,-drop*0.9],[w,-drop-1.0],[w+6,-drop-1.0]],0.3); };   // ramp, landningsbacke långt ner
  const pipe=(w,d)=>curve([[w*0.15,-d*0.3],[w*0.3,-d*0.85],[w*0.5,-d],[w*0.7,-d*0.85],[w*0.85,-d*0.3],[w,0]],0.3);
  const loop=()=>{ const t=loopRide(0,4.6,Y), cx=X+0.3-t.lip, lr=loopRide(cx,4.6,Y); add(lr.ground.slice(2)); R.push(...lr.rings); flat(4); };
  const wall=H=>{ const x0=X,y0=Y; add(cr([[x0,y0],[x0+3,y0+0.25],[x0+5.5,y0+H*0.25],[x0+7.3,y0+H*0.5],[x0+8.4,y0+H*0.75],[x0+8.9,y0+H-0.5],[x0+9.05,y0+H-0.2]],0.25).slice(1)); add([[x0+9.07,y0+H-0.06],[x0+9.17,y0+H],[x0+9.35,y0+H+0.04]]); };
  const tunnel=(L,h,n)=>{ const x0=X,y0=Y; flat(L); R.push({pts:[[x0,y0+h+0.35],[x0+0.6,y0+h],[x0+L-0.6,y0+h],[x0+L,y0+h+0.35],[x0+L-0.4,y0+h+1.6],[x0+0.4,y0+h+1.6]]}); for(let k=1;k<=n;k++) A.push([x0+L*k/(n+1),y0+0.75]); };
  const pocket=()=>{ // mesa: uppför, över, ner – vänd och kör in i fickan under kanten (stjärna), vänd igen
    curve([[2,0.3],[4,1.5],[5.5,2.6],[6.6,3.0],[7.5,3.0]],0.25); flat(6.5); const x0=X,y0=Y;
    add([[x0+0.05,y0-0.1],[x0+0.05,y0-0.35],[x0-3.4,y0-0.35],[x0-3.6,y0-0.5],[x0-3.6,y0-2.9],[x0-3.5,y0-3.0]]); A.push([x0-2.7,y0-2.25]); X=x0-3.5; Y=y0-3.0; add([[x0+10,Y]]); };
  const shaft=H=>{ const x0=X,y0=Y,W=6; flat(W); A.push([x0+3,y0+0.75,'up']); add([[X,y0+H-3.2]]); R.push({pts:[[x0-4,y0+H],[x0+W+6,y0+H],[x0+W+6,y0+H+0.8],[x0-4,y0+H+0.8]]}); A.push([x0+W+1.8,y0+H-0.85,'down']); flat(14); };
  const ceiling=len=>{ const c=ceilingRide(X,Y,len,1.0); flat(8); add(c.ground.slice(1)); R.push(c.roof); A.push(...c.apples); add([[X+len+12,Y]]); };
  const overhang=()=>{ const x0=X,y0=Y; flat(14); R.push({pts:[[x0+4,y0+2.65],[x0+10,y0+2.65],[x0+11,y0+3.2],[x0+10,y0+4.2],[x0+4,y0+4.2],[x0+3,y0+3.2]]}); A.push([x0+7,y0+2.05]); };

  // Del 1 – klättring (0 → 20)
  flat(10); hills(3,7,0.9,2); flat(4); gap(10,2.2); flat(6); pipe(16,3.5); flat(4); ease(60,12); flat(6); star(); ease(30,-10); flat(12); loop(); ease(65,13); rest(10);
  // Del 2 – klättring (→ 45)
  pocket(); flat(6); tunnel(26,2.9,2); flat(14); wall(4.5); ease(50,10); overhang(); ease(36,7); rest(10);
  // Del 3 – klättring (→ 70)
  ceiling(30); shaft(14); gap(10,2); ease(30,-10); flat(12); loop(); flat(4); ease(30,-15); flat(10); loop();
  { const need=70-Y; ease(Math.max(60,need*5),need); } rest(10);
  // Del 4 – klättring (→ 95)
  flat(14); wall(4); flat(14); wall(4); tunnel(30,2.75,2); pocket(); flat(4); pipe(18,4.5); { const need=95-Y; ease(Math.max(40,need*5),need); } rest(10);
  // Del 5 – klättring (→ 120)
  shaft(16); ceiling(26); gap(14,3); { const need=110-Y; if(need>0) ease(need*5,need); } flat(6); star(); ease(30,-11); flat(12); loop(); flat(4); { const need=114-Y; ease(need*5,need); } flat(14); wall(5); { const need=120-Y; ease(Math.max(20,need*5),need); } rest(12);
  // Del 6 – toppen
  flat(14); star(0,0.75); flat(16); ease(40,-5); rest(8);
  // Del 7–10 – downhill hela vägen ner (pumpa groparna för fart, bromsa före hoppen)
  const down=(end,big)=>{ canyon(12,big?9:6); dips(4,10,1.4,4); flat(4); star(); pipe(18,4); dips(5,6,0.7,3); flat(4); { const need=end-Y; fn(Math.max(30,-need*4.2),x=>need*x/Math.max(30,-need*4.2)+0.6*Math.sin(x/2.2)*(x>4?1:0)*(1-x/Math.max(30,-need*4.2)),0.4); } rest(10); };
  down(85); down(55,1); down(25,1);
  dips(3,10,1.2,4); canyon(12,6); { const need=0-Y; fn(Math.max(30,-need*4.2),x=>need*x/Math.max(30,-need*4.2)); } flat(30); star(); flat(10);
  const fx=X+6; flat(14); P.push([X,LID]);
  return {id:'fjadra-p3-30', name:'Maraton', theme:'meadow', parts, top:LID,
    hint:'Maraton: klättra hela vägen upp till toppen och susa ner igen. Ta det lugnt – varje del slutar på en viloplatå.',
    stuck:'Fastnat? Uppför: ta sats och luta framåt. Väggar: full fart och luta fram vid krönet. Blå stjärna = tyngden vänder.',
    rings:[{pts:P}, ...R], apples:A, killers:[], flower:[fx,Y], start:[2,0]}; });
// loop man kör rakt in i: loopens botten ligger i marknivå (som en bro över ett dike). Man kör in, runt, och efter varvet
// faller man ut genom öppningen nere till vänster ner i diket, som leder ut under loopen. Ger: markpunkter från kanten t.o.m. diket, plankorna.
function loopRide(cx,R,fy,o){ o=Object.assign({dy:-0.5,gap:2.3,o0:255,o1:215},LOOPRIDE,o||{}); const cy=fy+R+o.dy, Ro=R+o.gap;
  const a0=180+Math.asin((cy-fy)/Ro)*180/Math.PI, lip=cx+Ro*Math.cos(a0*Math.PI/180), D=cy-Ro;   // diket: en större cirkel runt samma mittpunkt
  const ground=[[lip-0.3,fy],[lip,fy],...arc(cx,cy,Ro,a0,270,18).slice(1),...cr([[cx,D],[cx+5,D],[cx+9,D+0.3],[cx+14,fy-0.6],[cx+18,fy-0.05],[cx+20,fy]],0.3).slice(1)];
  return {lip, end:cx+20, ground, rings:woodArc(cx,cy,R,o.o0,o.o1+360,0.35,44), top:[cx,cy+R-0.9]}; }
var LOOPRIDE={};
const MEDALS3={'fjadra-p3-01':[16,26],'fjadra-p3-02':[14,24],'fjadra-p3-03':[24,38],'fjadra-p3-04':[12,20],'fjadra-p3-05':[13,22],
  'fjadra-p3-06':[11,18],'fjadra-p3-07':[14,24],'fjadra-p3-08':[16,26],'fjadra-p3-09':[11,18],'fjadra-p3-10':[14,22],'fjadra-p3-11':[30,45],'fjadra-p3-12':[15,24],'fjadra-p3-13':[30,45],'fjadra-p3-14':[14,24],'fjadra-p3-15':[11,18],
  'fjadra-p3-16':[30,45],'fjadra-p3-17':[16,26],'fjadra-p3-18':[26,40],'fjadra-p3-19':[30,45],'fjadra-p3-20':[34,50],'fjadra-p3-21':[24,36],'fjadra-p3-22':[24,36],'fjadra-p3-23':[26,40],'fjadra-p3-24':[34,50],'fjadra-p3-25':[40,60],
  'fjadra-p3-26':[50,75],'fjadra-p3-27':[30,45],'fjadra-p3-28':[50,75],'fjadra-p3-29':[50,75],'fjadra-p3-30':[300,450]};
const slug=n=>n.toLowerCase().replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function makeLevels(){
  const L3=LV3.map(f=>f());
  for(const l of L3){ l.pack=3; l.medal=MEDALS3[l.id]||[20,35]; }
  const L=L3;
  for(const l of L){ l.segs=buildSegs(l.rings);
    let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9; for(const r of l.rings) for(const p of r.pts){ mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mny=Math.min(mny,p[1]);mxy=Math.max(mxy,p[1]); }
    l.bounds=[mnx,mny,mxx,mxy];
    // "view" bounds for the overview map: ignore the invisible sky lid at TOP
    let vx0=1e9,vx1=-1e9,vy0=1e9,vy1=-1e9; const add=(x,y)=>{ vx0=Math.min(vx0,x); vx1=Math.max(vx1,x); vy0=Math.min(vy0,y); vy1=Math.max(vy1,y); };
    for(const r of l.rings) for(const p of r.pts) if(p[1]<(l.top||TOP)-1) add(p[0],p[1]); for(const a of l.apples) add(a[0],a[1]+1); add(l.flower[0],l.flower[1]+2); add(l.start[0],l.start[1]+2.5);
    l.vbounds=[vx0,vy0,vx1,vy1]; }
  return L;
}
if(typeof module!=='undefined'){ const C=require('./core.js'); global.buildSegs=C.buildSegs; module.exports={makeLevels}; }
