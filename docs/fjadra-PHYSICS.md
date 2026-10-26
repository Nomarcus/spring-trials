# Fysiken i `src/core.js`

Ingen DOM. Exporteras som modul till testerna (`module.exports` sist i filen, tas bort av bygget).

## Tidssteg
Fast steg `P.H = 1/600 s`. `physics(dt)` i `logic.js` kör en ackumulator med högst 40 delsteg per bildruta, så beteendet är oberoende av bildfrekvens. **Byt inte till 1/60 s:** fjädrarna (KBUMP 2400, KPIN 2600) blir instabila och cykeln kan åka genom tunna balkar (0,26 m) i 12 m/s.

## Modell
- **Kropp** (`b`: x, y, vx, vy, vinkel a, vinkelfart w; massa `BM`, tröghet `BI`) + **två hjul** (`wh[0]` bak, `wh[1]` fram, radie `WR` 0,4, ankare ±`AX`, `AY`) + **förare** (`r`, egen fjädrad massa `MR` med fjäder `KR`/`CR`).
- Fjädring per hjul: linjär fjäder `KX/KY`, dämpning `CX/CY`, **progressivt bottenstopp** efter `TRAVEL` 0,3 m (`KBUMP`, `CBUMP`) så man aldrig "slår igenom". Hjulet kan sträckas till `STRETCH`.
- **Bara hjulen (cirklar mot linjesegment) och huvudet (cirkel `HR`) kolliderar.** Kroppen går genom allt. Friktion `MU` 3,2 (`MUB` 9 vid broms), studs `REST`.
- Förarens mål följer luta-knappen (`riderTarget`); benen stelnar när han trycks ihop (`RDOWN`, `KRBUMP`). Broms flyttar vikten framåt (`BRK_SHIFT`).

## Moment (var och en har tester)
| Moment | Hur det utlöses | Nyckelkonstanter |
|---|---|---|
| Gas | `thr` ramp upp (`THR_RATE`), vridmoment minskar med hjulfart; lite lyft i låg fart (`GAS_LOW`); **anti-vält** över ~43° i låg fart (`ANTI_LOOP`) | `T`, `MAXW` |
| Volt | tryck ↺/↻ = impuls `VOLT_A` i `VOLT_T`; spärr `VOLT_LOCK`; båda knapparna = alovolt (`ALO`); ×`VOLT_BRAKE` vid broms på marken | |
| Luta (håll) | `HOLD` upp till `LEANMAX` rad/s | |
| Pumpa | luta bak ≥ en stund, kasta sen fram medan hjulen har grepp: fartkick upp till `PUMP_VMAX` | `PUMP`, `PUMP_CD` |
| Bunny hop | luta bak ≥ `HOP_MIN`, kasta fram inom `HOP_WIN`, på marken | `HOP` |
| Studs (Elma-bounce) | tryck BROMS när ett hjul är maximalt ihoptryckt (`compMem`) | `BOUNCE`, `BOUNCE_MAX`, `BOUNCE_MIN` |
| Broms | låser hjulen mot kroppens rotation (`BRAKE`) | |
| **Bromsgrepp / häng** | broms + hjulet rör vid något i låg fart (`PIN_V`) → hjulet "pinnas" fast (fjäder `KPIN`, max `PIN_MAX`, släpper vid `PIN_REL`). Fångar även om man bromsar upp till 0,3 s sent (inom 16 cm). Häng dämpas (`HANG_DAMP`) och lutning ger kontroll (`HANG_LEAN`). | |
| Räddning | broms + luta full framåt när cykeln välter bakåt (~17–80°): motmoment `SAVE` | `SAVE` |
| Vändning | `turn(bk)`: byter `dir`; 0,38 s ritad animation (`FLIP_T`), fysiken påverkas inte | |
| Tyngdkraft | `setGravity(bk,gx,gy)` från blå stjärnor; **assist** vrider cykeln mot nya "golvet" och vänder föraren om den landar åt fel håll | `ASSIST_*` |
| Huvud | `headResolve`: **ignorerar stål-/trä-balkar**, lätt stöt = duns (`bump`), kraftig träff (> `HEAD_SAFE` 3,2 m/s) = krasch | `HEAD_SAFE` |
| Ragdoll | vid krasch: 7 punkter, Verlet 240 Hz, repliknande korsförstyvningar, led-vinkelgränser för knä/armbåge, startfart = förarens egen. Krasch-rutan visas efter 1,1 s. | |

## Testa fysiken
`tools/fjadra/test/all-physics.sh` skriver en rapport. Jämför med `tools/fjadra/test/BASELINE.txt` (ragdoll-testerna är slumpade och varierar). Vad varje test visar:
- `feel.js` gas, pumpning, studs, brutal volt. `drops.js` fall 1–10 m i olika vinklar (ska aldrig ge `DEAD`). `gas_ramp.js` / `gas_lean.js` vältning med gas. `save.js` räddning vid bakåtvältning. `hop.js` bunny hop. `hang.js` hänget på Stenhyllan i olika farter/bromstidpunkter. `ragdoll_*.js` energi och glidlängd.
- **Testboten** `beam.js`: stråle-sökning över inputsekvenser (gas, broms, luta, volt, vänd, alovolt …) i 0,25 s-steg. `node run.js <index…>` skriver `WIN <tid>` eller `FAIL`. Flaggan `ordered:true` (tredje försöket i `run.js`) tar stjärnorna i listans ordning, nödvändigt för tyngdkraftsbanor.

## Fallgropar vi redan hittat
- Verlet-korrigeringar som ändrar position utan att ändra `px/py` **tillför energi** (ledgränserna kastade föraren 20 m tills de gjordes till rena positionsförskjutningar).
- Ett perfekt lodrätt ragdoll-torso är en inverterad pendel och faller aldrig; därför en liten slumpad sidokraft (`rd.bias`).
- Bromsgreppet måste bortses från en stund efter en studs (`noPin`), annars sugs hjulet fast.
- Vassa kanter på ramper kastar iväg cykeln; runda av toppar.


## Fjädringsval (menyn → Fjädring)
`SUSP` i `core.js` skriver över fjäder `KY`, dämpning `CY`, fjäderväg `TRAVEL` (och för de studsigaste `BOUNCE_MAX`). `setSusp(namn)` sätter värdena; `normal` = `P` som allt är testat med (`BASELINE.txt`).

| Val | KY | CY | TRAVEL | BOUNCE_MAX | sjunker i vila | studs (broms+bak→fram, bakhjul) |
|---|---|---|---|---|---|---|
| Hård (`hard`) | 240 | 9 | 0,22 | 3,8 | 0,09 m | 0,09 m |
| Normal | 118 | 4,6 | 0,30 | 3,8 | 0,19 m | 0,24 m |
| Mjuk (`soft`) | 85 | 2,4 | 0,45 | 3,8 | 0,22 m | 0,34 m |
| Elma (`elma`) | 70 | 1,2 | 0,60 | 4,6 | 0,38 m | 0,48 m |
| Studsboll (`bouncy`) | 62 | 0,5 | 0,70 | 5,4 | 0,56 m | 1,00 m |

Inget val ger huvudkrasch vid fall från 6 m. Testboten klarar bana 1–10 med alla fem valen. Kör boten med ett annat val: `SUSP=elma node tools/fjadra/test/run.js 0 1 2`.
