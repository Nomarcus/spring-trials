// ================= GRAPHICS =================
const OUT='#1d2633';
const THEMES={
  meadow:{sky:['#719bad','#c4d5d5','#f5e9ce'], clouds:1, sun:null, mtn:'#a4b8bd', mtnShade:'#879fa8', snow:'#f7fafc', far:'#9daea2', farTree:'#81988c', near:'#9da782', nearShade:'#7e9272', nearTree:'#667c56', lake:'#a9d4ec',
    dirt:'#91745a', dirtDark:'#645344', dirtLight:'#b99b76', rock:'#c3b9ad', rockLight:'#d8d0c6', rockDark:'#ada296', top:'#71864b', topLight:'#c5cb82', topDark:'#465e39', edge:'#6b4a33', kind:'grass',
    deco:['appletree','pine','bush','bush','rock','mushroom','grass','grass','daisies']},
  sunset:{sky:['#777f91','#c4a49c','#efcca0'], clouds:0, sun:'#ffe2a8', mtn:'#9a80a6', mtnShade:'#8a7298', snow:'#f8e2d8', far:'#7a6a88', farTree:'#665777', near:'#8c8f66', nearShade:'#7b7f58', nearTree:'#5f6a4b', lake:null,
    dirt:'#b07c64', dirtDark:'#9a6a55', dirtLight:'#c4937a', rock:'#b8aaa8', rockLight:'#d0c4c2', rockDark:'#a09291', top:'#73ad57', topLight:'#acd385', topDark:'#4f8a42', edge:'#64402f', kind:'grass',
    deco:['pine','pine','bush','rock','grass','grass','appletree']},
  winter:{sky:['#9cc3e6','#d3e7f5','#f7fbfd'], clouds:1, sun:null, mtn:'#c9d9ea', mtnShade:'#b6c9de', snow:'#ffffff', far:'#bfd0df', farTree:'#90aab7', near:'#f0f5fa', nearShade:'#e0e9f2', nearTree:'#7d9b8c', lake:null,
    dirt:'#93837a', dirtDark:'#7e7068', dirtLight:'#a99a90', rock:'#b4bbc3', rockLight:'#d0d6dc', rockDark:'#9ba3ab', top:'#f9fbff', topLight:'#ffffff', topDark:'#b4c8dd', edge:'#5a5560', kind:'snow',
    deco:['snowpine','snowpine','rock','snowbush','snowpine']},
  cave:{sky:['#25383e','#354d52','#526b6c'], clouds:0, sun:null, mtn:'#36557f', mtnShade:'#304e76', snow:null, far:'#33527c', farTree:'#4a78aa', near:'#35567f', nearShade:'#2f4e77', nearTree:null, lake:null, cave:1,
    dirt:'#596566', dirtDark:'#424d4f', dirtLight:'#7e8985', rock:'#8293b5', rockLight:'#a5b4d1', rockDark:'#6d7ea3', top:'#8aa8cf', topLight:'#b3cdec', topDark:'#5a74a0', edge:'#2a3858', kind:'rock',
    deco:['crystal','crystal','rock','stalag']},
};
const NEON_BASE={clouds:0, snow:null, nearTree:null, lake:null, cave:1, kind:'neon', deco:['crystal','crystal','rock']};
const NEON={
  meadow:Object.assign({},NEON_BASE,{sky:['#140a2a','#2c1258','#6a2288'], sun:'#ff7ab8', mtn:'#3b1b70', mtnShade:'#2f1559', far:'#2b1663', farTree:'#7a3cff', near:'#241048', nearShade:'#1c0c3a', dirt:'#1f1338', dirtDark:'#160c2c', dirtLight:'#2c1c50', rock:'#40306f', rockLight:'#6048a8', rockDark:'#2c2056', top:'#3ef2f2', topLight:'#c4ffff', topDark:'#17a9b9', edge:'#0a0618'}),
  sunset:Object.assign({},NEON_BASE,{sky:['#1a0a28','#541258','#ff5f6d'], sun:'#ffd27a', mtn:'#4a1a6e', mtnShade:'#3a1458', far:'#3a1263', farTree:'#ff5fa2', near:'#2b0f48', nearShade:'#210b3a', dirt:'#241034', dirtDark:'#1a0a28', dirtLight:'#34184a', rock:'#4a2f70', rockLight:'#7a4ea8', rockDark:'#33204f', top:'#ffb347', topLight:'#ffe2a8', topDark:'#d9792b', edge:'#0c0516'}),
  winter:Object.assign({},NEON_BASE,{sky:['#08142e','#103a68','#38a0d6'], sun:null, mtn:'#1c4a80', mtnShade:'#163c6c', far:'#17407a', farTree:'#6fd0ff', near:'#10305c', nearShade:'#0c264a', dirt:'#142a4c', dirtDark:'#0e2040', dirtLight:'#1e3a64', rock:'#365c8c', rockLight:'#5d8cc2', rockDark:'#264a74', top:'#c4f6ff', topLight:'#ffffff', topDark:'#6cc4e8', edge:'#050c1c'}),
  cave:Object.assign({},NEON_BASE,{sky:['#06101f','#0b2a3a','#0f4a52'], sun:null, mtn:'#0f3c4a', mtnShade:'#0c3340', far:'#0e3f4c', farTree:'#3cf0b0', near:'#0b2f3c', nearShade:'#08262f', dirt:'#0f2a34', dirtDark:'#0a2028', dirtLight:'#173a46', rock:'#2c5a66', rockLight:'#4a8a98', rockDark:'#1e444e', top:'#6dffa8', topLight:'#d4ffe8', topDark:'#2cbf78', edge:'#030c12'})
};
function getTheme(name){ return STYLE==='neon'?(NEON[name]||NEON.meadow):THEMES[name]; }
let TH=THEMES.meadow;
function seeded(s){ return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; }

// ---------- sprite factory (units = meters, y up) ----------
function makeSprite(w,h,ax,ay,fn){
  const k=SC*DPR, c=document.createElement('canvas'); c.width=Math.max(1,Math.ceil(w*k)); c.height=Math.max(1,Math.ceil(h*k));
  const g=c.getContext('2d'); g.setTransform(k,0,0,-k,ax*k,(h-ay)*k); g.lineJoin='round'; g.lineCap='round'; fn(g);
  return {c,w,h,ax,ay};
}
function blit(sp,x,y,rot,scale,alpha){ // world anchor x,y
  const sx=W/2+(x-cam.x)*SC, sy=Hh/2-(y-cam.y)*SC; const s=scale||1;
  if(sx<-sp.w*SC*2||sx>W+sp.w*SC*2||sy<-sp.h*SC*2||sy>Hh+sp.h*SC*2) return;
  ctx.setTransform(DPR,0,0,DPR,0,0); if(alpha!=null) ctx.globalAlpha=alpha;
  if(rot){ ctx.translate(sx,sy); ctx.rotate(-rot); ctx.drawImage(sp.c,-sp.ax*SC*s,-(sp.h-sp.ay)*SC*s,sp.w*SC*s,sp.h*SC*s); }
  else ctx.drawImage(sp.c,sx-sp.ax*SC*s,sy-(sp.h-sp.ay)*SC*s,sp.w*SC*s,sp.h*SC*s);
  ctx.globalAlpha=1;
}
function ol(g,w){ g.strokeStyle=OUT; g.lineWidth=w||0.05; g.stroke(); }
function circ(g,x,y,r){ g.beginPath(); g.arc(x,y,r,0,6.2832); }
function poly(g,pts){ g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) g.lineTo(pts[i][0],pts[i][1]); g.closePath(); }

