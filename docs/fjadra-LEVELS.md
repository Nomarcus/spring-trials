# Banor: format, lista och status

## Format (`src/levels.js`)
Enheter är **meter, y uppåt**. Ett bana-objekt:
```js
{ id:'fjadra-pack2-01',          // STABILT ID (krävs för paket 2; paket 1 får 'p1-'+slug(name) automatiskt). Rekord och spöken lagras på ID.
  name:'Dalens rytm', theme:'meadow',   // meadow | sunset | winter | cave (neon byter palett för alla)
  hint:'Text som visas när banan startar',
  stuck:'Valfri ledtråd efter 4,5 s stillastående',     // annars visas en generell tips-ruta
  rings:[ {pts:[[x,y],...]},                 // FÖRSTA ringen = marken (sluten polygon). Lägg in himmelslock vid TOP=40 i ändarna.
          {pts:[...], style:'steel'} ],      // fler ringar = hål/grottor eller fristående objekt
  apples:[[x,y], [x,y,'up'] ],               // STJÄRNOR (namnet apples är kvar i koden). Tredje värdet 'up'|'down'|'left'|'right' = blå tyngdkraftsstjärna
  killers:[],                                // dödliga hinder [x,y,'ball'|'saw']; ritkod finns, men ALLA banor har tom lista (Marcus vill inte ha dem nu)
  flower:[x,y], start:[x,y],                 // målblomman och startpunkt (golvhöjd)
  marks:[[x0,x1]] }                          // valfritt: gul/svart bromszon målad på ytan under x0..x1
```
- **Terrängen** är alla ringars segment. Hjul och huvud kolliderar mot dem. **Ringar med `style:'steel'|'wood'` är tunna balkar:** hjulen kolliderar, men huvudet går igenom (och kroppen alltid). Andra stilar: `crate`, `stone`, `log` (hjul och huvud kolliderar, rent visuellt olika).
- **Hjälpfunktioner:** `sample(f,x0,x1,steg)` höjdfunktion → punkter; `cr(ctrl,steg)` Catmull-Rom-kurva genom kontrollpunkter; `arc(cx,cy,r,a0,a1,n)`; `rect`, `crate(x,y,s)`, `log(x,y,r)`, `pillar(x0,x1,h)`, `blob(cx,cy,w,h,seed)` (svävande ö), `sm(e0,e1,x)` mjuk stegfunktion.
- **Registrera en bana:** `LV.push(()=>({...}))` (paket 1) eller `LV2.push(...)` (paket 2). Medaljtider (guld/silver, sekunder) i `MEDALS` (efter namn, paket 1) eller `MEDALS2` (efter ID). Flikarna i menyn byggs av `l.pack`. `makeLevels()` räknar ut `segs`, `bounds` och `vbounds` (översiktskartan).
- **Mjuka kanter:** runda av toppar och rampers krön. Vassa vinklar kastar iväg cykeln.
- **Plats:** Marcus vill ha rymliga banor. Cykeln är ca 1,9 m mellan hjulaxlarna och 2,1 m hög med förare. Kör man upp och ner behövs minst ~4 m takhöjd.
- **Nya banor ska vara lösbara av boten eller av ett skript** innan de släpps. Lägg till dem i `NEWLV` i `logic.js` för NY-märket i menyn.

## Verifiera en bana
```bash
node tools/fjadra/test/run.js <index>        # 3 försök: bred stråle, bredare, ordnade stjärnor
```
Boten hittar inte vägen om målen ligger "bakåt" under starten; skriv då ett skript efter `tools/fjadra/test/script_gruvan.js` (en enkel tillståndsmaskin med gas/broms/luta/vänd).

## Banlista (index = ordning i `makeLevels()`)
✅ = klarad av boten med fysik **v11** (nuvarande). ⚠️ = inte omkörd på v11 (klarades senast på v9/v10). Kör hela sviten innan nästa release.

