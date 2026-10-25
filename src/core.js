// ===== FJÄDRA core v11: Elma-fjädring + fjädrad förare (trials) + ragdoll (no DOM) =====
const P = {G:10, WR:0.4, WM:1, WI:0.13, BM:2.3, BI:2.3, AX:0.96, AY:-0.55,
  KX:600, KY:118, CX:13, CY:4.6, MU:3.2, MUB:9, REST:0.04, T:9.0, MAXW:30, BRAKE:70,
  HOLD:6.5, LEANMAX:3.6, VOLT_A:46, VOLT_T:0.11, VOLT_LOCK:0.3, ALO:1.5,
  MR:2.0, KR:500, CR:12, RBX:-0.1, RBY:0.52, RLX:0.3, RCROUCH:0.24, REXT:0.08, RMAX:0.5,
  THR_RATE:3.5, FLIP_T:0.38, BOUNCE:13, BOUNCE_MAX:3.8, BOUNCE_MIN:0.07, PUMP:1.1, PUMP_VMAX:8.5, PUMP_CD:0.3, VOLT_BRAKE:1.35, HOP:3.6, HOP_MIN:0.09, HOP_WIN:0.22, STRETCH:1.3, HOX:0.2, HOY:0.43, HR:0.23, TRAVEL:0.3, HEAD_SAFE:3.2, SAVE:9, ASSIST_K:30, ASSIST_D:8, ASSIST_T:1.6, KBUMP:2400, CBUMP:60, RDOWN:0.2, KRBUMP:2600, BRK_SHIFT:0.16, ANTI_LOOP:14, GAS_LOW:0.45, GAS_LOW_V:4.0, KPIN:2600, CPIN:45, PIN_MAX:170, PIN_REL:0.24, PIN_V:3.8, HANG_DAMP:1.8, HANG_LEAN:1.6, H:1/600};

function buildSegs(rings){
  const segs=[];
  for(const r of rings){ const pts=r.pts||r;
    for(let i=0;i<pts.length;i++){
      const a=pts[i], b=pts[(i+1)%pts.length];
      const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy;
      if(l2<1e-8) continue;
      segs.push({x1:a[0],y1:a[1],x2:b[0],y2:b[1],dx,dy,l2,
        minx:Math.min(a[0],b[0]),maxx:Math.max(a[0],b[0]),
        miny:Math.min(a[1],b[1]),maxy:Math.max(a[1],b[1]), style:r.style||null});
    }
  }
  return segs;
}
function nearest(segs,px,py,rad,cb){
  for(const s of segs){
    if(px+rad<s.minx||px-rad>s.maxx||py+rad<s.miny||py-rad>s.maxy) continue;
    let t=((px-s.x1)*s.dx+(py-s.y1)*s.dy)/s.l2; t=t<0?0:t>1?1:t;
    const qx=s.x1+t*s.dx, qy=s.y1+t*s.dy, ex=px-qx, ey=py-qy, d2=ex*ex+ey*ey;
    if(d2<rad*rad){ if(cb(qx,qy,d2)===true) return true; }
  }
  return false;
}
const easeIO=u=>0.5-0.5*Math.cos(Math.PI*u);
function facing(bk){ if(bk.flipT<0) return bk.dir; const u=easeIO(Math.min(1,bk.flipT/P.FLIP_T)); return bk.flipFrom*Math.cos(Math.PI*u); }
// rider target in body frame (lean: +1 = ccw/left button)
function riderTarget(bk,lean){ const f=facing(bk); const back=lean*bk.dir; // +1 = weight back, -1 = forward
  const bs=(bk.brk&&!lean)?P.BRK_SHIFT*f:0;   // braking throws the rider's weight forward over the bars
  return [P.RBX*f - P.RLX*lean + bs, P.RBY + (back>0?-P.RCROUCH:back<0?P.REXT:0) - (bs?0.04:0)]; }