const SPR={};
function buildSprites(){
  // apple
  const appleFn=(body,dark)=>g=>{ g.beginPath(); g.moveTo(0,0.2); g.bezierCurveTo(-0.15,0.33,-0.36,0.25,-0.34,0.0); g.bezierCurveTo(-0.33,-0.24,-0.15,-0.33,-0.06,-0.29); g.quadraticCurveTo(0,-0.27,0.06,-0.29);
    g.bezierCurveTo(0.15,-0.33,0.33,-0.24,0.34,0.0); g.bezierCurveTo(0.36,0.25,0.15,0.33,0,0.2); g.closePath(); g.fillStyle=body; g.fill(); ol(g,0.045);
    g.save(); g.clip(); g.fillStyle=dark; g.beginPath(); g.ellipse(0.16,-0.12,0.24,0.22,0,0,6.28); g.fill(); g.restore();
    g.fillStyle='rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(-0.17,0.08,0.06,0.1,-0.4,0,6.28); g.fill();
    g.strokeStyle='#5a3a1a'; g.lineWidth=0.05; g.beginPath(); g.moveTo(0,0.18); g.quadraticCurveTo(0.02,0.3,0.08,0.38); g.stroke();
    g.beginPath(); g.moveTo(0.06,0.3); g.quadraticCurveTo(0.22,0.44,0.34,0.36); g.quadraticCurveTo(0.2,0.24,0.06,0.3); g.fillStyle='#5bb53a'; g.fill(); ol(g,0.03); };
  const starFn=(body,dark,light)=>gg=>{ const pts=[]; for(let i=0;i<10;i++){ const a=Math.PI/2+i*Math.PI/5, r=i%2?0.155:0.345; pts.push([Math.cos(a)*r,Math.sin(a)*r]); }
    const path=()=>{ gg.beginPath(); pts.forEach((p,i)=>i?gg.lineTo(p[0],p[1]):gg.moveTo(p[0],p[1])); gg.closePath(); };
    path(); gg.fillStyle=body; gg.fill();
    gg.save(); path(); gg.clip();
    gg.fillStyle=dark; gg.beginPath(); gg.moveTo(0,0); for(const k of [1,2,3,4,5,6]) gg.lineTo(pts[k][0]*1.2,pts[k][1]*1.2); gg.closePath(); gg.globalAlpha=0.55; gg.fill(); gg.globalAlpha=1;
    gg.fillStyle=dark; for(let k=0;k<10;k+=2){ const p=pts[k], q=pts[(k+1)%10]; gg.beginPath(); gg.moveTo(0,0); gg.lineTo(p[0],p[1]); gg.lineTo(q[0],q[1]); gg.closePath(); gg.globalAlpha=0.35; gg.fill(); } gg.globalAlpha=1;
    gg.fillStyle=light; gg.beginPath(); gg.moveTo(0,0); gg.lineTo(pts[9][0],pts[9][1]); gg.lineTo(pts[0][0],pts[0][1]); gg.lineTo(pts[1][0],pts[1][1]); gg.closePath(); gg.globalAlpha=0.8; gg.fill(); gg.globalAlpha=1;
    gg.restore();
    path(); gg.lineJoin='round'; gg.strokeStyle=OUT; gg.lineWidth=0.05; gg.stroke();
    gg.fillStyle='rgba(255,255,255,.9)'; gg.beginPath(); gg.ellipse(-0.06,0.16,0.035,0.065,-0.45,0,6.28); gg.fill();
    gg.beginPath(); gg.arc(0.03,0.07,0.02,0,6.28); gg.fill(); };
  SPR.apple=makeSprite(0.9,0.9,0.45,0.45,starFn('#ffd23f','#e89412','#fff1a8'));
  SPR.gapple=makeSprite(0.9,0.9,0.45,0.45,starFn('#5fb8ff','#2a6fd4','#c9ecff'));
  // flower (daisy)
  SPR.bud=makeSprite(1.2,1.5,0.6,0.05,g=>{
    g.strokeStyle=OUT; g.lineWidth=0.11; g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(-0.06,0.5,0,0.95); g.stroke(); g.strokeStyle='#4ea832'; g.lineWidth=0.06; g.stroke();
    for(const s of [-1,1]){ g.beginPath(); g.moveTo(0,0.3); g.quadraticCurveTo(0.25*s,0.5,0.32*s,0.32); g.quadraticCurveTo(0.18*s,0.24,0,0.3); g.fillStyle='#5bb53a'; g.fill(); ol(g,0.035); }
    g.beginPath(); g.moveTo(0,0.88); g.bezierCurveTo(-0.2,1.0,-0.12,1.28,0,1.32); g.bezierCurveTo(0.12,1.28,0.2,1.0,0,0.88); g.fillStyle='#f2f2ec'; g.fill(); ol(g,0.035);
    g.beginPath(); g.moveTo(0,0.86); g.bezierCurveTo(-0.16,0.95,-0.1,1.08,-0.03,1.12); g.lineTo(0.03,1.12); g.bezierCurveTo(0.1,1.08,0.16,0.95,0,0.86); g.fillStyle='#5bb53a'; g.fill(); ol(g,0.03);
  });
  SPR.flower=makeSprite(1.2,1.5,0.6,0.05,g=>{
    g.strokeStyle=OUT; g.lineWidth=0.11; g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(-0.06,0.5,0,0.95); g.stroke();
    g.strokeStyle='#4ea832'; g.lineWidth=0.06; g.stroke();
    for(const s of [-1,1]){ g.beginPath(); g.moveTo(0,0.3); g.quadraticCurveTo(0.25*s,0.5,0.32*s,0.32); g.quadraticCurveTo(0.18*s,0.24,0,0.3); g.fillStyle='#5bb53a'; g.fill(); ol(g,0.035); }
    g.save(); g.translate(0,1.0);
    for(let i=0;i<12;i++){ g.save(); g.rotate(i*Math.PI/6); g.beginPath(); g.ellipse(0,0.24,0.08,0.17,0,0,6.28); g.fillStyle='#fff'; g.fill(); g.strokeStyle='#8a97a6'; g.lineWidth=0.025; g.stroke(); g.restore(); }
    circ(g,0,0,0.13); g.fillStyle='#f7c51e'; g.fill(); ol(g,0.035); circ(g,-0.03,0.03,0.05); g.fillStyle='#ffe58a'; g.fill(); g.restore();
  });
  // killers
  SPR.ball=makeSprite(1.1,1.1,0.55,0.55,g=>{
    for(let i=0;i<10;i++){ const a=i*Math.PI/5; g.beginPath(); g.moveTo(Math.cos(a-0.22)*0.26,Math.sin(a-0.22)*0.26); g.lineTo(Math.cos(a)*0.5,Math.sin(a)*0.5); g.lineTo(Math.cos(a+0.22)*0.26,Math.sin(a+0.22)*0.26); g.closePath(); g.fillStyle='#8c939c'; g.fill(); ol(g,0.035); }
    circ(g,0,0,0.31); const gr=g.createRadialGradient(-0.1,0.1,0.02,0,0,0.32); gr.addColorStop(0,'#6b7280'); gr.addColorStop(1,'#25292f'); g.fillStyle=gr; g.fill(); ol(g,0.045);
    g.fillStyle='rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-0.11,0.12,0.07,0.04,-0.6,0,6.28); g.fill();
  });
  SPR.saw=makeSprite(1.1,1.1,0.55,0.55,g=>{
    g.beginPath(); for(let i=0;i<18;i++){ const a=i*Math.PI/9; g.lineTo(Math.cos(a)*0.38,Math.sin(a)*0.38); g.lineTo(Math.cos(a+0.12)*0.5,Math.sin(a+0.12)*0.5); } g.closePath();
    g.fillStyle='#c3c8cf'; g.fill(); ol(g,0.04);
    circ(g,0,0,0.3); g.strokeStyle='#8e959e'; g.lineWidth=0.03; g.stroke();
    circ(g,0,0,0.15); g.fillStyle='#d8382e'; g.fill(); ol(g,0.035); circ(g,0,0,0.05); g.fillStyle='#e9ecef'; g.fill(); ol(g,0.02);
  });
  // deco
  SPR.appletree=makeSprite(5.4,6.0,2.7,0.1,g=>{   // kronan (med kontur) når 5,6 m – bilden måste vara högre, annars klipps toppen rakt av
    g.beginPath(); g.moveTo(-0.35,0); g.quadraticCurveTo(-0.2,1.4,-0.6,2.6); g.lineTo(-0.2,2.7); g.quadraticCurveTo(0.05,1.9,0.2,2.8); g.lineTo(0.55,2.6); g.quadraticCurveTo(0.25,1.4,0.4,0); g.closePath();
    g.fillStyle='#7a4a26'; g.fill(); ol(g,0.07);
    const blobs=[[-1.3,3.3,1.0],[1.3,3.4,1.0],[0,4.2,1.25],[-0.8,4.6,0.9],[0.9,4.5,0.95],[0,3.1,1.0]];
    for(const [x,y,r] of blobs){ circ(g,x,y,r+0.07); g.fillStyle=OUT; g.fill(); }
    for(const [x,y,r] of blobs){ circ(g,x,y,r); g.fillStyle='#3f9a2d'; g.fill(); }
    for(const [x,y,r] of blobs){ circ(g,x-r*0.25,y+r*0.25,r*0.6); g.fillStyle='#62bf3e'; g.fill(); }
    const rnd=seeded(5); let placed=0; for(let tries=0;tries<200&&placed<8;tries++){ const bl=blobs[Math.floor(rnd()*blobs.length)]; const an=rnd()*6.283, rr=rnd()*bl[2]*0.7; const x=bl[0]+Math.cos(an)*rr, y=bl[1]+Math.sin(an)*rr;
      if(!blobs.some(q=>Math.hypot(x-q[0],y-q[1])<q[2]-0.22)) continue; circ(g,x,y,0.14); g.fillStyle='#e2332b'; g.fill(); ol(g,0.03); circ(g,x-0.04,y+0.04,0.04); g.fillStyle='rgba(255,255,255,.7)'; g.fill(); placed++; }
  });
  SPR.pine=makeSprite(3,5.6,1.5,0.1,g=>{
    g.fillStyle='#6b4423'; g.fillRect(-0.15,0,0.3,0.8); g.beginPath(); g.rect(-0.15,0,0.3,0.8); ol(g,0.05);
    const tiers=[[0.5,1.3,1.3],[1.6,1.1,1.25],[2.7,0.85,1.15],[3.7,0.6,1.1]];
    for(const [y,w,h] of tiers){ g.beginPath(); g.moveTo(-w,y); g.lineTo(0,y+h+0.4); g.lineTo(w,y); g.quadraticCurveTo(0,y-0.18,-w,y); g.closePath(); g.fillStyle='#2f6f3a'; g.fill(); ol(g,0.06);
      g.beginPath(); g.moveTo(-w*0.2,y+0.1); g.lineTo(0,y+h+0.3); g.lineTo(-w*0.75,y+0.05); g.closePath(); g.fillStyle='#3f8a48'; g.fill(); }
  });
  SPR.snowpine=makeSprite(3,5.6,1.5,0.1,g=>{
    g.fillStyle='#5b3d24'; g.fillRect(-0.15,0,0.3,0.8);
    const tiers=[[0.5,1.3,1.3],[1.6,1.1,1.25],[2.7,0.85,1.15],[3.7,0.6,1.1]];
    for(const [y,w,h] of tiers){ g.beginPath(); g.moveTo(-w,y); g.lineTo(0,y+h+0.4); g.lineTo(w,y); g.quadraticCurveTo(0,y-0.18,-w,y); g.closePath(); g.fillStyle='#2e5c4c'; g.fill(); ol(g,0.06);
      g.beginPath(); g.moveTo(-w*0.55,y+h*0.45); g.lineTo(0,y+h+0.4); g.lineTo(w*0.55,y+h*0.45); g.quadraticCurveTo(w*0.2,y+h*0.3,0,y+h*0.42); g.quadraticCurveTo(-w*0.25,y+h*0.3,-w*0.55,y+h*0.45); g.closePath(); g.fillStyle='#fff'; g.fill(); g.strokeStyle='#9db8d6'; g.lineWidth=0.03; g.stroke(); }
  });
  SPR.bush=makeSprite(2.2,1.4,1.1,0.05,g=>{
    const b=[[-0.5,0.35,0.42],[0.45,0.35,0.45],[0,0.6,0.55]];
    for(const [x,y,r] of b){ circ(g,x,y,r+0.06); g.fillStyle=OUT; g.fill(); } for(const [x,y,r] of b){ circ(g,x,y,r); g.fillStyle='#3f9a2d'; g.fill(); }
    for(const [x,y,r] of b){ circ(g,x-r*0.25,y+r*0.25,r*0.55); g.fillStyle='#69c442'; g.fill(); }
  });
  SPR.snowbush=makeSprite(2.2,1.4,1.1,0.05,g=>{
    const b=[[-0.5,0.35,0.42],[0.45,0.35,0.45],[0,0.6,0.55]];
    for(const [x,y,r] of b){ circ(g,x,y,r+0.06); g.fillStyle=OUT; g.fill(); } for(const [x,y,r] of b){ circ(g,x,y,r); g.fillStyle='#d9e7f3'; g.fill(); }
    for(const [x,y,r] of b){ circ(g,x-r*0.25,y+r*0.25,r*0.55); g.fillStyle='#fff'; g.fill(); }
  });
  SPR.rock=makeSprite(1.8,1.2,0.9,0.1,g=>{
    poly(g,[[-0.75,0],[-0.6,0.5],[-0.2,0.8],[0.35,0.75],[0.7,0.4],[0.78,0]]); g.fillStyle=TH.rock; g.fill(); ol(g,0.06);
    poly(g,[[-0.55,0.45],[-0.2,0.72],[0.25,0.68],[-0.05,0.45]]); g.fillStyle=TH.rockLight; g.fill();
    if(TH.kind==='grass'){ g.beginPath(); g.ellipse(0.1,0.74,0.3,0.08,0,0,6.28); g.fillStyle='#5cb52f'; g.fill(); ol(g,0.03); }
  });
  SPR.mushroom=makeSprite(0.9,0.9,0.45,0.05,g=>{
    g.beginPath(); g.rect(-0.08,0,0.16,0.35); g.fillStyle='#f3ead6'; g.fill(); ol(g,0.04);
    g.beginPath(); g.moveTo(-0.36,0.3); g.quadraticCurveTo(-0.34,0.72,0,0.72); g.quadraticCurveTo(0.34,0.72,0.36,0.3); g.closePath(); g.fillStyle='#d8382e'; g.fill(); ol(g,0.045);
    for(const [x,y,r] of [[-0.14,0.5,0.06],[0.12,0.56,0.07],[0.02,0.38,0.04]]){ circ(g,x,y,r); g.fillStyle='#fff'; g.fill(); }
  });
  SPR.grass=makeSprite(1.2,0.7,0.6,0.05,g=>{
    for(let i=-4;i<=4;i++){ const x=i*0.11; g.beginPath(); g.moveTo(x-0.05,0); g.quadraticCurveTo(x+i*0.03,0.3,x+i*0.06,0.45+0.1*Math.cos(i)); g.lineTo(x+0.05,0); g.closePath(); g.fillStyle=i%2?'#4ea832':'#6cc43e'; g.fill(); g.strokeStyle=OUT; g.lineWidth=0.025; g.stroke(); }
  });
  SPR.daisies=makeSprite(1.2,0.7,0.6,0.05,g=>{
    for(const [x,h] of [[-0.3,0.35],[0.05,0.48],[0.32,0.3]]){ g.strokeStyle='#3f8a2e'; g.lineWidth=0.035; g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke();
      for(let i=0;i<6;i++){ circ(g,x+Math.cos(i)*0.06,h+Math.sin(i)*0.06,0.045); g.fillStyle='#fff'; g.fill(); } circ(g,x,h,0.035); g.fillStyle='#f2c230'; g.fill(); }
  });
  SPR.crystal=makeSprite(1.6,1.6,0.8,0.05,g=>{
    const cs=[[-0.3,0.9,-0.25],[0.1,1.3,0.05],[0.4,0.8,0.3]];
    for(const [x,h,a] of cs){ g.save(); g.translate(x,0); g.rotate(-a); poly(g,[[-0.13,0],[-0.13,h*0.75],[0,h],[0.13,h*0.75],[0.13,0]]); g.fillStyle='#4fd2f0'; g.fill(); ol(g,0.04);
      poly(g,[[-0.13,0],[-0.13,h*0.75],[0,h],[0,0]]); g.fillStyle='#9ef0ff'; g.fill(); g.restore(); }
  });
  SPR.stalag=makeSprite(1.2,1.4,0.6,0.05,g=>{ poly(g,[[-0.4,0],[-0.1,0.9],[0.05,1.1],[0.2,0.7],[0.45,0]]); g.fillStyle=TH.rock; g.fill(); ol(g,0.05); poly(g,[[-0.3,0],[-0.08,0.8],[0.0,0.2]]); g.fillStyle=TH.rockLight; g.fill(); });
  SPR.stalac=makeSprite(1,1.6,0.5,1.55,g=>{ poly(g,[[-0.35,0],[0.35,0],[0.05,-1.4],[-0.02,-1.45]]); g.fillStyle=TH.rock; g.fill(); ol(g,0.05); poly(g,[[-0.25,0],[0,0],[-0.02,-1.2]]); g.fillStyle=TH.rockLight; g.fill(); });
}

// ---------- ground pattern ----------
let PAT=null;
function buildPattern(){
  // Offline-sized, seamless lithographic sandstone tile; cached once per theme.
  const T=512,k=DPR,c=document.createElement('canvas');c.width=c.height=Math.round(T*k);
  const g=c.getContext('2d');g.scale(k,k);g.fillStyle=TH.dirt;g.fillRect(0,0,T,T);
  const rnd=seeded(1147);
  for(let row=0;row<16;row++){
    const y=row*32;g.beginPath();
    for(let x=0;x<=T;x+=8){const yy=y+4*Math.sin(x/T*Math.PI*4+row*.8)+2*Math.sin(x/T*Math.PI*10+row);x?g.lineTo(x,yy):g.moveTo(x,yy);}
    g.strokeStyle=row%3===0?TH.dirtDark:TH.dirtLight;g.globalAlpha=.28;g.lineWidth=1+row%3;g.stroke();
  }
  for(let i=0;i<1100;i++){
    const x=rnd()*T,y=rnd()*T,r=.35+rnd()*1.3;
    g.globalAlpha=.08+rnd()*.15;g.fillStyle=i%3?TH.dirtDark:TH.dirtLight;
    g.fillRect(x,y,r*2,r);
  }
  for(let i=0;i<38;i++){
    const x=rnd()*T,y=rnd()*T,rx=3+rnd()*13,ry=2+rnd()*6;
    for(const ox of [-T,0,T])for(const oy of [-T,0,T]){
      g.beginPath();g.moveTo(x+ox-rx,y+oy);g.lineTo(x+ox-rx*.4,y+oy-ry);g.lineTo(x+ox+rx*.7,y+oy-ry*.6);g.lineTo(x+ox+rx,y+oy+ry*.3);g.lineTo(x+ox,y+oy+ry);g.closePath();
      g.globalAlpha=.32;g.fillStyle=TH.rockDark;g.fill();g.strokeStyle=TH.dirtDark;g.lineWidth=.7;g.stroke();
      g.beginPath();g.moveTo(x+ox-rx*.7,y+oy-ry*.3);g.lineTo(x+ox-rx*.35,y+oy-ry*.7);g.lineTo(x+ox+rx*.5,y+oy-ry*.4);g.globalAlpha=.45;g.strokeStyle=TH.rockLight;g.stroke();
    }
  }
  g.globalAlpha=1;PAT=ctx.createPattern(c,'repeat');
}