| # | ID | Namn | Paket | Tema | Stjärnor | Medalj guld/silver | v11 |
|---|---|---|---|---|---|---|---|
| 0 | p1-forsta-stegen | Första stegen | 1 | meadow | 3 | 10/16 | ✅ |
| 1 | p1-ladorna | Lådorna | 1 | meadow | 3 | 16/26 | ✅ |
| 2 | p1-stockarna | Stockarna | 1 | meadow | 3 | 9/15 | ✅ |
| 3 | p1-vandplatsen | Vändplatsen | 1 | sunset | 3 | 12/20 | ✅ |
| 4 | p1-trappan | Trappan | 1 | sunset | 3 | 11/17 | ✅ |
| 5 | p1-hakarna | Hakarna | 1 | meadow | 3 | 16/26 | ✅ |
| 6 | p1-svavande-oar | Svävande öar | 1 | meadow | 4 | 16/25 | ⚠️ |
| 7 | p1-volten | Volten | 1 | sunset | 3 | 9/15 | ⚠️ |
| 8 | p1-bron | Bron | 1 | meadow | 3 | 14/22 | ✅ |
| 9 | p1-grottan | Grottan | 1 | cave | 3 | 10/16 | ✅ |
| 10 | p1-pelarna | Pelarna | 1 | sunset | 3 | 14/24 | ✅ |
| 11 | p1-skalen | Skålen | 1 | sunset | 3 | 25/45 | ⚠️ |
| 12 | p1-hinderbanan | Hinderbanan | 1 | sunset | 3 | 13/20 | ⚠️ |
| 13 | p1-vinterberget | Vinterberget | 1 | winter | 3 | 12/19 | ⚠️ |
| 14 | p1-klippan | Klippan | 1 | winter | 3 | 16/26 | ✅ |
| 15 | p1-upp-och-ner | Upp och ner | 1 | cave | 5 (2 grav) | 14/24 | ⚠️ |
| 16 | p1-hanget | Hänget | 1 | meadow | 3 | 16/28 | ✅ |
| 17 | p1-svavaren | Svävaren | 1 | sunset | 5 (2 grav) | 14/24 | ⚠️ |
| 18 | p1-balkarna | Balkarna | 1 | winter | 4 | 14/24 | ✅ |
| 19 | p1-pumpbanan | Pumpbanan | 1 | meadow | 4 | 14/22 | ⚠️ |
| 20 | p1-studsen | Studsen | 1 | sunset | 3 | 12/20 | ⚠️ |
| 21 | p1-schaktet | Schaktet | 1 | cave | 4 | 22/34 | ⚠️ |
| 22 | p1-klattervaggen | Klätterväggen | 1 | winter | 4 | 18/30 | ⚠️ |
| 23 | p1-finalen | Finalen | 1 | sunset | 6 | 28/45 | ⚠️ |
| 24 | p1-spegeln | Spegeln | 1 | cave | 5 (2 grav) | 16/26 | ⚠️ |
| 25 | p1-trapphoppet | Trapphoppet | 1 | winter | 5 | 16/26 | ⚠️ |
| 26 | p1-flowbanan | Flowbanan | 1 | meadow | 4 | 14/22 | ⚠️ |
| 27 | fjadra-pack2-01 | Dalens rytm | 2 | meadow | 3 | 12/20 | ⚠️ |
| 28 | fjadra-pack2-08 | Gruvans andra våning | 2 | cave | 4 | 26/40 | ⚠️ |
| 29 | fjadra-pack2-11 | Stenhyllan | 2 | sunset | 3 | 14/24 | ✅ |

### Banpaket 3 (30 banor efter skisserna i `fjadra_30_banor.zip`, lätt → svår)
Index fortsätter efter paket 2. Varje bana lär ut en teknik. Kolumnen *Bara gas* visar om banan går att klara utan tekniken (enkel förare som bara håller gas).

