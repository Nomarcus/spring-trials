const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto('file://'+__dirname+'/game/index.html'); await pg.waitForTimeout(800);
  for(const n of [9,18]){ await pg.click('.lv >> nth='+n); await pg.waitForTimeout(600); await pg.click('#bMap'); await pg.waitForTimeout(1500); await pg.screenshot({path:__dirname+'/../map'+(n+1)+'.png'}); await pg.click('#bMap'); await pg.click('#bMenu'); await pg.waitForTimeout(300); }
  console.log(errs); await b.close(); })();
