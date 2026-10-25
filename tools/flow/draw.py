import json,sys,matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch,Circle
import os
D=os.path.dirname(os.path.abspath(__file__))
L=json.load(open(D+'/../../levels/flodet.json')); S=json.load(open(D+'/sections.json'))
out=sys.argv[1] if len(sys.argv)>1 else '/workspace/fjadra/flow_map.png'
x0,x1=(float(sys.argv[2]),float(sys.argv[3])) if len(sys.argv)>3 else (None,None)
v=[];c=[]
for r in L['rings'][1:]:
    p=r['pts']; v+=p+[p[0]]; c+=[Path.MOVETO]+[Path.LINETO]*(len(p)-1)+[Path.CLOSEPOLY]
B=L['rings'][0]['pts']; xs=[p[0] for p in B]; ys=[p[1] for p in B]
if x0 is None: x0,x1=min(xs),max(xs)
y0,y1=min(ys),max(ys)
pxm=float(sys.argv[4]) if len(sys.argv)>4 else 12
W=(x1-x0)*pxm/100; H=(y1-y0)*pxm/100+1
fig=plt.figure(figsize=(W,H),dpi=100); ax=fig.add_axes([0.01,0.05,0.98,0.9]); ax.set_facecolor('#fbe9d0')
for g in range(int(x0//10)*10,int(x1)+1,10): ax.axvline(g,color='#ddc',lw=.5)
for g in range(int(y0//5)*5,int(y1)+1,5): ax.axhline(g,color='#ddc',lw=.5)
ax.add_patch(PathPatch(Path(v,c),facecolor='#7a6a5a',edgecolor='#222',lw=.8))
for a in L['apples']: ax.plot(a[0],a[1],'*',color='#fc0',mec='k',ms=12)
for k in L['killers']: ax.add_patch(Circle((k[0],k[1]),0.5,color='r'))
ax.plot(*L['start'],'g^',ms=12); ax.plot(L['flower'][0],L['flower'][1]+0.5,'mo',ms=12)
for i,s in enumerate(S):
    ax.axvline(s['x0'],color='#2a6',ls=':',lw=1)
    ax.text(s['x0']+0.5,y1-1-(i%2)*2.2,'%d %s'%(i+1,s['name']),fontsize=9,color='#063',va='top',weight='bold')
ax.set_xlim(x0,x1); ax.set_ylim(y0,y1); ax.set_aspect('equal'); fig.savefig(out); print(out)