function newBike(x,y){
  const wy=y+P.WR, by=wy-P.AY;
  const bk={dir:1, gx:0, gy:-P.G, voltT:0, voltD:0, lock:0, impact:0, contact:[0,0], thr:0, flipT:-1, flipFrom:1, lean:0, rider:true, crouchT:0, relT:0, hopped:0, comp:[0,0], compMem:[0,0], noPin:0, assistT:0, prevBrake:0, prevBack:0, backT:0, pumpCD:0, bounced:0, pumped:0,
    b:{x, y:by, vx:0, vy:0, a:0, w:0},
    wh:[{x:x-P.AX,y:wy,vx:0,vy:0,a:0,w:0},{x:x+P.AX,y:wy,vx:0,vy:0,a:0,w:0}]};
  const t=riderTarget(bk,0); bk.r={x:x+t[0], y:by+t[1], vx:0, vy:0};
  return bk;
}
// rider offset in body frame (for drawing / head)
function riderLocal(bk){ const b=bk.b,c=Math.cos(b.a),s=Math.sin(b.a), dx=bk.r.x-b.x, dy=bk.r.y-b.y; return [dx*c+dy*s, -dx*s+dy*c]; }
function headPos(bk){
  const b=bk.b,c=Math.cos(b.a),s=Math.sin(b.a), hx=P.HOX*facing(bk), hy=P.HOY;
  return [bk.r.x+hx*c-hy*s, bk.r.y+hx*s+hy*c];
}
function turn(bk){ if(bk.flipT>=0){ bk.flipT=P.FLIP_T-bk.flipT; bk.flipFrom=bk.dir; } else { bk.flipFrom=bk.dir; bk.flipT=0; } bk.dir*=-1; }
function volt(bk,d,alo){
  if(alo){ bk.voltT=P.VOLT_T; bk.voltD=-P.ALO; bk.lock=P.VOLT_LOCK; return true; }
  if(bk.lock>0) return false;
  bk.voltT=P.VOLT_T; bk.voltD=d; bk.lock=P.VOLT_LOCK; return true;
}
function collideWheel(w,segs,mu){
  const r=P.WR; let touched=false, imp=0;
  nearest(segs,w.x,w.y,r,(qx,qy)=>{
    const ex=w.x-qx, ey=w.y-qy, dd=Math.hypot(ex,ey); if(dd>=r||dd<1e-6) return;
    const nx=ex/dd, ny=ey/dd, pen=r-dd;
    w.x+=nx*pen; w.y+=ny*pen; touched=true;
    const rax=-nx*r, ray=-ny*r;
    let vcx=w.vx-w.w*ray, vcy=w.vy+w.w*rax;
    const vn=vcx*nx+vcy*ny;
    if(vn<0){
      if(-vn>imp) imp=-vn;
      const jn=-(1+P.REST)*vn*P.WM;
      w.vx+=nx*jn/P.WM; w.vy+=ny*jn/P.WM;
      const tx=-ny, ty=nx;
      vcx=w.vx-w.w*ray; vcy=w.vy+w.w*rax;
      const vt=vcx*tx+vcy*ty, kt=1/P.WM+r*r/P.WI;
      let jt=-vt/kt; const lim=mu*jn; if(jt>lim) jt=lim; else if(jt<-lim) jt=-lim;
      w.vx+=tx*jt/P.WM; w.vy+=ty*jt/P.WM;
      w.w+=(rax*ty-ray*tx)*jt/P.WI;
    }
  });
  return touched?Math.max(imp,1e-3):0;
}
function step(bk,inp,segs,h){
  const lean=inp.lean||0; bk.lean=lean; bk.brk=inp.brake?1:0;
  // trials bunny hop: crouch back, then throw the weight forward
  const back=lean*bk.dir;
  // pumping: throwing the weight forward while the wheels bite pulls the bike along (arms on the bars)
  if(bk.pumpCD>0) bk.pumpCD-=h; if(bk.noPin>0) bk.noPin-=h;
  if(back>0) bk.backT+=h; else if(bk.prevBack<=0) bk.backT=Math.max(0,bk.backT-h*2);
  if(back<0 && bk.prevBack>=0 && bk.pumpCD<=0 && bk.rider && (bk.contact[0]>0||bk.contact[1]>0)){
    const ca=Math.cos(bk.b.a), sa=Math.sin(bk.b.a), fx=ca*bk.dir, fy=sa*bk.dir, vf=bk.b.vx*fx+bk.b.vy*fy;
    if(vf<P.PUMP_VMAX){ const st=Math.min(1,bk.backT/0.3), dv=P.PUMP*(0.35+0.65*st)*Math.min(1,(P.PUMP_VMAX-vf)/3);
      bk.b.vx+=fx*dv; bk.b.vy+=fy*dv; for(const w of bk.wh){ w.vx+=fx*dv; w.vy+=fy*dv; } bk.r.vx+=fx*dv*0.8; bk.r.vy+=fy*dv*0.8; bk.pumped=st+0.01; }
    bk.pumpCD=P.PUMP_CD; bk.backT=0; }
  bk.prevBack=back;
  if(back>0){ bk.crouchT+=h; bk.relT=0; }
  else if(bk.crouchT>0){ bk.relT+=h; if(back<0 && bk.crouchT>=P.HOP_MIN && bk.relT<=P.HOP_WIN && (bk.contact[0]>0||bk.contact[1]>0) && bk.rider){
      const st=Math.min(1,bk.crouchT/0.3), V=P.HOP*(0.5+0.5*st); const gl=Math.hypot(bk.gx,bk.gy)||1;
      let ux=-bk.gx/gl*0.75-Math.sin(bk.b.a)*0.25, uy=-bk.gy/gl*0.75+Math.cos(bk.b.a)*0.25; const ul=Math.hypot(ux,uy); ux/=ul; uy/=ul;
      bk.b.vx+=ux*V; bk.b.vy+=uy*V; for(const w of bk.wh){ w.vx+=ux*V; w.vy+=uy*V; } bk.r.vx=bk.b.vx; bk.r.vy=bk.b.vy;
      bk.hopped=st; bk.crouchT=0; bk.relT=0; for(const w of bk.wh) w.pin=null; }
    else if(bk.relT>P.HOP_WIN) bk.crouchT=0; }
  const tt=(inp.gas&&!inp.brake)?1:0, dt=tt-bk.thr, mt=P.THR_RATE*h*(tt?1:2); bk.thr+=dt>mt?mt:dt<-mt?-mt:dt;
  if(bk.flipT>=0){ bk.flipT+=h; if(bk.flipT>=P.FLIP_T) bk.flipT=-1; }
  const b=bk.b, c=Math.cos(b.a), s=Math.sin(b.a), gx=bk.gx, gy=bk.gy;
  let fbx=P.BM*gx, fby=P.BM*gy, tb=0;
  for(let i=0;i<2;i++){
    const w=bk.wh[i], lx=i?P.AX:-P.AX, ly=P.AY;
    const rx=lx*c-ly*s, ry=lx*s+ly*c;
    const dx=b.x+rx-w.x, dy=b.y+ry-w.y;
    const dvx=b.vx-b.w*ry-w.vx, dvy=b.vy+b.w*rx-w.vy;
    const dlx=dx*c+dy*s, dly=-dx*s+dy*c, dvlx=dvx*c+dvy*s, dvly=-dvx*s+dvy*c;
    const flx=P.KX*dlx+P.CX*dvlx; let fly=P.KY*dly+P.CY*dvly;
    const cmp=-dly; if(cmp>P.TRAVEL){ fly-=P.KBUMP*(cmp-P.TRAVEL); if(dvly<0) fly+=P.CBUMP*dvly; }   // progressive bump stop: no bottoming out
    const fx=flx*c-fly*s, fy=flx*s+fly*c;
    bk.comp[i]=Math.max(0,-dly); bk.compMem[i]=Math.max(bk.comp[i],bk.compMem[i]-h*1.0);
    w.vx+=(fx/P.WM+gx)*h; w.vy+=(fy/P.WM+gy)*h;
    fbx-=fx; fby-=fy; tb+=rx*(-fy)-ry*(-fx);
  }
  // sprung rider (legs + arms)
  if(bk.rider){ const r=bk.r, t=riderTarget(bk,lean), ox=t[0]*c-t[1]*s, oy=t[0]*s+t[1]*c;
    let fx=P.KR*(b.x+ox-r.x)+P.CR*(b.vx-b.w*oy-r.vx), fy=P.KR*(b.y+oy-r.y)+P.CR*(b.vy+b.w*ox-r.vy);
    { const ex=r.x-(b.x+ox), ey=r.y-(b.y+oy), down=-(ex*(-s)+ey*c); if(down>P.RDOWN){ const k=P.KRBUMP*(down-P.RDOWN); fx+=-s*k; fy+=c*k; } }   // legs stiffen when squashed
    r.vx+=(fx/P.MR+gx)*h; r.vy+=(fy/P.MR+gy)*h; r.x+=r.vx*h; r.y+=r.vy*h;
    fbx-=fx; fby-=fy; tb+=ox*(-fy)-oy*(-fx);
    const ex=r.x-(b.x+ox), ey=r.y-(b.y+oy), d=Math.hypot(ex,ey); if(d>P.RMAX){ const k=(d-P.RMAX)/d; r.x-=ex*k; r.y-=ey*k; } }
  b.vx+=fbx/P.BM*h; b.vy+=fby/P.BM*h; b.w+=tb/P.BI*h;
  // gravity-star assist: while airborne after a gravity change, gently turn the wheels toward the new 'down'
  if(bk.assistT>0){ bk.assistT-=h; bk.assistAge=(bk.assistAge||0)+h;
    if(bk.assistAge>0.35&&(bk.contact[0]>0.5||bk.contact[1]>0.5)){ bk.assistT=Math.min(bk.assistT,0.45);
      // landed on the new 'floor': if the bike faces against its travel direction, turn it around automatically
      if(!bk.assistTurned){ bk.assistTurned=1; const gl=Math.hypot(gx,gy)||1, tx=gy/gl, ty=-gx/gl, fT=(Math.cos(b.a)*tx+Math.sin(b.a)*ty)*bk.dir, vT=b.vx*tx+b.vy*ty; if(vT*fT<0&&Math.abs(vT)>0.8) turn(bk); } }
    const gl=Math.hypot(gx,gy)||1, ta=Math.atan2(gx/gl,-gy/gl); let e=ta-b.a; e=Math.atan2(Math.sin(e),Math.cos(e));
    b.w+=(P.ASSIST_K*e-P.ASSIST_D*b.w)*h; }
  // low-speed anti-loop: throttle alone should not roll the bike over backwards (only active when it is already far up and slow)
  if(bk.thr>0.2 && bk.contact[bk.dir===1?0:1]>0 && bk.assistT<=0){ const gl2=Math.hypot(gx,gy)||1, ag2=Math.atan2(gx/gl2,-gy/gl2); let pit=(b.a-ag2)*bk.dir; pit=Math.atan2(Math.sin(pit),Math.cos(pit)); const sp2=Math.hypot(b.vx,b.vy);
    if(pit>0.75&&sp2<5.5){ const k2=Math.min(1,(pit-0.75)/0.35)*(1-sp2/5.5); b.w-=bk.dir*P.ANTI_LOOP*k2*bk.thr*h; } }
  if(bk.lock>0) bk.lock-=h;
  // trials save: braking + throwing the weight fully forward can pull a bike that is looping out back down —
  // works best around 40–65° and gets hopeless when it is too far back or tipping too fast
  if(inp.brake && lean*bk.dir<0 && bk.contact[bk.dir===1?0:1]>0){ const gl=Math.hypot(gx,gy)||1, ag=Math.atan2(gx/gl,-gy/gl);
    let pitch=(b.a-ag)*bk.dir; pitch=Math.atan2(Math.sin(pitch),Math.cos(pitch));
    if(pitch>0.3){ const win=Math.min(1,(pitch-0.3)/0.4)*Math.max(0,Math.min(1,(1.38-pitch)/0.38)); const backRate=b.w*bk.dir;
      const f=win*Math.max(0,Math.min(1,1-Math.max(0,backRate-1.2)/2.8)); b.w-=bk.dir*P.SAVE*f*h; } }
  if(bk.voltT>0){ const vk=(inp.brake&&(bk.contact[0]>0||bk.contact[1]>0))?P.VOLT_BRAKE:1; b.w+=bk.voltD*P.VOLT_A*vk*h; bk.voltT-=h; }
  else if(lean){ if(b.w*lean<P.LEANMAX) b.w+=lean*P.HOLD*h; }
  // hanging by a braked wheel: the swing settles calmly and leaning gives real control to parry the swing
  { const p0=bk.wh[0].pin, p1=bk.wh[1].pin; if((p0&&bk.contact[1]<0.5)||(p1&&bk.contact[0]<0.5)){ b.w*=(1-P.HANG_DAMP*h); if(lean&&b.w*lean<P.LEANMAX+1.5) b.w+=lean*P.HOLD*P.HANG_LEAN*h; } }
  const dw=bk.wh[bk.dir===1?0:1];
  if(bk.thr>0.001){ const wr=Math.min(1,Math.max(0,-bk.dir*dw.w/P.MAXW)); if(wr<1){ const tq=P.T*bk.thr*(1.4-0.75*wr);   // trials torque: strong low-end grunt, gentle at speed
      dw.w-=bk.dir*tq/P.WI*h; if(bk.assistT<=0){ const sp=Math.hypot(b.vx,b.vy), lowF=P.GAS_LOW+(1-P.GAS_LOW)*Math.min(1,sp/P.GAS_LOW_V); b.w+=bk.dir*tq/P.BI*h*0.22*lowF; } } }
  if(inp.brake){ const k=Math.min(1,P.BRAKE*h); for(const w of bk.wh) w.w+=(b.w-w.w)*k; }
  // Elma bounce: squeeze a wheel into the ground, then hit the brake to release the spring
  if(inp.brake && !bk.prevBrake && bk.rider){ let best=-1, cm=0; for(let i=0;i<2;i++){ if(bk.contact[i]>0 && bk.compMem[i]>cm){ cm=bk.compMem[i]; best=i; } }
    if(best>=0 && cm>P.BOUNCE_MIN){ const V=Math.min(P.BOUNCE_MAX,P.BOUNCE*(cm-P.BOUNCE_MIN*0.5)); const ux=-Math.sin(b.a), uy=Math.cos(b.a);
      const other=1-best; bk.wh[best].vx+=ux*V*1.15; bk.wh[best].vy+=uy*V*1.15; bk.wh[other].vx+=ux*V*0.6; bk.wh[other].vy+=uy*V*0.6;
      b.vx+=ux*V*0.85; b.vy+=uy*V*0.85; bk.r.vx=b.vx; bk.r.vy=b.vy; for(const w of bk.wh) w.pin=null; bk.noPin=0.3; bk.compMem=[0,0]; bk.bounced=cm; } }
  bk.brakeAge=inp.brake?(bk.prevBrake?(bk.brakeAge||0)+h:0):9; bk.prevBrake=inp.brake?1:0;
  b.x+=b.vx*h; b.y+=b.vy*h; b.a+=b.w*h;
  const mu=inp.brake?P.MUB:P.MU;
  for(let i=0;i<2;i++){ const w=bk.wh[i]; w.x+=w.vx*h; w.y+=w.vy*h; w.a+=w.w*h;
    const im=collideWheel(w,segs,mu); bk.contact[i]=im>0?1:Math.max(0,bk.contact[i]-h*20); if(im>bk.impact) bk.impact=im;
    // Elma-style brake grab: a braking wheel that touches something at low speed grips that spot
    if(inp.brake && bk.noPin<=0){ if(!w.pin && Math.hypot(w.vx,w.vy)<P.PIN_V){
        // grab: touching now, or just left a surface (still within a few cm) — so a slightly late brake on a ledge still catches it
        let ok=im>0; if(!ok && (bk.contact[i]>0.05||bk.brakeAge<0.3)){ nearest(segs,w.x,w.y,P.WR+0.16,()=>{ ok=true; return true; }); }
        if(ok) w.pin={x:w.x,y:w.y}; }
      if(w.pin){ const ex=w.x-w.pin.x, ey=w.y-w.pin.y, d=Math.hypot(ex,ey); if(d>P.PIN_REL) w.pin=null; else {
        let fx=-P.KPIN*ex-P.CPIN*w.vx, fy=-P.KPIN*ey-P.CPIN*w.vy; const fm=Math.hypot(fx,fy); if(fm>P.PIN_MAX){ fx*=P.PIN_MAX/fm; fy*=P.PIN_MAX/fm; }
        w.vx+=fx/P.WM*h; w.vy+=fy/P.WM*h; } } }
    else w.pin=null; }
  for(let i=0;i<2;i++){
    const w=bk.wh[i], lx=i?P.AX:-P.AX, ax=b.x+lx*c-P.AY*s, ay=b.y+lx*s+P.AY*c;
    const ex=w.x-ax, ey=w.y-ay, dd=Math.hypot(ex,ey);
    if(dd>P.STRETCH){ const k=(dd-P.STRETCH)/dd; w.x-=ex*k*0.5; w.y-=ey*k*0.5; b.x+=ex*k*0.5; b.y+=ey*k*0.5; }
  }
}
function headHit(bk,segs){ const [hx,hy]=headPos(bk); return nearest(segs,hx,hy,P.HR,()=>true); }
function setGravity(bk,gx,gy){ if(gx===bk.gx&&gy===bk.gy) return; bk.gx=gx; bk.gy=gy; bk.assistT=P.ASSIST_T; bk.assistTurned=0; bk.assistAge=0; }
// Forgiving helmet: thin beams/planks let the head pass (like the body), soft touches are just a bump,
// only a real hit (fast into the surface) ends the run. Returns 'ok' | 'bump' | 'crash'.
function headResolve(bk,segs){
  const [hx,hy]=headPos(bk); const R=P.HR; let best=null, bd=R*R;
  for(const sg of segs){ if(sg.style==='steel'||sg.style==='wood') continue;
    if(hx+R<sg.minx||hx-R>sg.maxx||hy+R<sg.miny||hy-R>sg.maxy) continue;
    let t=((hx-sg.x1)*sg.dx+(hy-sg.y1)*sg.dy)/sg.l2; t=t<0?0:t>1?1:t; const qx=sg.x1+t*sg.dx, qy=sg.y1+t*sg.dy, d2=(hx-qx)**2+(hy-qy)**2;
    if(d2<bd){ bd=d2; best=[qx,qy]; } }
  if(!best) return 'ok';
  const d=Math.sqrt(bd)||1e-6, nx=(hx-best[0])/d, ny=(hy-best[1])/d;
  const b=bk.b, r=bk.r, ox=hx-r.x, oy=hy-r.y; const vx=r.vx-b.w*oy, vy=r.vy+b.w*ox; const vn=vx*nx+vy*ny;
  if(vn<-P.HEAD_SAFE) return 'crash';
  const pen=P.HR-d; r.x+=nx*pen; r.y+=ny*pen; b.x+=nx*pen*0.6; b.y+=ny*pen*0.6;
  if(vn<0){ r.vx-=vn*nx; r.vy-=vn*ny; b.vx-=vn*nx*0.7; b.vy-=vn*ny*0.7; }
  b.w*=0.97; return 'bump';
}