function pointInRing(x,y,pts){ let ins=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
  if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins; } return ins; }
function isAir(l,x,y){ let n=0; for(const r of l.rings) if(pointInRing(x,y,r.pts)) n++; return n%2===1; }
function isAirBase(l,x,y){ let n=0; for(const r of l.rings) if(!r.style&&pointInRing(x,y,r.pts)) n++; return n%2===1; }
function analyze(l){
  const tops=[], ceils=[];
  for(const r of l.rings){ if(r.style) continue; const p=r.pts;
    for(let i=0;i<p.length;i++){ const a=p[i], b=p[(i+1)%p.length]; const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy); if(len<1e-4) continue;
      let nx=-dy/len, ny=dx/len; const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
      if(!isAirBase(l,mx+nx*0.05,my+ny*0.05)){ nx=-nx; ny=-ny; }
      const s={x1:a[0],y1:a[1],x2:b[0],y2:b[1],nx,ny,len};
      if(ny>0.42) tops.push(s); else if(ny<-0.5) ceils.push(s); } }
  // deco placement
  const deco=[]; const rnd=seeded(97+l.name.length*31); let lastTree=-1e9, last=-1e9;
  const list=TH.deco;
  const sorted=tops.filter(s=>s.ny>0.86 && s.len>0.3).sort((a,b)=>Math.min(a.x1,a.x2)-Math.min(b.x1,b.x2));
  for(const s of sorted){ const x0=Math.min(s.x1,s.x2), x1=Math.max(s.x1,s.x2);
    for(let x=x0;x<x1;x+=0.5){ if(x-last<2.2||rnd()>0.22) continue; const t=(x-s.x1)/(s.x2-s.x1); const y=s.y1+t*(s.y2-s.y1);
      let kind=list[Math.floor(rnd()*list.length)];
      const big=kind==='appletree'||kind==='pine'||kind==='snowpine';
      if(big && x-lastTree<7) kind=TH.kind==='snow'?'snowbush':(TH.cave?'crystal':'bush');
      if(big){ if(!isAir(l,x,y+5.2)||!isAir(l,x-1.5,y+3)||!isAir(l,x+1.5,y+3)) continue; lastTree=x; }
      if(!isAir(l,x,y+0.9)) continue;
      deco.push({kind,x,y:y-0.08,s:0.85+rnd()*0.3,flip:rnd()<.5}); last=x; } }
  const hang=[]; if(TH.cave){ const r2=seeded(13); for(const s of ceils){ const x0=Math.min(s.x1,s.x2), x1=Math.max(s.x1,s.x2); for(let x=x0;x<x1;x+=0.5){ if(r2()>0.12) continue; const t=(x-s.x1)/(s.x2-s.x1); hang.push({x,y:s.y1+t*(s.y2-s.y1)+0.05,s:0.6+r2()*0.6}); } } }
  // tufts
  for(const s of tops){ s.tufts=[]; const rr=seeded(Math.floor(s.x1*100+s.y1*7)+5); for(let d=0.2; d<s.len; d+=0.42+rr()*0.5) s.tufts.push([d,0.1+rr()*0.12,rr()]); }
  const boulders=[], roots=[], lanterns=[]; const rb=seeded(71+l.name.length*13);
  for(const s of tops){ const tx=(s.x2-s.x1)/s.len, ty=(s.y2-s.y1)/s.len;
    for(let d=rb()*2; d<s.len; d+=2.4+rb()*2.2){ const px=s.x1+tx*d, py=s.y1+ty*d, dep=0.9+rb()*1.8; boulders.push({x:px-s.nx*dep,y:py-s.ny*dep,r:0.22+rb()*0.5,a:rb()*3}); }
    if(TH.kind==='grass'&&s.ny>0.6) for(let d=rb()*1.2; d<s.len; d+=1.3+rb()*1.6){ if(rb()<0.45) continue; const px=s.x1+tx*d-s.nx*0.26, py=s.y1+ty*d-s.ny*0.26; const pts=[[px,py]]; let x=px,y=py, L=0.35+rb()*0.55, n=4;
      for(let k=0;k<n;k++){ x+=-s.nx*L/n+(rb()-0.5)*0.14; y+=-s.ny*L/n+(rb()-0.5)*0.14; pts.push([x,y]); } roots.push(pts);
      if(rb()<0.5){ const m=pts[2]; roots.push([m,[m[0]+(rb()-0.5)*0.3-s.nx*0.15,m[1]-s.ny*0.18]]); } } }
  if(TH.cave){ const rl=seeded(19); for(const s of ceils){ const tx=(s.x2-s.x1)/s.len, ty=(s.y2-s.y1)/s.len; for(let d=1+rl()*3; d<s.len; d+=7+rl()*4){ lanterns.push({x:s.x1+tx*d,y:s.y1+ty*d,len:0.5+rl()*0.6,ph:rl()*6}); } } }
  l.vis={tops,ceils,deco,hang,boulders,roots,lanterns};
}

// ---------- background layers ----------
let BG={key:'',layers:[]};
function layerCanvas(wcss,hcss,fn){ const c=document.createElement('canvas'); c.width=Math.round(wcss*DPR); c.height=Math.round(hcss*DPR); const g=c.getContext('2d'); g.scale(DPR,DPR); g.lineJoin='round'; fn(g,wcss,hcss); return c; }
function buildBackground(themeName){
  const key=themeName+'|'+W+'|'+Hh+'|'+DPR; if(BG.key===key) return; BG.key=key; BG.layers=[];
  const TW=1400, H=Hh; const rnd=seeded(themeName.length*77+3);
  const per=(x,fs)=>fs.reduce((s,[a,f,p])=>s+a*Math.sin(x/TW*6.2832*f+p),0);
  if(TH.clouds){ BG.layers.push({par:0.04,drift:6,c:layerCanvas(TW,H*0.5,(g,w)=>{ for(let i=0;i<6;i++){ const cx=(i+rnd()*0.6)*w/6, cy=30+rnd()*H*0.22, s=0.7+rnd()*0.7;
      const pf=[[0,0,32],[-34,8,22],[34,6,26],[-14,-16,24],[16,-14,22]];
      for(const ox of [-w,0,w]){ g.fillStyle='rgba(255,255,255,.95)'; for(const [x,y,r] of pf){ g.beginPath(); g.arc(cx+ox+x*s,cy+y*s,r*s,0,6.28); g.fill(); }
        g.fillStyle='rgba(170,200,230,.45)'; g.beginPath(); g.ellipse(cx+ox,cy+16*s,52*s,9*s,0,0,6.28); g.fill(); } } })}); }
  if(TH.sun){ BG.sunY=H*0.52; }
  // mountains
  BG.layers.push({par:0.07,y:0,c:layerCanvas(TW,H,(g,w,h)=>{
    // Continuous eroded ridgelines, periodic so parallax wraps without seams.
    for(let layer=0;layer<3;layer++){
      const ridge=x=>h*(.38+layer*.065)+per(x,[[h*.055,2,layer*.7],[h*.026,5,1.8+layer],[h*.009,13,.5],[h*.004,29,2]]);
      g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=4)g.lineTo(x,ridge(x));g.lineTo(w,h);g.closePath();
      const wash=g.createLinearGradient(0,h*.2,0,h*.8);wash.addColorStop(0,layer===1?TH.mtnShade:TH.mtn);wash.addColorStop(1,TH.sky[1]);g.fillStyle=wash;g.globalAlpha=.55+layer*.17;g.fill();
      g.strokeStyle=TH.snow||TH.sky[1];g.globalAlpha=.18;g.lineWidth=1;g.beginPath();for(let x=0;x<=w;x+=4)x?g.lineTo(x,ridge(x)):g.moveTo(x,ridge(x));g.stroke();
    }g.globalAlpha=1;

  })});
  // far forest
  BG.layers.push({par:0.16,c:layerCanvas(TW,H,(g,w,h)=>{
    const yb=x=>h*0.62+per(x,[[10,2,0.3],[6,5,1.1]]);
    g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=10) g.lineTo(x,yb(x)); g.lineTo(w,h); g.closePath(); g.fillStyle=TH.far; g.fill();
    if(TH.lake){ g.fillStyle=TH.lake; g.globalAlpha=.75; g.beginPath(); g.ellipse(w*0.3,h*0.7,w*0.12,9,0,0,6.28); g.ellipse(w*0.78,h*0.72,w*0.09,7,0,0,6.28); g.fill(); g.globalAlpha=1; }
    if(TH.cave){ for(let i=0;i<26;i++){ const x=rnd()*w, hh=h*(0.08+rnd()*0.2); for(const ox of [-w,0,w]){ g.fillStyle=TH.farTree; g.beginPath(); g.moveTo(x+ox-14,0); g.lineTo(x+ox,hh); g.lineTo(x+ox+14,0); g.fill(); } } return; }
    for(let i=0;i<70;i++){ const x=rnd()*w, s=0.6+rnd()*0.7, y=yb(x)+4; for(const ox of [-w,0,w]){ const X=x+ox; g.fillStyle=TH.farTree;
      g.beginPath(); g.moveTo(X-9*s,y); g.lineTo(X,y-40*s); g.lineTo(X+9*s,y); g.closePath(); g.fill(); if(TH.kind==='snow'){ g.fillStyle='#eef5fb'; g.beginPath(); g.moveTo(X-4*s,y-22*s); g.lineTo(X,y-40*s); g.lineTo(X+4*s,y-22*s); g.closePath(); g.fill(); } } }
  })});
  // near hills
  BG.layers.push({par:0.3,c:layerCanvas(TW,H,(g,w,h)=>{
    const yb=x=>h*0.74+per(x,[[22,1,0.7],[14,3,2.1],[6,7,0.4]]);
    g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=8) g.lineTo(x,yb(x)); g.lineTo(w,h); g.closePath(); g.fillStyle=TH.near; g.fill();
    g.strokeStyle=TH.cave?'rgba(120,180,255,.25)':'rgba(29,38,51,.35)'; g.lineWidth=2; g.beginPath(); for(let x=0;x<=w;x+=8) x?g.lineTo(x,yb(x)):g.moveTo(x,yb(x)); g.stroke();
    g.fillStyle=TH.nearShade; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=8) g.lineTo(x,yb(x)+18+per(x,[[6,4,1]])); g.lineTo(w,h); g.closePath(); g.fill();
    if(TH.cave){ for(let i=0;i<9;i++){ const x=rnd()*w, y=yb(x); for(const ox of [-w,0,w]){ const X=x+ox; const gr=g.createRadialGradient(X,y-14,2,X,y-14,40); gr.addColorStop(0,'rgba(90,220,255,.55)'); gr.addColorStop(1,'rgba(90,220,255,0)'); g.fillStyle=gr; g.fillRect(X-40,y-54,80,80);
      g.fillStyle='#4fd2f0'; g.strokeStyle='#0d1426'; g.lineWidth=1.5; g.beginPath(); g.moveTo(X-6,y+2); g.lineTo(X-3,y-22); g.lineTo(X+1,y-28); g.lineTo(X+5,y-18); g.lineTo(X+7,y+2); g.closePath(); g.fill(); g.stroke(); } } return; }
    if(!TH.nearTree) return;
    for(let i=0;i<11;i++){ const x=rnd()*w, y=yb(x)+2, s=0.8+rnd()*0.6, round=rnd()<.5 && TH.kind!=='snow'; for(const ox of [-w,0,w]){ const X=x+ox;
      g.strokeStyle='rgba(29,38,51,.55)'; g.lineWidth=1.6;
      if(round){ g.fillStyle='#6b4a2a'; g.fillRect(X-2*s,y-14*s,4*s,14*s); g.fillStyle=TH.nearTree; g.beginPath(); g.arc(X,y-22*s,13*s,0,6.28); g.arc(X-9*s,y-15*s,9*s,0,6.28); g.arc(X+9*s,y-16*s,9*s,0,6.28); g.fill(); }
      else { g.fillStyle=TH.nearTree; g.beginPath(); g.moveTo(X-12*s,y); g.lineTo(X,y-50*s); g.lineTo(X+12*s,y); g.closePath(); g.fill(); g.stroke(); if(TH.kind==='snow'){ g.fillStyle='#fff'; g.beginPath(); g.moveTo(X-6*s,y-25*s); g.lineTo(X,y-50*s); g.lineTo(X+6*s,y-25*s); g.closePath(); g.fill(); } } } }
  })});
}
function drawBackground(t){
  const g=ctx.createLinearGradient(0,0,0,Hh); g.addColorStop(0,TH.sky[0]); g.addColorStop(.6,TH.sky[1]); g.addColorStop(1,TH.sky[2]);
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.fillStyle=g; ctx.fillRect(0,0,W,Hh);
  if(TH.sun){ const sx=W*0.7, sy=Hh*0.5; const gr=ctx.createRadialGradient(sx,sy,10,sx,sy,Hh*0.5); gr.addColorStop(0,'rgba(255,220,140,.65)'); gr.addColorStop(1,'rgba(255,200,120,0)'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,Hh);
    ctx.fillStyle=TH.sun; ctx.beginPath(); ctx.arc(sx,sy,Math.min(W,Hh)*0.1,0,6.28); ctx.fill(); }
  const TW=1400;
  if(TH.sun){ ctx.save(); ctx.globalCompositeOperation='lighter'; const sx=W*0.7, sy=Hh*0.5; for(let i=0;i<5;i++){ const a=-2.2+i*0.32+Math.sin(t*0.05+i)*0.03, w=0.07; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+Math.cos(a-w)*W*1.4,sy+Math.sin(a-w)*W*1.4); ctx.lineTo(sx+Math.cos(a+w)*W*1.4,sy+Math.sin(a+w)*W*1.4); ctx.closePath(); ctx.fillStyle='rgba(255,210,150,.035)'; ctx.fill(); } ctx.restore(); }
  let li_=0; for(const L of BG.layers){ li_++; const off=-(((cam.x*SC*L.par)+(L.drift?t*L.drift:0))%TW+TW)%TW; const vy=Math.max(-60,Math.min(60,(cam.y-camBaseY)*SC*L.par*0.6));
    if(L.alpha) ctx.globalAlpha=L.alpha; else if(L.par<0.1) ctx.globalAlpha=0.85; for(let x=off; x<W; x+=TW) ctx.drawImage(L.c,x,vy,TW,L.c.height/DPR); ctx.globalAlpha=1;
    if(Math.abs(L.par-0.16)<1e-6 && (TH.kind!=='rock')){ const fy=Hh*0.6+vy, fg=ctx.createLinearGradient(0,fy,0,fy+Hh*0.25); const fc=TH.kind==='snow'?'235,244,252':(TH.sun?'255,214,190':'240,248,250');
      fg.addColorStop(0,'rgba('+fc+',0)'); fg.addColorStop(0.5,'rgba('+fc+','+(TH.sun?0.18:0.32)+')'); fg.addColorStop(1,'rgba('+fc+',0)'); ctx.fillStyle=fg; ctx.fillRect(0,fy,W,Hh*0.25); } }
}
let camBaseY=0;
const LIFE={birds:[],flakes:[],motes:[]};
const REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
(function(){ const r=seeded(31); for(let i=0;i<2;i++) LIFE.birds.push({x:r()*1400,y:50+r()*90,s:0.6+r()*0.4,v:9+r()*6,ph:r()*6}); for(let i=0;i<38;i++) LIFE.flakes.push({x:r(),y:r(),s:0.8+r()*1.6,v:0.02+r()*0.035,ph:r()*6}); for(let i=0;i<18;i++) LIFE.motes.push({x:r(),y:r(),s:1+r()*2.5,ph:r()*6}); })();
function drawLife(t){
  if(REDUCED) return; ctx.setTransform(DPR,0,0,DPR,0,0);
  if(TH.kind==='grass'){ ctx.strokeStyle='rgba(60,70,90,.35)'; ctx.lineWidth=1.4; ctx.lineCap='round';
    for(const b of LIFE.birds){ const x=((b.x+t*b.v-cam.x*SC*0.1)%1500+1500)%1500-50, y=b.y+Math.sin(t*0.7+b.ph)*10, f=Math.sin(t*3.5+b.ph)*3*b.s; ctx.beginPath(); ctx.moveTo(x-8*b.s,y-f); ctx.quadraticCurveTo(x-3*b.s,y-2,x,y); ctx.quadraticCurveTo(x+3*b.s,y-2,x+8*b.s,y-f); ctx.stroke(); } }
  else if(TH.kind==='snow'){ ctx.fillStyle='rgba(255,255,255,.85)';
    for(const f of LIFE.flakes){ const x=(((f.x*W+Math.sin(t*0.8+f.ph)*20-cam.x*SC*0.3)%W)+W)%W, y=(((f.y+t*f.v)*Hh-cam.y*SC*-0.3)%Hh+Hh)%Hh; ctx.beginPath(); ctx.arc(x,y,f.s,0,6.28); ctx.fill(); } }
  else if(TH.cave){ for(const m of LIFE.motes){ const x=(((m.x*W+Math.sin(t*0.3+m.ph)*30-cam.x*SC*0.2)%W)+W)%W, y=(((m.y*Hh+Math.cos(t*0.25+m.ph)*25)%Hh)+Hh)%Hh; ctx.fillStyle='rgba(120,220,255,'+(0.25+0.25*Math.sin(t*2+m.ph))+')'; ctx.beginPath(); ctx.arc(x,y,m.s,0,6.28); ctx.fill(); } }
}
function drawLanterns(l,t){ if(!l.vis.lanterns.length) return; const v=view();
  for(const ln of l.vis.lanterns){ if(ln.x<v[0]-3||ln.x>v[2]+3||ln.y<v[1]-3||ln.y>v[3]+3) continue; const sw=Math.sin(t*0.8+ln.ph)*0.05, bx=ln.x+sw, by=ln.y-ln.len;
    ctx.save(); ctx.globalCompositeOperation='lighter'; const gr=ctx.createRadialGradient(bx,by,0.05,bx,by,2.6); gr.addColorStop(0,'rgba(255,190,110,.32)'); gr.addColorStop(1,'rgba(255,170,90,0)'); ctx.fillStyle=gr; ctx.fillRect(bx-2.6,by-2.6,5.2,5.2); ctx.restore();
    ctx.beginPath(); ctx.moveTo(ln.x,ln.y); ctx.lineTo(bx,by+0.16); ctx.strokeStyle='#2a3858'; ctx.lineWidth=0.03; ctx.stroke();
    ctx.beginPath(); ctx.rect(bx-0.09,by-0.14,0.18,0.28); ctx.fillStyle='#ffd58a'; ctx.fill(); ctx.strokeStyle='#1d2633'; ctx.lineWidth=0.03; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx-0.12,by+0.14); ctx.lineTo(bx+0.12,by+0.14); ctx.lineTo(bx,by+0.24); ctx.closePath(); ctx.fillStyle='#2a3858'; ctx.fill(); } }
