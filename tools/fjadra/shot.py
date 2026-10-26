#!/usr/bin/env python3
"""Tar en skärmdump av spelet i mobil-liggande format (844x390 @2x) med Playwright.

  python3 tools/fjadra/shot.py --level 0 --hold 1.5 --out shot.png
  python3 tools/fjadra/shot.py --level 2 --hold 2.5 --style neon --out neon.png

--level   index i banlistan (0 = första)
--hold    sekunder som GAS (pil upp) hålls inne          --style cartoon|neon
--menu    ta bild av menyn i stället                      --map   tryck på översiktsknappen
Kräver:  pip install playwright && playwright install chromium
"""
import argparse, asyncio, os
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ap = argparse.ArgumentParser()
ap.add_argument('--level', type=int, default=0)
ap.add_argument('--hold', type=float, default=1.0); ap.add_argument('--style', default='cartoon')
ap.add_argument('--out', default='shot.png'); ap.add_argument('--menu', action='store_true'); ap.add_argument('--map', action='store_true')
ap.add_argument('--file', default=os.path.join(ROOT, 'game', 'index.html'))
a = ap.parse_args()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2, has_touch=True)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + a.file); await pg.wait_for_timeout(900)
        if a.style == 'neon': await pg.click('#bStyle'); await pg.wait_for_timeout(300)
        if a.menu: await pg.screenshot(path=a.out)
        else:
            await pg.click(f'.lv >> nth={a.level}'); await pg.wait_for_timeout(3400)   # banans hint-toast försvinner efter ~3,4 s
            await pg.keyboard.down('ArrowUp'); await pg.wait_for_timeout(int(a.hold * 1000)); await pg.keyboard.up('ArrowUp'); await pg.wait_for_timeout(200)
            if a.map: await pg.click('#bMap'); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=a.out)
        print('sidfel:', errs or 'inga'); await b.close()
asyncio.run(main())
