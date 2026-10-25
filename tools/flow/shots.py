import json,sys,re
from playwright.sync_api import sync_playwright
R='/workspace/spring-trials/'; OUT='/workspace/fjadra/flow/'
html=open(R+'climb/index.html',encoding='utf8').read(); S=json.load(open(R+'tools/flow/sections.json'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    for i,s in [(-1,None)]+list(enumerate(S)):
        h=html
        if s: h=h.replace('"start":[2,40]','"start":[%s,%s]'%(s['x0']+1.5,s['y0']+0.05),1)
        open('/tmp/fl.html','w',encoding='utf8').write(h)
        pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2)
        errs=[]; pg.on('console',lambda m: m.type=='error' and errs.append(m.text)); pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto('file:///tmp/fl.html'); pg.wait_for_timeout(900)
        if i<0: pg.screenshot(path=OUT+'00_menu.png')
        pg.locator('.lv').first.click(); pg.wait_for_timeout(3600)
        pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(200)
        n=OUT+'%02d_%s.png'%(i+1,(s['name'] if s else 'start')); pg.screenshot(path=n); print(n,'errors:',errs); pg.close()
    b.close()