// painted brake zone on a ledge (yellow/black), drawn on the actual surface
function drawMarks(l){ if(!l.marks) return; const top=l.vbounds[3]+3;
  for(const [x0,x1] of l.marks){ const pts=[]; for(let x=x0;x<=x1+1e-6;x+=0.2){ const h=rayHit(x,top,0,-1,top-l.vbounds[1]+5); if(h) pts.push([x,h.y]); } if(pts.length<2) continue;
    ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]-0.06):ctx.moveTo(p[0],p[1]-0.06)); ctx.strokeStyle='#1d2633'; ctx.lineWidth=0.17; ctx.lineCap='butt'; ctx.stroke(); ctx.strokeStyle='#f2c230'; ctx.lineWidth=0.11; ctx.stroke();
    ctx.beginPath(); for(let i=0;i<pts.length-1;i+=1){ const p=pts[i]; ctx.moveTo(p[0]+0.03,p[1]-0.11); ctx.lineTo(p[0]+0.13,p[1]-0.01); } ctx.strokeStyle='#1d2633'; ctx.lineWidth=0.045; ctx.stroke(); ctx.lineCap='round'; } }
function drawGrade(){ ctx.setTransform(DPR,0,0,DPR,0,0); let c=null; if(TH.kind==='snow') c='rgba(165,200,245,.08)'; else if(TH.sun) c='rgba(255,165,120,.05)'; else if(TH.cave) c='rgba(20,30,70,.10)';
  if(c){ ctx.fillStyle=c; ctx.fillRect(0,0,W,Hh); } }