| # | ID | Namn | Tema | Stjärnor | Medalj guld/silver | Bot v11 | Bara gas |
|---|---|---|---|---|---|---|---|
| 30 | fjadra-p3-01 | Första turen (gas) | meadow | 3 | 16/26 | ✅ 11,4 s | klarar (meningen) |
| 31 | fjadra-p3-02 | Mjuka backen (broms + luta bak) | meadow | 1 | 14/24 | ✅ 9,4 s | klarar |
| 32 | fjadra-p3-03 | Lutbacken (luta fram) | sunset | 2 | 24/38 | ✅ 17,5 s | kraschar |
| 33 | fjadra-p3-04 | Bakhjulstrappan (wheelie) | meadow | 2 | 12/20 | ✅ 7,9 s | fastnar/kraschar |
| 34 | fjadra-p3-05 | Pumpdalen (pumpa) | sunset | 2 | 13/22 | ✅ 8,3 s | kraschar |
| 35 | fjadra-p3-06 | Lilla gapet (hopp) | meadow | 1 | 11/18 | ✅ 7,8 s | klarar |
| 36 | fjadra-p3-07 | Halfpipe-gungan (halfpipe) | sunset | 4 | 14/24 | ✅ 7,8 s | kraschar |
| 37 | fjadra-p3-08 | Första loopen (loop) | meadow | 1 | 16/26 | ✅ 35,4 s | klarar 10,5 s |
| 38 | fjadra-p3-09 | Grytet (tunnel) | meadow | 1 | 11/18 | ✅ 7,2 s | missar stjärnan |
| 39 | fjadra-p3-10 | Skorstenen (tyngdkraft, schakt) | cave | 2 + 2 blå | 14/22 | ✅ 9,1 s | – |
| 40 | fjadra-p3-11 | Fram och tillbaka (vändning) | winter | 2 | 30/45 | ✅ 23,3 s | kraschar |
| 41 | fjadra-p3-12 | Vågor och gap (pump + hopp) | sunset | 3 | 15/24 | ✅ 10,7 s | kraschar |
| 42 | fjadra-p3-13 | Berg-och-dalbanan (flow) | meadow | 5 | 30/45 | ✅ 31,8 s | kraschar vid hoppet |
| 43 | fjadra-p3-14 | Upp och ner (tyngdkraft, tak) | sunset | 1 + 2 blå | 14/24 | ✅ 9,7 s | kraschar |
| 44 | fjadra-p3-15 | Bromssvingen (hög kant) | winter | 1 | 11/18 | ✅ 7,0 s | kraschar |

**Loopar** (`loopParts` i `levels.js`): en hel loop i 2D måste korsa sin egen väg i luften. Loopen är träplankor (`woodArc`) med en öppning i botten (230°–310°). En brant rund ramp (60°) skjuter in cykeln genom öppningen; efter varvet faller den ut samma väg och landar i en 32°-backe bakom rampen. Kräver ca 16 m/s vid rampen. Rampvinkel 60° är stabil; 55° och 70° fungerar inte.

**Skorstenen** byggdes först som sicksack-balkar med bunny hop, sedan som träklossar med wheelie-kanter. Båda går inte i 2D med den här fysiken: för att vända och klättra samtidigt måste cykeln korsa sin egen väg, och ett hopp eller en wheelie ger bara 0,6–1 m. Därför används blå stjärnor: man faller uppåt genom schaktet.

Lärdom från bana 2: broms under `PIN_V` (3,8 m/s) låser hjulet mot marken. Tvärbroms utan att luta bakåt i en brant nedförsbacke slår runt cykeln framåt, och broms när framhjulet landar ger en Elma-studs. Håll nedförsbackar i nybörjarbanor under ~30° med breda krön.

## Idéer och referens
- `docs/reference/atlas-20-banor.jpg` + `chatgpt-20-banor-prompt.txt`: ChatGPT:s atlas med 20 bankoncept (Dalens rytm, Åttans hemlighet, Spiralbrunnen, Nyckelhålet …). Bedömning: 01, 03, 05, 07, 09 enkla; 02, 04, 06, 08, 10, 14, 15, 16 medel (tak, flera våningar); 11, 12, 19 beror på bromshäng; 13, 17, 18, 20 för tajta som ritade och måste byggas bredare med körbara lutningar under ~35°. Tre av dem är byggda (01 Dalens rytm, 08 Gruvans andra våning, 11 Stenhyllan).
- Marcus och Rocco planerar **helt nya banor**. De 43 banorna från Rocco i `main` (labyrinter, bromsbalans, hjulhäng) är gjorda mot den äldre fysiken och ingår inte här.
- Förslag på fler mekanikbanor: studs-kedja, häng under flera balkar i rad, tyngdkraftsloop med två vändningar, dubbelstudskanten (Dubbelstudsen i atlasen).
