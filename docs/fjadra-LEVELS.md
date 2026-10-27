# Banor: format, lista och status

## Format (`src/levels.js`)
Enheter är **meter, y uppåt**. Ett bana-objekt:
```js
{ id:'fjadra-p3-01',             // STABILT ID. Rekord och spöken lagras på ID.
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
- **Registrera en bana:** `LV3.push(()=>({...}))`. Medaljtider (guld/silver, sekunder) i `MEDALS3` (efter ID). `makeLevels()` räknar ut segment och gränser med `finishLevel(l)`.
- **Mjuka kanter:** runda av toppar och rampers krön. Vassa vinklar kastar iväg cykeln.
- **Plats:** Marcus vill ha rymliga banor. Cykeln är ca 1,9 m mellan hjulaxlarna och 2,1 m hög med förare. Kör man upp och ner behövs minst ~4 m takhöjd.
- **Nya banor ska vara lösbara av boten eller av ett skript** innan de släpps. Lägg till dem i `NEWLV` i `logic.js` för NY-märket i menyn.

## Verifiera en bana
```bash
node tools/fjadra/test/run.js <index>        # 3 försök: bred stråle, bredare, ordnade stjärnor
```
Boten hittar inte vägen om målen ligger "bakåt" under starten; skriv då ett skript efter `tools/fjadra/test/script_spiral.js` (en enkel tillståndsmaskin med gas/broms/luta/vänd).

## Baneditorn (i spelet)
Menyn → pennan på en bana (eller *Mina banor* → **＋ Ny bana**). Koden ligger i `src/editor.js`.
- **Verktyg:** Flytta (dra marken med *Mjuk*-radie 0–8 m, dra stjärnor/start/blomma/block, dra i luften = panorera), Punkt (tryck på en linje), Radera, Stjärna, Blå stjärna (tryck igen = byt riktning), Block (trä, stål, sten, låda, stock, mark). Två fingrar panorerar och zoomar. Ångra/gör om (40 steg).
- **Testa** kör banan direkt (inga rekord sparas); pennan uppe till höger tar en tillbaka.
- **Spara:** egna banor → `localStorage['fjadra.mine']` (fliken *Mina banor*). Ändrade inbyggda banor → `localStorage['fjadra.edits']`; de ersätter originalet på den enheten och får märket ÄNDRAD tills man trycker *Återställ original*.
- **Spara för alla (claude.ai-länken):** artifacten har capability `db` (regler: alla läser, bara ägaren/Editors skriver). Spara på en inbyggd bana skriver också `levels/<banID>` = `{doc, at}`. Alla som öppnar länken får ändringen vid start (`edPull`). Claude läser samlingen med `ArtifactData` (`list`, collection `levels`), lägger in varje `doc` med `import_level.py` och tar sedan bort dokumenten, så att databasen inte skuggar senare ändringar i koden. En lokal ändring som är identisk med den inbakade banan rensas automatiskt vid start.
- **Utanför länken** (GitHub Pages): ⋯ → *Ladda ner alla ändringar* ger `fjadra-andringar.json` (`{v:1,edits:[…]}`), som `import_level.py` tar direkt.
- **Baka in i spelet:** editorn → ⋯ → *Kopiera bankod*. Spara koden i en fil och kör `python3 tools/fjadra/import_level.py bana.json` (ID för en inbyggd bana ersätter den, `mine-…` blir en ny bana `fjadra-p3-NN` sist). Koden hamnar i `EDITS` i `src/levels.js`. Bygg och kör testboten innan det släpps.

## Banlista
Banpaket 1 och 2 är borttagna (Marcus beslut). Spelet har bara banpaket 3 (32 banor). I tabellen står de gamla indexen 30–59: dra av 30 för bana 1–3 och dra av 28 från bana 4 (Bakhjulstrappan) och framåt, eftersom de två Elma-banorna (ID 31 och 32) ligger på plats 4 och 5.
Stenhyllans geometri finns kvar i `tools/fjadra/test/hang.js` som testbana för hänget.

### Banpaket 3 (30 banor efter skisserna i `fjadra_30_banor.zip`, lätt → svår)
Index fortsätter efter paket 2. Varje bana lär ut en teknik. Kolumnen *Bara gas* visar om banan går att klara utan tekniken (enkel förare som bara håller gas).

| # | ID | Namn | Tema | Stjärnor | Medalj guld/silver | Bot v11 | Bara gas |
|---|---|---|---|---|---|---|---|
| 30 | fjadra-p3-01 | Första turen (gas) | meadow | 3 | 16/26 | ✅ 11,4 s | klarar (meningen) |
| 31 | fjadra-p3-02 | Mjuka backen (broms + luta bak) | meadow | 1 | 14/24 | ✅ 9,4 s | klarar |
| 32 | fjadra-p3-03 | Lutbacken (luta fram) | sunset | 2 | 24/38 | ✅ 17,5 s | kraschar |
| (3) | fjadra-p3-31 | Plankstegen (Elma: plankstege över ravin, loop, stockar, vågor, ö) | meadow | 8 | 75/105 | ✅ del för del, 64 s | 366 m, `parts` |
| (4) | fjadra-p3-32 | Elmadalen (Elma: gungdal, plankor nerför, dubbelloop, grotta, hopp) | sunset | 8 | 85/120 | ✅ del för del, 82 s | 365 m, `parts` |
| 33 | fjadra-p3-04 | Bakhjulstrappan (wheelie) | meadow | 2 | 12/20 | ✅ 7,9 s | fastnar/kraschar |
| 34 | fjadra-p3-05 | Pumpdalen (pumpa) | sunset | 2 | 13/22 | ✅ 8,3 s | kraschar |
| 35 | fjadra-p3-06 | Lilla gapet (hopp) | meadow | 1 | 11/18 | ✅ 7,8 s | klarar |
| 36 | fjadra-p3-07 | Halfpipe-gungan (halfpipe) | sunset | 4 | 14/24 | ✅ 7,8 s | kraschar |
| 37 | fjadra-p3-08 | Första loopen (loop) | meadow | 1 | 16/26 | ✅ 35,4 s | klarar 10,5 s |
| 38 | fjadra-p3-09 | Grytet (tunnel) | meadow | 1 | 11/18 | ✅ 7,2 s | missar stjärnan |
| 39 | fjadra-p3-10 | Plankbron (grop, plankbro, fall ner i dalen) | cave | 3 | 14/22 | ✅ 11,2 s | ersatte Skorstenen (för svår) |
| 40 | fjadra-p3-11 | Fram och tillbaka (vändning) | winter | 2 | 30/45 | ✅ 23,3 s | kraschar |
| 41 | fjadra-p3-12 | Vågor och gap (pump + hopp) | sunset | 3 | 15/24 | ✅ 10,7 s | kraschar |
| 42 | fjadra-p3-13 | Berg-och-dalbanan (flow) | meadow | 5 | 30/45 | ✅ 31,8 s | kraschar vid hoppet |
| 43 | fjadra-p3-14 | Upp och ner (tyngdkraft, tak) | sunset | 1 + 2 blå | 14/24 | ✅ 9,7 s | kraschar |
| 44 | fjadra-p3-15 | Bromssvingen (hög kant) | winter | 1 | 11/18 | ✅ 7,0 s | kraschar |
| 45 | fjadra-p3-16 | Vändgrottan (vändning, hål i golvet) | cave | 3 | 30/45 | ✅ 27,0 s | – |
| 46 | fjadra-p3-17 | Störtloppet (nedfart, landa på avsatser) | winter | 6 | 16/26 | ✅ 11,1 s | kraschar |
| 47 | fjadra-p3-18 | Gömda fickor (nischer, hål genom vägg) | sunset | 4 | 26/40 | ✅ 20,5 s | kraschar |
| 48 | fjadra-p3-19 | Dubbelloopen | meadow | 4 | 36/52 | ✅ 31,6 s | andra loopen flyttad efter backen |
| 49 | fjadra-p3-20 | Labyrinten (gångar, schakt) | cave | 4 + 2 blå | 34/50 | ✅ 28,4 s | – |
| 50 | fjadra-p3-21 | Takgapet (tak med glapp, två gropar) | sunset | 4 + 4 blå | 24/36 | ✅ 18,3 s | kraschar |
| 51 | fjadra-p3-22 | Svingtornet (fyra väggar) | winter | 4 | 24/36 | ✅ 17,5 s | kraschar sist |
| 52 | fjadra-p3-23 | Rördrömmen (halfpipe, loop, tunnel) | meadow | 5 | 26/40 | ✅ 18,9 s | kraschar sist |
| 53 | fjadra-p3-24 | Trånga passet (slingrig tunnel) | cave | 5 | 34/50 | ✅ 28,5 s | kraschar |
| 54 | fjadra-p3-25 | Fritt fall (stjärnor i luften) | sunset | 6 | 40/60 | ✅ 59,2 s | kraschar |
| 55 | fjadra-p3-26 | Dit och tillbaka (ut ovan, hem i tunnel) | meadow | 6 | 50/75 | ✅ 47,8 s | – |
| 56 | fjadra-p3-27 | Spiralschaktet (tyngd upp/vänster/höger) | cave | 2 + 5 blå | 30/45 | ✅ 18,0 s · skript `script_spiral.js` | – |
| 57 | fjadra-p3-28 | Stora flödet (allt i rytm) | sunset | 7 + 2 blå | 50/75 | ✅ 53,0 s | kraschar |
| 58 | fjadra-p3-29 | Gatloppet | winter | 6 + 2 blå | 50/75 | ✅ 43,0 s | kraschar |
| 59 | fjadra-p3-30 | Maraton (ersätter Fjädertoppen) | meadow | se nedan | se nedan | del för del, se nedan | – |

Bana 16–30 är längre (100–250 m). Kör testboten med längre tidsgräns: `MAXT=150 node tools/fjadra/test/run.js 59`.

**Lärdomar från 16–30:**
- *Hål i golvet* (Vändgrottan): rullar man långsamt över kanten tippar cykeln framåt och landar på huvudet. Med 4–8 m/s och ↺ intryckt över kanten landar den rätt. Hålen är 6 m breda och våningarna 4,2 m isär (3,7 m takhöjd) – lägre tak ger huvudkrasch när cykeln studsar.
- *Bromsa en gång och håll*: broms som slås av och på när fjädern är ihoptryckt ger Elma-studs (upp till 3,8 m/s uppåt) – i låga tunnlar slår huvudet i taket.
- *Testbotens svaghet*: den jagar närmaste stjärna fågelvägen. Ligger en stjärna rakt under en återvändsgränd fastnar den. Lägg stjärnorna så att "närmast" också är vägen dit.
- *Loopar*: efter landningen i diket vill cykeln steglas – luta framåt. Fjädertoppen använder samma loop-par som Dubbelloopen.
- *Falla uppåt* från en kant är lika våldsamt som att falla nedåt. Spiralschaktet byter i stället tyngdriktning vid varje vägg (upp → vänster → upp → höger → ner); stjärnhjälpen vrider då cykeln rätt.

**Loopar** (`loopRide`, anropas via `loopParts` i `levels.js`): man kör rakt in i loopen. Loopens botten ligger strax under vägen som en bro över ett dike; vägen slutar vid en kant och cykeln landar i bottenkurvan, kör varvet och faller efter varvet ut genom öppningen nere till vänster (215°–255°) ner i diket. Dikets vänstervägg är en större cirkel runt samma mittpunkt (avstånd 2,3 m) så att man landar mjukt, och diket leder ut under loopen. Kräver ca 15,5–17 m/s. (Den första versionen sköt in cykeln med en 60°-ramp genom en öppning i botten – den flög rakt upp i taket.)

**Skorstenen** (bana 10, tyngdkraftsschakt) är borttagen eftersom Marcus tyckte att den var för svår så tidigt. Ersattes av **Plankbron**: en lätt rak bana som lär ut plankor (huvudet går igenom, hjulen kör på) och att ett fall på 4 m är ofarligt.

**Dubbelloopen** (bana 19): när looparna gjordes om till inkörningsloopar flyttades loopens start ~6 m åt vänster. Den andra loopen hamnade då mitt i nerförsbacken, så backen gick rakt igenom loopen. `P19.c2` är nu 112 (var 94), så backen planar ut innan loopen.

Lärdom från bana 2: broms under `PIN_V` (3,8 m/s) låser hjulet mot marken. Tvärbroms utan att luta bakåt i en brant nedförsbacke slår runt cykeln framåt, och broms när framhjulet landar ger en Elma-studs. Håll nedförsbackar i nybörjarbanor under ~30° med breda krön.

## Idéer och referens
- `docs/reference/atlas-20-banor.jpg` + `chatgpt-20-banor-prompt.txt`: ChatGPT:s atlas med 20 bankoncept (Dalens rytm, Åttans hemlighet, Spiralbrunnen, Nyckelhålet …). Bedömning: 01, 03, 05, 07, 09 enkla; 02, 04, 06, 08, 10, 14, 15, 16 medel (tak, flera våningar); 11, 12, 19 beror på bromshäng; 13, 17, 18, 20 för tajta som ritade och måste byggas bredare med körbara lutningar under ~35°. Tre av dem är byggda (01 Dalens rytm, 08 Gruvans andra våning, 11 Stenhyllan).
- Marcus och Rocco planerar **helt nya banor**. De 43 banorna från Rocco i `main` (labyrinter, bromsbalans, hjulhäng) är gjorda mot den äldre fysiken och ingår inte här.
- Förslag på fler mekanikbanor: studs-kedja, häng under flera balkar i rad, tyngdkraftsloop med två vändningar, dubbelstudskanten (Dubbelstudsen i atlasen).


## Maraton (bana 30)
Byggd efter `docs/reference/marathon/` (10 delar, 48 punkter): fem klättringsdelar upp till toppen, toppen, fyra delar downhill. Ca 2,3 km.
- **Höjderna är halverade** (topp 120 m i stället för 240 m): fysiken har inget luftmotstånd, så 240 m nerför ger orimliga farter.
- Klättringen håller max ~18° (`ease(dy*5, dy)`): 25° går men cykeln kryper i 3–4 m/s.
- Byggs med en "penna" (`flat`, `ease`, `hills`, `dips`, `gap`, `canyon`, `pipe`, `loop`, `wall`, `tunnel`, `pocket`, `shaft`, `ceiling`, `overhang`, `rest`) – se koden.
- Stjärnorna ligger där man inte kan missa dem (platåer, tunnlar, fickor, tak-körning) – inga stjärnor i looparna, så en misslyckad loop tvingar inte fram omstart av hela banan.
- `l.parts` = viloplatåerna mellan delarna. `node tools/fjadra/test/run_marathon.js [del…]` kör testboten på en del i taget (startar stilla på platån, ska nå nästa med alla stjärnor däremellan; bara segmenten runt delen används så att det går fort).
- Prestanda: ca 5 200 segment, ~35 ms fysik per spelsekund på en dator (övriga banor 7–13 ms).

## Elma-banorna (bana 4 och 5)
Marcus ville ha "mycket mer Elasto": längre banor med mycket upp och ner, plankor, loopar och hinder (som hans egna editorbanor). Båda byggs med `mkTrack()` i `levels.js`, en penna som ritar marken framåt och lägger till plankor (`T.plank`), stockar (`T.log`), loopar (`T.loop`) och stjärnor.
- **Plankstegen:** sex lutande plankor med 0,6 m glipor går som en trappa upp över en 7 m djup ravin. Ravinens vänstersida är mjuk så att man kan köra upp igen efter ett fall. Sedan kommer en 10 m nerförsbacke in i en loop, en 8 m klättring, stockar, tre stora vågor (3,2 m) och ett hopp upp på en ö.
- **Elmadalen:** först en 7 m djup gungdal. Sedan fem plankor som trappsteg nerför (marken under följer med), dubbelloop, 8 m klättring, en grotta under en sned stenhylla, hopp över en svacka, stockar och vågor.
- Verifiering: `LEVEL=fjadra-p3-31 node tools/fjadra/test/run_marathon.js` kör banan del för del (`parts`).

## Marcus egna versioner (inbakade i EDITS)
Marcus spelade och ändrade 11 banor i editorn och sparade dem via länkens databas. De är inbakade i `EDITS` i `levels.js` precis som han gjorde dem: Pumpdalen, Lilla gapet, Halfpipe-gungan, Första loopen, Grytet, Fram och tillbaka, Dubbelloopen, Rördrömmen, Maraton, Plankstegen och Elmadalen.
- Medaljtiderna är skalade efter den nya banlängden. De är inte testade med boten, eftersom Marcus testar själv.
- Pumpdalen avslutas avsiktligt på ett snett tak: en blå stjärna vänder tyngden, och stjärnan och blomman sitter under taket.
- `parts` för Maraton, Plankstegen och Elmadalen följer inte med i EDITS, så `run_marathon.js` fungerar inte på de versionerna.

## Skill-delar (banor Marcus inte ändrat)
Marcus ville ha längre, mer varierade banor med mycket skill. Varje inbyggd bana som inte finns i `EDITS` får en ny del före originalet (`SKILL` i `levels.js`, `addIntro`). Delen startar längre till vänster och kör in där banans vänstra vägg låg. Labyrinten och Fritt fall får i stället en del efter (`SKILL_END`, `addOutro`), där gamla blomman blir en stjärna. Spiralschaktet är orört, eftersom blomman sitter inne i spiralen.
- Byggstenar (`skillKit`):
  - `hang`: trials-trappa med kort ansats, hopp och häng i kanten med bromsen.
  - `ledge`, `notch` (springa), `drop` (stup) och `pit` (grop att pumpa sig ur).
  - `hill`, `kicker` (hopp med stjärna i luften) och `speedLoop`.
  - `logs`, `stoneSteps`, `crates` (lådtrappa) och `lowRoof` (lågt tak över en puckel).
  - `stairs` (plankstege över ravin), `beams` (stålbalkar över ravin) och `stepsDown`.
- Medaljtiderna ökas med delens längd (guld +längd/4,5 s, silver +längd/3 s). Banorna är inte testade med boten; Marcus testar själv.
- Ändrar Marcus en sådan bana i editorn sparas hela banan, inklusive skill-delen, i EDITS, och `addSkill` hoppar över den.