function drawVignette(){ ctx.setTransform(DPR,0,0,DPR,0,0); const r=Math.hypot(W,Hh)/2; const g=ctx.createRadialGradient(W/2,Hh/2,r*0.55,W/2,Hh/2,r*1.05); g.addColorStop(0,'rgba(10,20,35,0)'); g.addColorStop(1,TH.cave?'rgba(8,14,32,.30)':'rgba(40,50,70,.12)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,Hh); }
// soft drop shadow under the bike (gravity down only)
function groundBelow(x,y){ let best=-1e9; for(const s of lvl.segs){ if(x<s.minx||x>s.maxx||s.dx===0) continue; const t=(x-s.x1)/s.dx; if(t<0||t>1) continue; const gy=s.y1+t*s.dy; if(gy<=y+0.05&&gy>best) best=gy; } return best; }
function rayHit(px,py,dx,dy,maxD){ let best=maxD; for(const s of lvl.segs){ const den=dx*s.dy-dy*s.dx; if(Math.abs(den)<1e-9) continue;
    const qx=s.x1-px, qy=s.y1-py, t=(qx*s.dy-qy*s.dx)/den, u=(qx*dy-qy*dx)/den; if(t>0&&t<best&&u>=0&&u<=1) best=t; }
  return best<maxD?{t:best,x:px+dx*best,y:py+dy*best}:null; }
// soft contact shadow: one blurred capsule lying on the surface under the wheels, following slopes and gravity
function drawShadow(bk,alpha){
  const gl=Math.hypot(bk.gx,bk.gy)||1, dx=bk.gx/gl, dy=bk.gy/gl; const hits=[];
  for(const w of bk.wh){ const h=rayHit(w.x,w.y,dx,dy,6); if(h) hits.push(h); }
  if(!hits.length) return;
  const avgH=hits.reduce((s,h)=>s+h.t,0)/hits.length-P.WR; const fade=(alpha||1)*Math.max(0,1-avgH/4); if(fade<=0.01) return;
  let A=hits[0], B=hits[hits.length-1]; if(hits.length===2&&Math.abs(hits[0].t-hits[1].t)>2.2){ const n=hits[0].t<hits[1].t?hits[0]:hits[1]; A=n; B=n; }
  let ux=B.x-A.x, uy=B.y-A.y; const L=Math.hypot(ux,uy); if(L>1e-4){ ux/=L; uy/=L; } else { ux=-dy; uy=dx; }
  const ext=0.28+avgH*0.12, off=0.03; const ax=A.x-ux*ext-dx*off, ay=A.y-uy*ext-dy*off, bx=B.x+ux*ext-dx*off, by=B.y+uy*ext-dy*off;
  ctx.save(); ctx.lineCap='round'; ctx.strokeStyle='rgb(30,20,12)';
  for(const [w,a] of [[0.46+avgH*0.1,0.07],[0.3+avgH*0.07,0.1],[0.17+avgH*0.04,0.13]]){ ctx.globalAlpha=a*fade*BASE_A; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha=BASE_A;
}

// ---------- foreground ----------
function worldT(){ ctx.setTransform(DPR*SC,0,0,-DPR*SC,DPR*(W/2-cam.x*SC),DPR*(Hh/2+cam.y*SC)); }
function view(){ const hw=W/2/SC+2, hh=Hh/2/SC+2; return [cam.x-hw,cam.y-hh,cam.x+hw,cam.y+hh]; }
function segVisible(s,v){ return Math.max(s.x1,s.x2)>v[0]&&Math.min(s.x1,s.x2)<v[2]&&Math.max(s.y1,s.y2)>v[1]&&Math.min(s.y1,s.y2)<v[3]; }
function ringPath(pts){ ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath(); }
function drawGround(l,t){
  const [x0,y0,x1,y1]=l.bounds; const v=view();
  worldT();
  // paper-cut shadow: the whole terrain is offset a little and drawn soft behind itself
  ctx.save(); ctx.translate(0.16,-0.18); ctx.beginPath(); ctx.rect(x0-300,y0-300,x1-x0+600,y1-y0+600); for(const r of l.rings) if(!r.style) ringPath(r.pts);
  ctx.fillStyle=TH.cave?'rgba(8,14,32,.28)':'rgba(40,40,70,.13)'; ctx.fill('evenodd'); ctx.restore();
  ctx.beginPath(); ctx.rect(x0-300,y0-300,x1-x0+600,y1-y0+600);
  for(const r of l.rings) if(!r.style) ringPath(r.pts);
  if(PAT.setTransform && typeof DOMMatrix!=='undefined') PAT.setTransform(new DOMMatrix([1/(SC0*DPR),0,0,-1/(SC0*DPR),0,0]));
  ctx.fillStyle=PAT; ctx.fill('evenodd');
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.save(); ctx.clip('evenodd');
  // depth: lighter close to the surface, darker deeper down
  ctx.fillStyle=TH.cave?'rgba(8,14,34,.22)':'rgba(45,25,12,.16)'; ctx.fillRect(v[0],v[1],v[2]-v[0],v[3]-v[1]);
  ctx.beginPath(); for(const r of l.rings) if(!r.style) ringPath(r.pts);
  ctx.strokeStyle=TH.cave?'rgba(150,180,230,.08)':'rgba(255,232,196,.09)'; ctx.lineWidth=5.0; ctx.stroke(); ctx.lineWidth=2.6; ctx.stroke(); ctx.lineWidth=1.2; ctx.stroke();
  // soil strata
  ctx.beginPath(); for(let y=Math.floor(v[1]/1.9)*1.9; y<v[3]; y+=1.9){ for(let x=v[0]; x<=v[2]+0.5; x+=0.6){ const yy=y+0.22*Math.sin(x*0.42+y*1.7)+0.1*Math.sin(x*1.3+y); x===v[0]?ctx.moveTo(x,yy):ctx.lineTo(x,yy); } }
  ctx.strokeStyle=TH.cave?'rgba(10,20,50,.16)':'rgba(70,40,20,.11)'; ctx.lineWidth=0.11; ctx.stroke();
  // embedded boulders in different sizes
  for(const bo of l.vis.boulders){ if(bo.x<v[0]-1||bo.x>v[2]+1||bo.y<v[1]-1||bo.y>v[3]+1) continue; ctx.save(); ctx.translate(bo.x,bo.y); ctx.rotate(bo.a);
    ctx.globalAlpha=0.6; ctx.beginPath(); ctx.ellipse(0,0,bo.r*1.2,bo.r*0.85,0,0,6.28); ctx.fillStyle=TH.rock; ctx.fill(); ctx.strokeStyle=TH.edge; ctx.globalAlpha=0.25; ctx.lineWidth=0.04; ctx.stroke();
    ctx.globalAlpha=0.5; ctx.beginPath(); ctx.ellipse(-bo.r*0.3,bo.r*0.25,bo.r*0.6,bo.r*0.35,0,0,6.28); ctx.fillStyle=TH.rockLight; ctx.fill(); ctx.restore(); }
  ctx.globalAlpha=1;
  // roots under the grass
  if(l.vis.roots.length){ ctx.beginPath(); for(const rt of l.vis.roots){ if(rt[0][0]<v[0]-1||rt[0][0]>v[2]+1) continue; ctx.moveTo(rt[0][0],rt[0][1]); for(let k=1;k<rt.length;k++) ctx.lineTo(rt[k][0],rt[k][1]); }
    ctx.strokeStyle='rgba(74,46,26,.55)'; ctx.lineWidth=0.035; ctx.stroke(); }
  ctx.beginPath(); for(const r of l.rings) if(!r.style) ringPath(r.pts);
  ctx.strokeStyle=TH.cave?'rgba(10,18,40,.16)':'rgba(60,30,10,.10)'; ctx.lineWidth=2.4; ctx.stroke(); ctx.lineWidth=1.1; ctx.stroke();
  ctx.strokeStyle='rgba(255,246,228,.16)'; ctx.lineWidth=0.36; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); for(const r of l.rings) if(!r.style) ringPath(r.pts); ctx.strokeStyle=TH.edge; ctx.lineWidth=0.12; ctx.stroke();
  if(TH.kind==='neon'){ ctx.beginPath(); for(const r of l.rings) if(!r.style) ringPath(r.pts); ctx.strokeStyle=TH.top; for(const [w,al] of [[0.75,0.06],[0.42,0.11],[0.2,0.25],[0.07,0.95]]){ ctx.globalAlpha=al; ctx.lineWidth=w; ctx.stroke(); } ctx.globalAlpha=1; }
  // top band (grass / snow / rock rim)
  const tops=l.vis.tops.filter(s=>segVisible(s,v));
  const band=(s,off,depth)=>{ const tx=(s.x2-s.x1)/s.len, ty=(s.y2-s.y1)/s.len; const n=Math.max(2,Math.ceil(s.len/0.22));
    ctx.moveTo(s.x1+s.nx*off-tx*0.06,s.y1+s.ny*off-ty*0.06); ctx.lineTo(s.x2+s.nx*off+tx*0.06,s.y2+s.ny*off+ty*0.06);
    for(let i=n;i>=0;i--){ const u=i/n; const d=depth+0.07*Math.sin(u*s.len*14+s.x1); ctx.lineTo(s.x1+(s.x2-s.x1)*u-s.nx*d, s.y1+(s.y2-s.y1)*u-s.ny*d); } ctx.closePath(); };
  ctx.beginPath(); for(const s of tops) band(s,0.0,0.34); ctx.strokeStyle=TH.edge; ctx.lineWidth=0.08; ctx.stroke();
  ctx.fillStyle=TH.topDark; ctx.fill();
  ctx.beginPath(); for(const s of tops) band(s,-0.02,0.24); ctx.fillStyle=TH.top; ctx.fill();
  ctx.beginPath(); for(const s of tops){ ctx.moveTo(s.x1-s.nx*0.05,s.y1-s.ny*0.05); ctx.lineTo(s.x2-s.nx*0.05,s.y2-s.ny*0.05); } ctx.strokeStyle=TH.topLight; ctx.lineWidth=0.06; ctx.stroke();
  if(TH.kind==='grass'){ // blades
    ctx.beginPath(); for(const s of tops){ const tx=(s.x2-s.x1)/s.len, ty=(s.y2-s.y1)/s.len; for(const [d,h,r] of s.tufts){ const bx=s.x1+tx*d, by=s.y1+ty*d; const lean=(r-0.5)*0.1; const hh=h*0.75;
      ctx.moveTo(bx-tx*0.06,by-ty*0.06); ctx.lineTo(bx+s.nx*hh+tx*lean,by+s.ny*hh+ty*lean); ctx.lineTo(bx+tx*0.06,by+ty*0.06); } }
    ctx.fillStyle=TH.top; ctx.strokeStyle=TH.topDark; ctx.lineWidth=0.025; ctx.fill(); ctx.stroke(); }
  if(TH.kind==='snow'){ ctx.beginPath(); for(const s of tops){ const tx=(s.x2-s.x1)/s.len, ty=(s.y2-s.y1)/s.len; for(const [d,h,r] of s.tufts){ if(r<0.7) continue; const bx=s.x1+tx*d, by=s.y1+ty*d; ctx.moveTo(bx-s.nx*0.2+0.05,by-s.ny*0.2); ctx.arc(bx-s.nx*0.2,by-s.ny*0.2,0.05,0,6.28); } } ctx.fillStyle='#fff'; ctx.fill(); }
  // styled rings
  for(const r of l.rings){ if(!r.style) continue; drawStyled(r); }
}
function drawStyled(r){
  const p=r.pts; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const q of p){ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); }
  if(r.style==='steel'||r.style==='wood'){ drawBeam(r); return; }
  if(r.style==='crate'){
    ctx.beginPath(); ringPath(p); ctx.fillStyle='#b5824a'; ctx.fill();
    const bw=Math.min(0.13,(x1-x0)*0.12); ctx.fillStyle='#8f6232';
    ctx.fillRect(x0,y0,x1-x0,bw); ctx.fillRect(x0,y1-bw,x1-x0,bw); ctx.fillRect(x0,y0,bw,y1-y0); ctx.fillRect(x1-bw,y0,bw,y1-y0);
    ctx.strokeStyle='#8f6232'; ctx.lineWidth=bw*0.9; const n=Math.max(1,Math.round((x1-x0)/(y1-y0+0.001))); const cw=(x1-x0)/n;
    ctx.beginPath(); for(let i=0;i<n;i++){ const a0=x0+i*cw; ctx.moveTo(a0+bw,y0+bw); ctx.lineTo(a0+cw-bw,y1-bw); if(i>0){ ctx.moveTo(a0,y0); ctx.lineTo(a0,y1); } } ctx.stroke();
    ctx.strokeStyle='#d4a46b'; ctx.lineWidth=0.025; ctx.beginPath(); ctx.moveTo(x0+0.05,y1-0.04); ctx.lineTo(x1-0.05,y1-0.04); ctx.stroke();
    ctx.beginPath(); ringPath(p); ctx.strokeStyle=OUT; ctx.lineWidth=0.07; ctx.stroke();
    ctx.beginPath(); for(let i=0;i<n;i++){ const a0=x0+i*cw; ctx.rect(a0+bw*0.2,y0+bw*0.2,cw-bw*0.4,y1-y0-bw*0.4); } ctx.lineWidth=0.025; ctx.stroke();
  } else if(r.style==='stone'){
    ctx.beginPath(); ringPath(p); ctx.fillStyle='#8f949b'; ctx.fill();
    ctx.save(); ctx.clip(); const bh=0.42, bwid=0.62; ctx.strokeStyle='#4f545b'; ctx.lineWidth=0.04;
    for(let y=y0,row=0;y<y1;y+=bh,row++){ for(let x=x0-(row%2?bwid/2:0);x<x1;x+=bwid){ ctx.beginPath(); ctx.rect(x+0.02,y+0.02,bwid-0.04,bh-0.04); ctx.fillStyle=(Math.floor(x*7+row*3)%3)?'#9fa4ab':'#868b92'; ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(x+0.06,y+bh-0.12,bwid-0.16,0.05); } }
    ctx.restore(); ctx.beginPath(); ringPath(p); ctx.strokeStyle=OUT; ctx.lineWidth=0.08; ctx.stroke();
    ctx.fillStyle='#6f7680'; ctx.fillRect(x0-0.08,y1-0.16,x1-x0+0.16,0.16); ctx.strokeRect(x0-0.08,y1-0.16,x1-x0+0.16,0.16);
    if(TH.kind==='grass'){ ctx.beginPath(); ctx.moveTo(x0-0.06,y1); ctx.lineTo(x1+0.06,y1); ctx.strokeStyle=OUT; ctx.lineWidth=0.14; ctx.stroke(); ctx.strokeStyle='#5cb52f'; ctx.lineWidth=0.08; ctx.stroke(); }
  } else if(r.style==='log'){
    ctx.beginPath(); ringPath(p); ctx.fillStyle='#8a5a30'; ctx.fill(); ctx.strokeStyle=OUT; ctx.lineWidth=0.06; ctx.stroke();
    const cx=(x0+x1)/2, cy=(y0+y1)/2, rr=(x1-x0)/2; ctx.beginPath(); ctx.arc(cx,cy,rr*0.72,0,6.28); ctx.fillStyle='#d9ae73'; ctx.fill(); ctx.strokeStyle='#8a5a30'; ctx.lineWidth=0.03; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,rr*0.42,0,6.28); ctx.stroke(); ctx.beginPath(); ctx.arc(cx,cy,rr*0.15,0,6.28); ctx.stroke();

  }
}

// trä och stål ritas i balkens egen riktning (längsta kanten) och klipps mot formen, så att lutande plankor
// inte får ådring/fackverk utanför sig. Vågräta rektanglar blir exakt som förut (vinkel 0).
function drawBeam(r){ const p=r.pts; let ang=0, best=-1, cx=0, cy=0;
  for(let i=0;i<p.length;i++){ const a=p[i], b=p[(i+1)%p.length], L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L>best){ best=L; ang=Math.atan2(b[1]-a[1],b[0]-a[0]); } cx+=a[0]; cy+=a[1]; }
  cx/=p.length; cy/=p.length; if(ang>Math.PI/2) ang-=Math.PI; else if(ang<=-Math.PI/2) ang+=Math.PI;
  if(Math.abs(ang)<1e-3) ang=0;
  const c=Math.cos(ang), s=Math.sin(ang); let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const q of p){ const u=(q[0]-cx)*c+(q[1]-cy)*s, v=-(q[0]-cx)*s+(q[1]-cy)*c; x0=Math.min(x0,u); x1=Math.max(x1,u); y0=Math.min(y0,v); y1=Math.max(y1,v); }
  const local=()=>{ ctx.translate(cx,cy); ctx.rotate(ang); };
  if(r.style==='steel'){
    if(x1-x0>1.2){ ctx.save(); local(); const d=0.75; ctx.lineWidth=0.09; ctx.strokeStyle=OUT;   // fackverk under balken
      ctx.beginPath(); ctx.moveTo(x0+0.2,y0-d); ctx.lineTo(x1-0.2,y0-d); const n=Math.max(1,Math.round((x1-x0)/1.4)); for(let i=0;i<=n;i++){ const x=x0+0.2+(x1-x0-0.4)*i/n; ctx.moveTo(x,y0); ctx.lineTo(x,y0-d); if(i<n){ const x2=x0+0.2+(x1-x0-0.4)*(i+1)/n; ctx.moveTo(x,y0-d); ctx.lineTo(x2,y0); } }
      ctx.stroke(); ctx.strokeStyle='#796555'; ctx.lineWidth=0.05; ctx.stroke(); ctx.restore(); }
    const metal=ctx.createLinearGradient(0,y0,0,y1); metal.addColorStop(0,'#493e38'); metal.addColorStop(.45,'#886a50'); metal.addColorStop(1,'#b49d77');
    ctx.beginPath(); ringPath(p); ctx.save(); local(); ctx.fillStyle=metal; ctx.fill(); ctx.restore(); ctx.strokeStyle=OUT; ctx.lineWidth=0.07; ctx.stroke();   // vägen byggs i världen, gradienten tolkas i balkens riktning
    ctx.save(); ctx.beginPath(); ringPath(p); ctx.clip(); local();
    ctx.beginPath(); ctx.moveTo(x0+0.05,y1-0.06); ctx.lineTo(x1-0.05,y1-0.06); ctx.strokeStyle='#e0c89b'; ctx.lineWidth=0.04; ctx.stroke();
    ctx.fillStyle='#7a1d17'; for(let x=x0+0.25;x<x1-0.1;x+=0.5){ ctx.beginPath(); ctx.arc(x,(y0+y1)/2,0.035,0,6.28); ctx.fill(); }
    ctx.restore(); return; }
  ctx.beginPath(); ringPath(p); ctx.fillStyle='#a0703f'; ctx.fill(); ctx.strokeStyle=OUT; ctx.lineWidth=0.07; ctx.stroke();
  ctx.save(); ctx.beginPath(); ringPath(p); ctx.clip(); local();
  ctx.strokeStyle='#7a5230'; ctx.lineWidth=0.025; ctx.beginPath(); for(let x=x0+0.9;x<x1;x+=1.1){ ctx.moveTo(x,y0+0.03); ctx.lineTo(x,y1-0.03); } ctx.moveTo(x0+0.1,(y0+y1)/2); ctx.lineTo(x1-0.1,(y0+y1)/2+0.01); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0+0.05,y1-0.04); ctx.lineTo(x1-0.05,y1-0.04); ctx.strokeStyle='#c99a62'; ctx.lineWidth=0.03; ctx.stroke();
  ctx.restore(); }

