/* No browser dependencies: exercise gesture routing and fullscreen success/failure paths. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'game/index.html'),'utf8');
const scripts=s=>[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const baseArg=process.argv.find(v=>v.startsWith('--base='));
if(baseArg){
 const base=cp.execFileSync('git',['show',baseArg.slice(7)+':game/index.html'],{cwd:root,encoding:'utf8'});
 assert.equal(scripts(html)[0],scripts(base)[0],'Physics and ragdoll must be identical');
 assert.equal(scripts(html)[1],scripts(base)[1],'Level definitions must be identical in the UI-only change');
 const inputs=s=>s.slice(s.indexOf('// ---------- input ----------'),s.indexOf('function restart(){'));
 assert.equal(inputs(html),inputs(base),'Gas, lean, turn and pointer handlers must remain unchanged');
}
assert(html.indexOf('id="bRestart"')<html.indexOf('id="ctl"'),'Restart must live above/outside the bottom controls');
assert(html.includes('maximum-scale=1')&&html.includes('minimum-scale=1'));
assert(html.includes('id="bFullscreen"')&&html.includes('width:84px;height:78px'));
const code=html.slice(html.indexOf('// ---------- mobile play surface:'),html.indexOf('// ---------- input ----------'));
async function main(){
 const listeners={},nodes={},toasts=[];let clock=0,entered=0,exited=0,locked=0;
 const document={documentElement:{},addEventListener:(n,f,o)=>{(listeners[n]||(listeners[n]=[])).push(f);if(['touchmove','touchend','gesturestart','gesturechange','gestureend','dblclick'].includes(n))assert.equal(o.passive,false);}};
 document.documentElement.requestFullscreen=async()=>{entered++;document.fullscreenElement=document.documentElement;};
 document.exitFullscreen=async()=>{exited++;document.fullscreenElement=null;};
 const c={document,navigator:{},screen:{orientation:{lock:async()=>{locked++;}}},performance:{now:()=>clock},window:{matchMedia:()=>({matches:false})},Math,toast:(m)=>toasts.push(m),$:id=>nodes[id]||(nodes[id]={attrs:{},setAttribute(k,v){this.attrs[k]=v;}})};
 vm.createContext(c);vm.runInContext("let state='play';\n"+code,c);
 const game={closest:()=>true},menu={closest:()=>null};
 function dispatch(type,target,extra={}){let prevented=false;const e={target,cancelable:true,preventDefault(){prevented=true;},touches:[],changedTouches:[{clientX:10,clientY:10}],...extra};for(const f of listeners[type]||[])f(e);return prevented;}
 assert(dispatch('dblclick',game));assert(!dispatch('dblclick',menu));
 assert(dispatch('touchmove',game));assert(!dispatch('touchmove',menu));
 for(const t of ['gesturestart','gesturechange','gestureend']){assert(dispatch(t,game));assert(!dispatch(t,menu));}
 assert(!dispatch('touchend',game));clock=150;assert(dispatch('touchend',game),'Rapid repeated tap must not zoom');
 clock=900;assert(!dispatch('touchend',game,{touches:[{}]}),'Holding gas while releasing lean must remain valid multitouch');
 assert(!dispatch('touchend',menu));
 assert(dispatch('gesturestart',document));vm.runInContext("state='menu'",c);assert(!dispatch('gesturestart',document));
 await nodes.bFullscreen.onclick();assert.equal(entered,1);assert.equal(locked,1);assert.equal(nodes.bFullscreen.attrs['aria-pressed'],'true');
 await nodes.bFullscreen.onclick();assert.equal(exited,1);assert.equal(nodes.bFullscreen.attrs['aria-pressed'],'false');
 delete document.documentElement.requestFullscreen;await nodes.bFullscreen.onclick();assert(toasts.at(-1).includes('hemskärmen'));
 c.navigator.standalone=true;await nodes.bFullscreen.onclick();assert(toasts.at(-1).includes('redan'));
 document.documentElement.requestFullscreen=async()=>{throw Error('denied');};await nodes.bFullscreen.onclick();assert(toasts.at(-1).includes('kunde inte'));
 console.log('PASS: elevated restart; unchanged input/core/levels; game-only double-tap/pinch guards; multitouch; fullscreen entry/exit/failure; iPhone guidance.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