// ---------- rider pose (local, facing-mirrored drawing frame: +x = forward) ----------
const BKP={PEG:[-0.05,-0.44], GRIP:[0.43,0.57]};
function ikp(a,b,l1,l2,bend){ let dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1e-6; const dm=Math.min(d,l1+l2-0.001); const ux=dx/d, uy=dy/d;
  const x=(dm*dm+l1*l1-l2*l2)/(2*dm), h=Math.sqrt(Math.max(0,l1*l1-x*x)); return [a[0]+ux*x-uy*h*bend, a[1]+uy*x+ux*h*bend]; }
function seatTop(x){ return x>0.15?-9:0.33+Math.max(0,-x)*0.085; }
function riderPose(bk){
  const f=facing(bk), sg=f>=0?1:-1, rl=riderLocal(bk);
  const cx=rl[0]*sg, cy=rl[1];                  // rider CoM in drawing frame (+x = forward)
  const bx=cx-P.RBX, by=cy-P.RBY;               // sway from neutral
  const head=[cx+P.HOX, cy+P.HOY];
  let hip=[-0.32+bx*0.8, 0.43+by*0.85];
  if(hip[0]>-0.86){ const st=seatTop(hip[0])+0.1; if(hip[1]<st) hip[1]=st; }
  const sh=[hip[0]+(head[0]-hip[0])*0.7-0.03, hip[1]+(head[1]-hip[1])*0.7];
  const foot=[-0.02,-0.4], ankle=[-0.08,-0.29], grip=BKP.GRIP;
  const knee=ikp(ankle,hip,0.45,0.47,-1), elbow=ikp(sh,grip,0.27,0.27,-1);
  return {foot,ankle,knee,hip,sh,elbow,grip,head};
}
// ---------- ragdoll ----------
function makeRagdoll(bk){
  const p=riderPose(bk), f=facing(bk), sg=f>=0?1:-1, b=bk.b, c=Math.cos(b.a), s=Math.sin(b.a);
  const W=q=>{ const lx=q[0]*sg, ly=q[1]; return [b.x+lx*c-ly*s, b.y+lx*s+ly*c]; };
  const names=['head','sh','hip','knee','foot','elbow','hand'], src=[p.head,p.sh,p.hip,p.knee,p.foot,p.elbow,p.grip];
  const vx=bk.r.vx, vy=bk.r.vy, pts={};
  const H0=1/240, wv=bk.b.w;   // verlet substep length used by stepRagdoll: start with the rider's own velocity plus the spin of the bike
  names.forEach((n,i)=>{ const w=W(src[i]); const jit=(Math.random()-0.5)*0.5; const rx=w[0]-bk.r.x, ry=w[1]-bk.r.y;
    const pvx=vx-wv*ry*0.6+jit, pvy=vy+wv*rx*0.6+jit; pts[n]={x:w[0],y:w[1],px:w[0]-pvx*H0,py:w[1]-pvy*H0,r:n==='head'?P.HR:0.09}; });
  const L=(a,b)=>Math.hypot(pts[a].x-pts[b].x,pts[a].y-pts[b].y);
  const cons=[['head','sh'],['sh','hip'],['hip','knee'],['knee','foot'],['sh','elbow'],['elbow','hand'],['head','hip'],['sh','knee']].map(([a,b2])=>[a,b2,L(a,b2),(a==='head'&&b2==='hip')||(a==='sh'&&b2==='knee')?0.12:1]);
  const cr=(a,b,c)=>{ const A=pts[a],B=pts[b],Cc=pts[c]; return (B.x-A.x)*(Cc.y-B.y)-(B.y-A.y)*(Cc.x-B.x); };
  const lim=[['hip','knee','foot',Math.sign(cr('hip','knee','foot'))||-sg],['sh','elbow','hand',Math.sign(cr('sh','elbow','hand'))||sg]];
  return {pts,cons,sg,gx:bk.gx,gy:bk.gy,t:0,lim,bias:(Math.random()<0.5?-1:1)*(0.7+Math.random()*0.6)};
}
function stepRagdoll(rd,segs,dt){
  const n=Math.max(1,Math.round(dt/(1/240))), h=dt/n;
  for(let k=0;k<n;k++){ rd.t+=h;
    for(const key in rd.pts){ const q=rd.pts[key]; const vx=(q.x-q.px)*0.9965, vy=(q.y-q.py)*0.9965; q.px=q.x; q.py=q.y; q.x+=vx+rd.gx*h*h; q.y+=vy+rd.gy*h*h; if(key==='head'||key==='sh'){ q.x+=rd.bias*h*h*(rd.gy?1:0); q.y+=rd.bias*h*h*(rd.gy?0:1); } }
    for(let it=0;it<4;it++){
      for(const [a,b,len,st] of rd.cons){ const A=rd.pts[a], B=rd.pts[b]; const dx=B.x-A.x, dy=B.y-A.y, d=Math.hypot(dx,dy)||1e-6; if(st<1&&d<len) continue; const diff=(d-len)/d*0.5*st;   // cross-braces act like ropes: they stop stretching but let the body fold up
         A.x+=dx*diff; A.y+=dy*diff; B.x-=dx*diff; B.y-=dy*diff; }
      // joint angle limits: knees and elbows only bend one way; if they hyper-extend they are pushed back softly
      for(const [a,b,c,sgn] of rd.lim){ const A=rd.pts[a],B=rd.pts[b],Cc=rd.pts[c]; const cross=(B.x-A.x)*(Cc.y-B.y)-(B.y-A.y)*(Cc.x-B.x);
        if(cross*sgn<-1e-5){ const mx=(A.x+Cc.x)/2, my=(A.y+Cc.y)/2; const dx=Cc.x-A.x, dy=Cc.y-A.y, L2=dx*dx+dy*dy||1e-6; const t=((B.x-A.x)*dx+(B.y-A.y)*dy)/L2; const fx=A.x+dx*t, fy=A.y+dy*t;
          const rx=2*fx-B.x, ry=2*fy-B.y, ddx=Math.max(-0.05,Math.min(0.05,(rx-B.x)*0.3)), ddy=Math.max(-0.05,Math.min(0.05,(ry-B.y)*0.3)); B.x+=ddx; B.y+=ddy; B.px+=ddx; B.py+=ddy; } }   // pure position shift: no energy is added
      for(const key in rd.pts){ const q=rd.pts[key];
        nearest(segs,q.x,q.y,q.r,(qx,qy)=>{ const ex=q.x-qx, ey=q.y-qy, d=Math.hypot(ex,ey); if(d>=q.r||d<1e-6) return; const nx=ex/d, ny=ey/d, pen=q.r-d;
          q.x+=nx*pen; q.y+=ny*pen; const vx=q.x-q.px, vy=q.y-q.py, vn=vx*nx+vy*ny, tx=vx-vn*nx, ty=vy-vn*ny; q.px=q.x-(tx*0.9975-Math.min(0,vn)*0.18*nx); q.py=q.y-(ty*0.9975-Math.min(0,vn)*0.18*ny); }); }
    }
  }
}
if(typeof module!=='undefined') module.exports={P,step,newBike,headHit,headPos,nearest,buildSegs,volt,turn,facing,riderLocal,riderPose,makeRagdoll,stepRagdoll,setGravity,headResolve};