// ---------- bike ----------
function lw(g,c,w){ g.strokeStyle=c; g.lineWidth=w; }
function strokeLine(pts,col,w,outW){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  if(outW){ ctx.strokeStyle=OUT; ctx.lineWidth=w+outW; ctx.stroke(); } ctx.strokeStyle=col; ctx.lineWidth=w; ctx.stroke(); }
// ===================== BIKE + RIDER ART =====================
const BK={STEER_TOP:[0.56,0.34], STEER_BOT:[0.63,0.15], PIVOT:[-0.1,-0.3], SHOCK_TOP:[-0.17,0.1], CSHAFT:[-0.02,-0.33]};
// Cykel + förare: ren grön/vit/svart (Marcus). Neon skriver över i COL_NEON.
const COL={teal:'#3fae37', tealD:'#257a22', frameK:'#1f2228', frameK2:'#33373f', goldD:'#2a2e36', alu2:'#e3e7ec', green:'#3fae37', greenL:'#7fd877', greenD:'#257a22', white:'#f6f7f4', whiteD:'#cfd3d8', black:'#1b1d22', blackL:'#3a3f47',
  chrome:'#dfe3e8', chromeD:'#9aa2ab', alu:'#c3c9d0', gold:'#f2f3f0', red:'#3fae37',
  jersey:'#f4f5f2', jerseyD:'#c4cad0', jerseyL:'#ffffff', pants:'#1d2026', pantsL:'#30343c', boot:'#15171b', bootL:'#3a3f48', skin:'#f0c9a0',
  helmet:'#f6f7f4', helmetL:'#ffffff', helmetD:'#1b1d22', lens0:'#8fe08a', lens1:'#2f7a2c'};
const COL_CARTOON=Object.assign({},COL);
const COL_NEON={helmet:'#2a1458', helmetL:'#3a1c78', helmetD:'#ff3ea5', lens0:'#3ef2f2', lens1:'#b583d9', green:'#ff3ea5', greenL:'#ff9ad0', greenD:'#a8176b', teal:'#3ef2f2', tealD:'#1fb8b8', gold:'#3ef2f2', goldD:'#1fb8b8', red:'#ffe66d', jersey:'#3b2a86', jerseyD:'#2a1c66', jerseyL:'#5b46c0', white:'#f4eaff'};
function applyStyleColors(){ Object.assign(COL, COL_CARTOON); if(STYLE==='neon') Object.assign(COL, COL_NEON); }
function P2(p,q,t){ return [p[0]+(q[0]-p[0])*t, p[1]+(q[1]-p[1])*t]; }
function mid(p,q){ return [(p[0]+q[0])/2,(p[1]+q[1])/2]; }
function outl(w){ ctx.strokeStyle=OUT; ctx.lineWidth=w||0.032; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.stroke(); }
function poly2(pts,fill,w){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(w!==0) outl(w); }
// smooth closed shape: corners listed; each corner may be [x,y,'s'] for sharp
function smooth(pts,fill,w){ const n=pts.length; ctx.beginPath();
  const m=i=>mid(pts[(i+n)%n],pts[(i+1+n)%n]); let s=m(n-1); ctx.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){ const p=pts[i], e=m(i); if(p[2]==='s'){ ctx.lineTo(p[0],p[1]); ctx.lineTo(e[0],e[1]); } else ctx.quadraticCurveTo(p[0],p[1],e[0],e[1]); }
  ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(w!==0) outl(w); }
function limb(a,b,wa,wb,fill,w){ const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1e-6, ux=dx/L, uy=dy/L, nx=-uy, ny=ux, tn=Math.atan2(ny,nx);
  ctx.beginPath(); ctx.moveTo(a[0]+nx*wa,a[1]+ny*wa); ctx.lineTo(b[0]+nx*wb,b[1]+ny*wb); ctx.arc(b[0],b[1],wb,tn,tn-Math.PI,true); ctx.lineTo(a[0]-nx*wa,a[1]-ny*wa); ctx.arc(a[0],a[1],wa,tn+Math.PI,tn,true); ctx.closePath();
  if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(w!==0) outl(w); }
function tube(a,b,w,col,ow){ ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineCap='round'; ctx.strokeStyle=OUT; ctx.lineWidth=w+(ow==null?0.045:ow); ctx.stroke(); ctx.strokeStyle=col; ctx.lineWidth=w; ctx.stroke(); }
function ik(a,b,l1,l2,bend){ let dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1e-6; const dm=Math.min(d,l1+l2-0.001); const ux=dx/d, uy=dy/d;
  const x=(dm*dm+l1*l1-l2*l2)/(2*dm), h=Math.sqrt(Math.max(0,l1*l1-x*x)); return [a[0]+ux*x-uy*h*bend, a[1]+uy*x+ux*h*bend]; }
function toW(lx,ly,sx){ const b=bike.b,c=Math.cos(b.a),s=Math.sin(b.a); lx*=sx; return [b.x+lx*c-ly*s,b.y+lx*s+ly*c]; }

function drawWheel(w,front,pos,sq,ang){
  ctx.save(); ctx.translate(pos?pos[0]:w.x,pos?pos[1]:w.y); if(sq&&sq<0.999){ ctx.rotate(ang); ctx.scale(sq,1); ctx.rotate(-ang); } ctx.rotate(w.a);
  // knobby tyre
  ctx.beginPath(); const K=22;
  for(let i=0;i<K;i++){ const a=i*2*Math.PI/K; const a1=a-0.06,a2=a+0.06,a3=a+0.13,a4=a+2*Math.PI/K-0.13;
    ctx.lineTo(Math.cos(a1)*0.425,Math.sin(a1)*0.425); ctx.lineTo(Math.cos(a2)*0.425,Math.sin(a2)*0.425); ctx.lineTo(Math.cos(a3)*0.39,Math.sin(a3)*0.39); ctx.lineTo(Math.cos(a4)*0.39,Math.sin(a4)*0.39); }
  ctx.closePath(); const rubber=ctx.createRadialGradient(-.12,.14,.03,0,0,.44);rubber.addColorStop(0,'#626365');rubber.addColorStop(.65,'#292d30');rubber.addColorStop(1,'#151b1e');ctx.fillStyle=rubber; ctx.fill(); outl(0.022);
  ctx.beginPath(); ctx.arc(0,0,0.355,0,6.2832); ctx.strokeStyle='#353a42'; ctx.lineWidth=0.03; ctx.stroke();
  // rim
  ctx.beginPath(); ctx.arc(0,0,0.31,0,6.2832); ctx.fillStyle='#2b3037'; ctx.fill();
  ctx.beginPath(); ctx.arc(0,0,0.295,0,6.2832); ctx.strokeStyle=COL.chrome; ctx.lineWidth=0.04; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,0.272,0,6.2832); ctx.strokeStyle=COL.chromeD; ctx.lineWidth=0.012; ctx.stroke();
  // spokes (crossed)
  const spin=Math.min(1,Math.abs(w.w||0)/16);
  if(spin>0.15){ ctx.beginPath(); ctx.arc(0,0,0.2,0,6.2832); ctx.strokeStyle='rgba(205,212,220,'+(0.18+spin*0.3)+')'; ctx.lineWidth=0.13; ctx.stroke(); }
  ctx.globalAlpha=BASE_A*(1-spin*0.75);
  ctx.beginPath(); for(let i=0;i<16;i++){ const a=i*Math.PI/8; const off=(i%2?0.5:-0.5); ctx.moveTo(Math.cos(a)*0.06,Math.sin(a)*0.06); ctx.lineTo(Math.cos(a+off)*0.268,Math.sin(a+off)*0.268); }
  ctx.strokeStyle='#c3c9d0'; ctx.lineWidth=0.011; ctx.stroke(); ctx.globalAlpha=BASE_A;
  if(front){ // brake disc
    ctx.beginPath(); for(let i=0;i<12;i++){ const a=i*Math.PI/6; ctx.lineTo(Math.cos(a)*0.165,Math.sin(a)*0.165); ctx.lineTo(Math.cos(a+0.26)*0.15,Math.sin(a+0.26)*0.15); }
    ctx.closePath(); ctx.fillStyle='#b8bfc7'; ctx.fill(); outl(0.018);
    ctx.fillStyle='#6f7780'; for(let i=0;i<6;i++){ const a=i*Math.PI/3+0.3; ctx.beginPath(); ctx.arc(Math.cos(a)*0.115,Math.sin(a)*0.115,0.014,0,6.28); ctx.fill(); }
  } else { // sprocket
    ctx.beginPath(); for(let i=0;i<20;i++){ const a=i*Math.PI/10; ctx.lineTo(Math.cos(a)*0.175,Math.sin(a)*0.175); ctx.lineTo(Math.cos(a+0.16)*0.155,Math.sin(a+0.16)*0.155); }
    ctx.closePath(); ctx.fillStyle=COL.gold; ctx.fill(); outl(0.018);
    ctx.fillStyle='#9a7420'; for(let i=0;i<5;i++){ const a=i*Math.PI*0.4; ctx.beginPath(); ctx.arc(Math.cos(a)*0.1,Math.sin(a)*0.1,0.022,0,6.28); ctx.fill(); }
  }
  ctx.beginPath(); ctx.arc(0,0,0.065,0,6.28); ctx.fillStyle=COL.alu; ctx.fill(); outl(0.02);
  ctx.beginPath(); ctx.arc(0,0,0.025,0,6.28); ctx.fillStyle='#4b525b'; ctx.fill();
  ctx.restore();
}
function paperT(b,sx,fl,sgn){ ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.a); ctx.transform(sx,0,0,1+0.03*fl,0,0); ctx.lineJoin='round'; ctx.lineCap='round'; }

function drawBikeBody(){
  // slim trials frame: dark twin spars, visible tubes
  tube([0.6,0.24],[0.34,-0.18],0.05,COL.frameK); tube([0.34,-0.18],[0.08,-0.46],0.045,COL.frameK); tube([0.08,-0.46],[-0.12,-0.3],0.045,COL.frameK);
  tube([0.58,0.3],[-0.12,0.1],0.06,COL.frameK); tube([-0.12,0.1],[-0.12,-0.3],0.06,COL.frameK); tube([-0.12,0.08],[-0.62,0.3],0.032,COL.frameK); tube([-0.12,-0.1],[-0.56,0.26],0.028,COL.frameK);
  ctx.beginPath(); ctx.moveTo(0.55,0.28); ctx.lineTo(-0.08,0.11); ctx.strokeStyle='#5a616d'; ctx.lineWidth=0.014; ctx.stroke();
  // compact engine + skid plate
  smooth([[-0.14,-0.16],[0.14,-0.13],[0.3,-0.2],[0.29,-0.4],[0.12,-0.48],[-0.1,-0.45],[-0.19,-0.32]],'#2f343c',0.028);
  smooth([[0.06,-0.18],[0.15,0.02],[0.32,0.0],[0.29,-0.21]],'#4a5059',0.026);
  ctx.strokeStyle='#636a74'; ctx.lineWidth=0.012; ctx.beginPath(); for(let i=0;i<5;i++){ const t=0.12+i*0.17; const p=P2([0.06,-0.18],[0.15,0.02],t), q=P2([0.29,-0.21],[0.32,0.0],t); ctx.moveTo(p[0],p[1]); ctx.lineTo(q[0],q[1]); } ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.03,-0.32,0.1,0.092,0,0,6.28); ctx.fillStyle='#b9c0c8'; ctx.fill(); outl(0.022);
  ctx.beginPath(); ctx.ellipse(0.02,-0.31,0.05,0.046,0,0,6.28); ctx.fillStyle='#e2e6ea'; ctx.fill();
  smooth([[-0.16,-0.47,'s'],[0.24,-0.47],[0.34,-0.38,'s'],[0.3,-0.36],[0.2,-0.43],[-0.14,-0.43,'s']],'#9aa1aa',0.022);
  // exhaust: high header over the engine to a short silencer
  ctx.beginPath(); ctx.moveTo(0.3,-0.04); ctx.bezierCurveTo(0.42,0.05,0.3,0.16,0.12,0.12); ctx.bezierCurveTo(-0.05,0.08,-0.2,0.0,-0.3,0.06);
  ctx.strokeStyle=OUT; ctx.lineWidth=0.068; ctx.stroke(); ctx.strokeStyle='#c9ced5'; ctx.lineWidth=0.04; ctx.stroke(); ctx.strokeStyle='#f0f3f5'; ctx.lineWidth=0.011; ctx.stroke();
  smooth([[-0.28,0.12],[-0.72,0.26],[-0.74,0.15],[-0.3,0.0]],COL.alu,0.026);
  smooth([[-0.71,0.27,'s'],[-0.79,0.25],[-0.79,0.16],[-0.72,0.14,'s']],'#24272d',0.022);
  // short kicked-up rear fender
  smooth([[-0.46,0.36,'s'],[-0.72,0.39],[-0.98,0.46,'s'],[-0.97,0.41,'s'],[-0.71,0.33],[-0.47,0.3,'s']],'#1d2026',0.024);
  ctx.beginPath(); ctx.moveTo(-0.55,0.37); ctx.lineTo(-0.9,0.43); ctx.strokeStyle=COL.green; ctx.lineWidth=0.016; ctx.stroke();
  // small seat pad
  smooth([[-0.04,0.35,'s'],[-0.3,0.38],[-0.52,0.4,'s'],[-0.53,0.34,'s'],[-0.3,0.31],[-0.05,0.29,'s']],'#15171b',0.024);
  // small green tank / airbox cover with a sharp graphic
  smooth([[0.52,0.38],[0.26,0.4],[-0.02,0.3,'s'],[0.02,0.15],[0.2,0.08],[0.38,0.02,'s'],[0.5,0.16]],COL.green,0.03);
  ctx.save(); smooth([[0.52,0.38],[0.26,0.4],[-0.02,0.3,'s'],[0.02,0.15],[0.2,0.08],[0.38,0.02,'s'],[0.5,0.16]],null,0); ctx.clip();
  ctx.fillStyle='#1d2026'; ctx.beginPath(); ctx.moveTo(-0.05,0.2); ctx.lineTo(0.55,0.32); ctx.lineTo(0.55,0.2); ctx.lineTo(0.2,0.0); ctx.lineTo(-0.05,0.08); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.moveTo(0.05,0.24); ctx.lineTo(0.5,0.33); ctx.lineTo(0.5,0.3); ctx.lineTo(0.06,0.21); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(0.04,0.31); ctx.quadraticCurveTo(0.28,0.38,0.48,0.36); ctx.strokeStyle='#8ee38a'; ctx.lineWidth=0.02; ctx.stroke();
  // small front fender close to the tyre
  smooth([[0.64,0.1,'s'],[0.96,0.1],[1.2,0.02,'s'],[1.18,-0.03,'s'],[0.95,0.03],[0.66,0.04,'s']],'#1d2026',0.026);
  // foot peg
  poly2([[-0.14,-0.42],[0.06,-0.42],[0.06,-0.46],[-0.14,-0.46]],'#9aa1aa',0.02);
}
function drawForkAndBars(sx,fw){
  const top=toW(BK.STEER_TOP[0],BK.STEER_TOP[1],sx), ax=[fw.x,fw.y]; const dx=ax[0]-top[0], dy=ax[1]-top[1], L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L, nx=-uy, ny=ux;
  const upEnd=[top[0]+ux*Math.min(L*0.6,0.58), top[1]+uy*Math.min(L*0.6,0.58)];
  limb(top,upEnd,0.046,0.046,COL.chrome,0.028);
  ctx.beginPath(); ctx.moveTo(top[0]+nx*0.02,top[1]+ny*0.02); ctx.lineTo(upEnd[0]+nx*0.02,upEnd[1]+ny*0.02); ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.012; ctx.stroke();
  const low0=[ax[0]-ux*Math.max(0.36,L*0.47), ax[1]-uy*Math.max(0.36,L*0.47)];
  limb(low0,ax,0.058,0.052,'#2c3038',0.028);
  ctx.beginPath(); ctx.moveTo(low0[0]+nx*0.026,low0[1]+ny*0.026); ctx.lineTo(ax[0]-ux*0.1+nx*0.026,ax[1]-uy*0.1+ny*0.026); ctx.strokeStyle='#4f5662'; ctx.lineWidth=0.012; ctx.stroke();
  const cal=[ax[0]-ux*0.12-nx*0.1, ax[1]-uy*0.12-ny*0.1]; ctx.beginPath(); ctx.ellipse(cal[0],cal[1],0.045,0.032,Math.atan2(uy,ux),0,6.28); ctx.fillStyle='#9aa1aa'; ctx.fill(); outl(0.016);
  ctx.beginPath(); ctx.arc(ax[0],ax[1],0.038,0,6.28); ctx.fillStyle=COL.alu; ctx.fill(); outl(0.016);
  const bot=toW(BK.STEER_BOT[0],BK.STEER_BOT[1],sx);
  tube([top[0]-nx*0.08,top[1]-ny*0.08],[top[0]+nx*0.08,top[1]+ny*0.08],0.05,'#2b2f36',0.028);
  tube([bot[0]-nx*0.07,bot[1]-ny*0.07],[bot[0]+nx*0.09,bot[1]+ny*0.09],0.05,'#2b2f36',0.028);
}
function drawBars(){
  // tall trials risers and a wide bar
  tube([0.56,0.36],[0.49,0.56],0.04,'#2b2f36',0.028);
  tube([0.35,0.6],[0.6,0.56],0.04,'#3a3f47',0.026);
  // small number board
  smooth([[0.62,0.37,'s'],[0.8,0.5],[0.77,0.58,'s'],[0.62,0.5],[0.56,0.42,'s']],'#1d2026',0.026);
  ctx.beginPath(); ctx.moveTo(0.63,0.42); ctx.lineTo(0.76,0.53); ctx.strokeStyle=COL.green; ctx.lineWidth=0.026; ctx.stroke();
}
function shade(hex,f){ const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,bb=n&255; r=Math.round(r*f); g=Math.round(g*f); bb=Math.round(bb*f); return 'rgb('+r+','+g+','+bb+')'; }
function riderLeg(p,far){ const dk=far?0.62:1;
  const {hip,knee,ankle,foot}=p;
  limb(hip,knee,0.13,0.095,shade(COL.pants,dk),0.032);
  if(!far){ limb(P2(hip,knee,0.15),P2(hip,knee,0.85),0.055,0.042,COL.pantsL,0);
    const hk=[knee[0]-hip[0],knee[1]-hip[1]], hl=Math.hypot(hk[0],hk[1])||1; ctx.beginPath(); ctx.moveTo(hip[0]-hk[1]/hl*0.1,hip[1]+hk[0]/hl*0.1); ctx.lineTo(knee[0]-hk[1]/hl*0.075,knee[1]+hk[0]/hl*0.075); ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=0.022; ctx.stroke(); }
  const b0=P2(knee,ankle,0.2);
  limb(b0,ankle,0.084,0.078,shade(COL.boot,far?0.8:1),0.03);
  smooth([[ankle[0]-0.09,ankle[1]+0.07],[ankle[0]+0.08,ankle[1]+0.05],[foot[0]+0.18,foot[1]+0.01,'s'],[foot[0]+0.18,foot[1]-0.056,'s'],[foot[0]-0.14,foot[1]-0.056,'s'],[foot[0]-0.13,foot[1]+0.03]],shade(COL.boot,far?0.8:1),0.03);
  if(!far){
    const kd=[ankle[0]-knee[0],ankle[1]-knee[1]], kl=Math.hypot(kd[0],kd[1])||1, kn=[-kd[1]/kl,kd[0]/kl];
    for(const t of [0.5,0.74]){ const q=P2(knee,ankle,t); tube([q[0]-kn[0]*0.07,q[1]-kn[1]*0.07],[q[0]+kn[0]*0.066,q[1]+kn[1]*0.066],0.016,'#5a616d',0.014); }
    poly2([[foot[0]-0.14,foot[1]-0.056],[foot[0]+0.18,foot[1]-0.056],[foot[0]+0.18,foot[1]-0.03],[foot[0]-0.14,foot[1]-0.03]],'#4a515b',0);
    // dark knee pad
    limb(P2(knee,hip,0.12),P2(knee,ankle,0.22),0.078,0.066,'#3a3f48',0.026);
    limb(P2(knee,hip,0.06),P2(knee,ankle,0.12),0.03,0.026,'#5a616d',0);
  }
}
function riderArm(p,far){ const dk=far?0.6:1; const {sh,elbow,grip}=p;
  limb(sh,elbow,0.082,0.068,shade(COL.jersey,dk),0.03);
  if(!far){ ctx.beginPath(); ctx.moveTo(...P2(sh,elbow,0.3)); ctx.lineTo(...P2(sh,elbow,0.75)); ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=0.024; ctx.stroke(); }
  limb(elbow,grip,0.062,0.05,shade(COL.jersey,dk),0.028);
  if(!far){ const q=P2(elbow,grip,0.5); ctx.beginPath(); ctx.arc(q[0],q[1],0.012,0,6.28); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(grip[0]+0.01,grip[1],0.072,0.06,-0.2,0,6.28); ctx.fillStyle=far?'#121418':'#1a1c21'; ctx.fill(); outl(0.022);
  if(!far){ ctx.beginPath(); ctx.ellipse(grip[0]+0.016,grip[1]+0.028,0.036,0.018,-0.2,0,6.28); ctx.fillStyle='#3a3f48'; ctx.fill(); }
}
function riderBody(p,helmetRot){
  const {hip,sh,head}=p;
  const ux=sh[0]-hip[0], uy=sh[1]-hip[1], L=Math.hypot(ux,uy)||1, u=[ux/L,uy/L], n=[-u[1],u[0]];
  const T=(q,s2,f2)=>[q[0]+n[0]*s2+u[0]*f2, q[1]+n[1]*s2+u[1]*f2];
  ctx.beginPath(); ctx.ellipse(hip[0]-0.02,hip[1]-0.01,0.16,0.12,Math.atan2(u[1],u[0])-Math.PI/2,0,6.28); ctx.fillStyle=COL.pants; ctx.fill(); outl(0.03);
  // padded jacket
  const tor=[T(hip,0.15,-0.04),T(mid(hip,sh),0.19,0),T(sh,0.15,0.06),T(sh,-0.03,0.13),T(sh,-0.16,0.0),T(mid(hip,sh),-0.17,0),T(hip,-0.13,-0.06)];
  smooth(tor,COL.jersey,0.032);
  ctx.save(); smooth(tor,null,0); ctx.clip();
  ctx.fillStyle=COL.jerseyD; ctx.beginPath(); ctx.moveTo(...T(hip,-0.25,-0.1)); ctx.lineTo(...T(sh,-0.25,0.1)); ctx.lineTo(...T(sh,-0.06,0.1)); ctx.lineTo(...T(hip,-0.03,-0.1)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(10,14,30,.35)'; ctx.lineWidth=0.016; ctx.beginPath(); for(let k=1;k<4;k++){ const a1=T(P2(hip,sh,k/4),0.25,0), a2=T(P2(hip,sh,k/4),-0.25,0); ctx.moveTo(a1[0],a1[1]); ctx.lineTo(a2[0],a2[1]); } ctx.stroke();
  ctx.fillStyle=COL.jerseyL; ctx.beginPath(); ctx.moveTo(...T(mid(hip,sh),0.16,-0.05)); ctx.lineTo(...T(sh,0.13,0.0)); ctx.lineTo(...T(sh,0.07,0.0)); ctx.lineTo(...T(mid(hip,sh),0.1,-0.05)); ctx.closePath(); ctx.fill();
  ctx.restore();
  // belt line
  limb(T(hip,0.14,-0.05),T(hip,-0.12,-0.07),0.05,0.05,COL.pants,0.026);
  // teal neck gaiter / collar
  smooth([T(sh,0.1,0.04),T(sh,0.12,0.14),T(sh,-0.02,0.2),T(sh,-0.12,0.12),T(sh,-0.1,0.03)],COL.teal,0.026);
  drawHelmet(head[0],head[1],helmetRot||0);
}
function drawHelmet(hx,hy,rot){
  ctx.save(); ctx.translate(hx,hy); if(rot) ctx.rotate(rot); ctx.scale(0.88,0.88);
  const NAVY=COL.helmet, NAVYL=COL.helmetL;
  const shell=()=>{ ctx.beginPath(); ctx.moveTo(-0.2,-0.12); ctx.bezierCurveTo(-0.29,0.06,-0.15,0.25,0.04,0.25); ctx.bezierCurveTo(0.2,0.25,0.28,0.13,0.29,0.04);
    ctx.quadraticCurveTo(0.36,-0.06,0.34,-0.14); ctx.quadraticCurveTo(0.31,-0.23,0.2,-0.25); ctx.lineTo(0.05,-0.25); ctx.quadraticCurveTo(-0.12,-0.24,-0.2,-0.12); ctx.closePath(); };
  shell(); ctx.fillStyle=NAVY; ctx.fill();
  ctx.save(); shell(); ctx.clip();
  ctx.fillStyle=NAVYL; ctx.beginPath(); ctx.ellipse(-0.06,0.14,0.2,0.1,-0.3,0,6.28); ctx.fill();
  ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.55; ctx.beginPath(); ctx.ellipse(-0.08,0.17,0.09,0.03,-0.35,0,6.28); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle=COL.teal; ctx.beginPath(); ctx.moveTo(-0.3,-0.02); ctx.quadraticCurveTo(-0.1,0.1,0.1,0.14); ctx.lineTo(0.08,0.17); ctx.quadraticCurveTo(-0.12,0.13,-0.3,0.02); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.moveTo(-0.32,-0.06); ctx.quadraticCurveTo(0.0,-0.12,0.4,-0.08); ctx.lineTo(0.4,-0.3); ctx.lineTo(-0.32,-0.3); ctx.closePath(); ctx.fill();
  ctx.restore();
  shell(); outl(0.032);
  // chin-bar grille
  ctx.fillStyle=COL.helmetD; ctx.beginPath(); ctx.ellipse(0.25,-0.16,0.05,0.035,-0.3,0,6.28); ctx.fill();
  ctx.strokeStyle='#4a5470'; ctx.lineWidth=0.008; ctx.beginPath(); for(let k=-1;k<=1;k++){ ctx.moveTo(0.21,-0.16+k*0.016); ctx.lineTo(0.29,-0.17+k*0.016); } ctx.stroke();
  // goggles: dark frame, mirrored teal-violet lens, strap
  ctx.beginPath(); ctx.moveTo(-0.24,0.03); ctx.quadraticCurveTo(-0.05,0.06,0.12,0.04); ctx.strokeStyle=OUT; ctx.lineWidth=0.06; ctx.stroke(); ctx.strokeStyle=COL.helmetD; ctx.lineWidth=0.034; ctx.stroke();
  smooth([[0.1,0.1],[0.31,0.08],[0.33,-0.06],[0.1,-0.06]],'#121620',0.024);
  ctx.save(); smooth([[0.13,0.075],[0.3,0.055],[0.31,-0.04],[0.13,-0.035]],null,0); ctx.clip();
  const lg=ctx.createLinearGradient(0.13,0.07,0.3,-0.04); lg.addColorStop(0,COL.lens0); lg.addColorStop(1,COL.lens1); ctx.fillStyle=lg; ctx.fillRect(0.1,-0.1,0.25,0.2);
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(0.15,0.065); ctx.lineTo(0.2,0.06); ctx.lineTo(0.16,0.0); ctx.closePath(); ctx.fill();
  ctx.restore();
  // short peak
  smooth([[-0.02,0.21,'s'],[0.34,0.19,'s'],[0.29,0.12,'s'],[0.06,0.15]],COL.helmetD,0.026);
  ctx.beginPath(); ctx.moveTo(0.03,0.19); ctx.lineTo(0.3,0.17); ctx.strokeStyle=COL.teal; ctx.lineWidth=0.016; ctx.stroke();
  ctx.restore();
}
function farOf(p){ const o=(q)=>[q[0]+0.045,q[1]+0.035]; return {hip:o(p.hip),knee:o(p.knee),ankle:o(p.ankle),foot:o(p.foot),sh:o(p.sh),elbow:o(p.elbow),grip:o(p.grip)}; }
function drawRagdoll(rd){
  const sg=rd.sg, q=rd.pts, M=k=>[q[k].x*sg,q[k].y];
  const head=M('head'), sh=M('sh'), hip=M('hip'), knee=M('knee'), foot=M('foot'), elbow=M('elbow'), hand=M('hand');
  const p={head,sh,hip,knee,foot,ankle:P2(knee,foot,0.78),elbow,grip:hand};
  const rot=Math.atan2(head[1]-sh[1],head[0]-sh[0])-Math.atan2(0.23,0.08);
  ctx.save(); ctx.scale(sg,1); ctx.lineJoin='round'; ctx.lineCap='round';
  riderLeg(farOf(p),true); riderArm(farOf(p),true); riderLeg(p,false); riderBody(p,rot); riderArm(p,false);
  ctx.restore();
}
function drawBike(dt){
  const f=facing(bike), sgn=f>=0?1:-1, flipping=bike.flipT>=0;
  const prog=flipping?Math.min(1,bike.flipT/P.FLIP_T):0, fl=Math.sin(Math.PI*prog);
  // the turn is drawn as a yaw: the whole bike swings round its vertical axis, wheels slide past each other
  const k=flipping?f*bike.flipFrom:1, sx=Math.max(0.16,Math.abs(f))*sgn;
  const b=bike.b, c=Math.cos(b.a), s=Math.sin(b.a);
  let rearW,frontW,rearPos,frontPos,sq=1;
  if(flipping){ rearW=bike.wh[bike.flipFrom===1?0:1]; frontW=bike.wh[bike.flipFrom===1?1:0];
    const vis=w=>{ const dx=w.x-b.x, dy=w.y-b.y, lx=dx*c+dy*s, ly=-dx*s+dy*c, X=lx*k; return [b.x+X*c-ly*s, b.y+X*s+ly*c]; };
    rearPos=vis(rearW); frontPos=vis(frontW); sq=Math.max(0.16,Math.abs(k)); }
  else { rearW=bike.wh[bike.dir===1?0:1]; frontW=bike.wh[bike.dir===1?1:0]; rearPos=[rearW.x,rearW.y]; frontPos=[frontW.x,frontW.y]; }
  const lift=0.08*fl, gl=Math.hypot(bike.gx,bike.gy)||1;
  ctx.save(); ctx.translate(-bike.gx/gl*lift,-bike.gy/gl*lift);
  // soft motion arcs while turning
  if(fl>0.05){ ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.a); ctx.globalAlpha=BASE_A*0.35*fl; ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.05; ctx.lineCap='round';
    for(const yy of [-0.35,0.25]){ ctx.beginPath(); ctx.ellipse(0,yy,1.15,0.16,0,prog*Math.PI*2-0.9,prog*Math.PI*2+0.9); ctx.stroke(); } ctx.restore(); ctx.globalAlpha=BASE_A; }
  drawWheel(rearW,false,rearPos,sq,b.a); drawWheel(frontW,true,frontPos,sq,b.a);
  const piv=toW(BK.PIVOT[0],BK.PIVOT[1],sx), cs=toW(BK.CSHAFT[0],BK.CSHAFT[1],sx), shT=toW(BK.SHOCK_TOP[0],BK.SHOCK_TOP[1],sx);
  { const ax=rearPos, dx=ax[0]-cs[0], dy=ax[1]-cs[1], L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, r1=0.06*sq, r2=0.17*sq;
    ctx.beginPath(); ctx.moveTo(cs[0]+nx*r1,cs[1]+ny*r1); ctx.lineTo(ax[0]+nx*r2,ax[1]+ny*r2); ctx.moveTo(cs[0]-nx*r1,cs[1]-ny*r1); ctx.lineTo(ax[0]-nx*r2,ax[1]-ny*r2);
    ctx.strokeStyle='#2b2f36'; ctx.lineWidth=0.03; ctx.stroke(); }
  limb(piv,rearPos,0.075,0.055,COL.alu,0.032);
  { const p=piv, q=rearPos, dx=q[0]-p[0], dy=q[1]-p[1], L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L; ctx.beginPath(); ctx.moveTo(p[0]+nx*0.03,p[1]+ny*0.03); ctx.lineTo(q[0]+nx*0.02-dx/L*0.08,q[1]+ny*0.02-dy/L*0.08); ctx.strokeStyle='#e6eaee'; ctx.lineWidth=0.014; ctx.stroke(); }
  const sm=P2(piv,rearPos,0.3);
  limb(shT,sm,0.045,0.04,COL.gold,0.03);
  { const dx=sm[0]-shT[0], dy=sm[1]-shT[1], L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L; ctx.beginPath(); const n=9; for(let i=0;i<=n;i++){ const u=0.12+0.62*i/n, o=(i%2?1:-1)*0.06; const px=shT[0]+dx*u+nx*o, py=shT[1]+dy*u+ny*o; i?ctx.lineTo(px,py):ctx.moveTo(px,py); } ctx.strokeStyle=OUT; ctx.lineWidth=0.05; ctx.stroke(); ctx.strokeStyle=COL.red; ctx.lineWidth=0.03; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(piv[0],piv[1],0.035,0,6.28); ctx.fillStyle=COL.alu; ctx.fill(); outl(0.016);
  const pose=bike.rider?riderPose(bike):null;
  paperT(b,sx,fl,sgn); if(pose) riderLeg(farOf(pose),true); drawBikeBody(); ctx.restore();
  drawForkAndBars(sx,{x:frontPos[0],y:frontPos[1]});
  paperT(b,sx,fl,sgn); drawBars(); if(pose){ riderArm(farOf(pose),true); riderLeg(pose,false); riderBody(pose,0); riderArm(pose,false); } ctx.restore();
  ctx.restore();
}
// ---------- particles ----------
function puff(x,y,vx,vy,size,col,life){ parts.push({k:'puff',x,y,vx,vy,r:size,l:life||0.6,L:life||0.6,c:col||TH.dirtLight}); }
function spark(x,y){ for(let i=0;i<10;i++){ const a=Math.random()*6.283, v=1.2+Math.random()*2.5; parts.push({k:'star',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:0.09+Math.random()*0.08,l:0.6,L:0.6,c:i%2?'#ffe36b':'#fff6c2'}); } }
function drawParts(dt){
  for(const p of parts){ p.l-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(p.k==='puff'){ p.vx*=0.94; p.vy=p.vy*0.94+0.6*dt; const u=1-p.l/p.L; const r=p.r*(0.6+u*0.9); ctx.globalAlpha=Math.max(0,p.l/p.L)*0.85;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.28); ctx.fillStyle=p.c; ctx.fill(); ctx.strokeStyle='rgba(60,40,25,.5)'; ctx.lineWidth=0.025; ctx.stroke(); }
    else if(p.k==='star'){ p.vx*=0.92; p.vy*=0.92; ctx.globalAlpha=Math.max(0,p.l/p.L); const r=p.r; ctx.beginPath();
      for(let i=0;i<8;i++){ const a=i*Math.PI/4, q=i%2?r*0.35:r; ctx.lineTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q); } ctx.closePath(); ctx.fillStyle=p.c; ctx.fill(); }
    else if(p.k==='ring'){ const u=1-p.l/p.L; ctx.globalAlpha=Math.max(0,p.l/p.L); ctx.beginPath(); ctx.arc(p.x,p.y,p.r+u*0.9,0,6.28); ctx.strokeStyle=p.c; ctx.lineWidth=0.08*(1-u)+0.02; ctx.stroke(); }
    else if(p.k==='conf'){ p.vy-=4*dt; p.vx*=0.99; p.rot+=p.vr*dt; ctx.globalAlpha=Math.min(1,p.l*2); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.scale(1,Math.cos(p.rot*2)); ctx.fillStyle=p.c; ctx.fillRect(-0.07,-0.04,0.14,0.08); ctx.restore(); }
    else if(p.k==='spark'){ p.vy-=10*dt; ctx.globalAlpha=Math.max(0,p.l/p.L); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*0.03,p.y-p.vy*0.03); ctx.strokeStyle=p.c; ctx.lineWidth=0.035; ctx.stroke(); }
    else if(p.k==='blade'){ p.vy-=9*dt; p.rot+=p.vr*dt; ctx.globalAlpha=Math.max(0,p.l/p.L); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-0.025,-0.07,0.05,0.14); ctx.restore(); }
    else { p.vy-=8*dt; ctx.globalAlpha=Math.max(0,p.l*1.5); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fillStyle=p.c; ctx.fill(); }
  }
  ctx.globalAlpha=1; parts=parts.filter(p=>p.l>0);
}
// ---------- level preview ----------
function drawPreview(cnv,l){
  const T=getTheme(l.theme); const r=cnv.getBoundingClientRect(); const w=Math.max(120,r.width||150), h=Math.max(40,r.height||60), d=Math.min(2,window.devicePixelRatio||1);
  cnv.width=w*d; cnv.height=h*d; const g=cnv.getContext('2d'); g.scale(d,d);
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,T.sky[0]); gr.addColorStop(1,T.sky[2]); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle=T.mtn; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=12) g.lineTo(x,h*0.55-Math.abs(Math.sin(x*0.05+l.name.length))*h*0.25); g.lineTo(w,h); g.fill();
  // fit: x range bounds of interesting area
  let xs=[],ys=[]; for(const a of l.apples){ xs.push(a[0]); ys.push(a[1]); } xs.push(l.flower[0],l.start[0]); ys.push(l.flower[1],l.start[1]);
  const mnx=Math.min(...xs)-4, mxx=Math.max(...xs)+4, mny=Math.min(...ys)-3, mxy=Math.max(...ys)+3; const s=Math.min(w/(mxx-mnx),h/(mxy-mny));
  const ox=(w-(mxx-mnx)*s)/2, oy=(h-(mxy-mny)*s)/2; const X=x=>ox+(x-mnx)*s, Y=y=>h-oy-(y-mny)*s;
  g.beginPath(); g.rect(-10,-10,w+20,h+20); for(const rg of l.rings){ const p=rg.pts; g.moveTo(X(p[0][0]),Y(p[0][1])); for(const q of p) g.lineTo(X(q[0]),Y(q[1])); g.closePath(); }
  g.fillStyle=T.dirt; g.fill('evenodd'); g.strokeStyle=T.kind==='snow'?'#fff':T.top; g.lineWidth=2; g.beginPath(); for(const rg of l.rings){ const p=rg.pts; g.moveTo(X(p[0][0]),Y(p[0][1])); for(const q of p) g.lineTo(X(q[0]),Y(q[1])); g.closePath(); } g.stroke();
  for(const a of l.apples){ g.fillStyle=a[2]?'#5fb8ff':'#ffd23f'; g.strokeStyle='#1d2633'; g.lineWidth=0.8; g.beginPath(); for(let i=0;i<10;i++){ const an=-Math.PI/2+i*Math.PI/5, r=i%2?1.5:3.4; g.lineTo(X(a[0])+Math.cos(an)*r,Y(a[1])+Math.sin(an)*r); } g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle='#fff'; g.beginPath(); g.arc(X(l.flower[0]),Y(l.flower[1]+1),3.2,0,6.28); g.fill(); g.fillStyle='#f7c51e'; g.beginPath(); g.arc(X(l.flower[0]),Y(l.flower[1]+1),1.4,0,6.28); g.fill();
}
