# Bankampanj: blandade trials och labyrinter

38 banor: 14 utvalda labyrinter och 24 individuellt formgivna trialsbanor. De 30 gamla bandefinitionerna finns kvar i byggverktygets ORIGINAL_CAMPAIGN; 16 återkommande labyrintvarianter ingår inte längre i huvudkampanjen. Halvcirklar, fartdalar, rena uppförsbanor, nedfarter från höger, dubbla hjulfickor och en vertikal nedfart. Startorientering är bandata; fysik, grafik, ragdoll och ljud behålls.

Valven har en körbar ramp upp och en 2,65 meter hög återvändsgränd under. Ta stjärnan ovanpå, kör ner från änden, vänd tillbaka under valvet och vänd sedan ut igen. Våningarnas nedfarter är avsiktliga envägspassager: ta stjärnorna före nedfarten. Alla stjärnor ligger före öppningen, med plats att bromsa. Vid en miss finns den befintliga omstartsknappen.

| # | Bana | Svårighet | Våningar | Valv med retur | Avsedd väg, cirka m |
|---|---|---|---:|---:|---:|
| 1 | Startängen | Mycket lätt | 1 | 0 | 22.0 |
| 2 | Pumpstranden | Mycket lätt | 1 | 0 | 60.0 |
| 3 | Den lilla dalen | Mycket lätt | 1 | 0 | 36.0 |
| 4 | Skålens rytm | Lätt | 1 | 0 | 29.4 |
| 5 | De mjuka kullarna | Mycket lätt | 1 | 0 | 52.0 |
| 6 | Vänstervägen | Lätt | 1 | 0 | 80.3 |
| 7 | Första upptäcktsfärden | Lätt | 1 | 0 | 64.1 |
| 8 | Medvinden | Lätt | 1 | 0 | 109.1 |
| 9 | Tvillingtopparna | Lätt | 1 | 0 | 61.1 |
| 10 | Bergsvalvet | Lätt | 1 | 1 | 84.8 |
| 11 | Öarnas väg | Medel | 1 | 0 | 60.0 |
| 12 | Bergsbestigaren | Medel | 1 | 0 | 124.4 |
| 13 | Tillbaka under bron | Lätt | 1 | 1 | 96.8 |
| 14 | Bergets två våningar | Lätt | 2 | 0 | 104.6 |
| 15 | Rutschkanan | Medel | 1 | 0 | 86.8 |
| 16 | Tandemgreppet | Medel | 1 | 0 | 34.1 |
| 17 | Låga porten | Medel | 1 | 0 | 46.0 |
| 18 | Lilla labyrinten | Lätt / medel | 3 | 1 | 210.9 |
| 19 | Trappan mot himlen | Medel | 1 | 0 | 45.5 |
| 20 | Halvmånen | Medel / svår | 1 | 0 | 38.4 |
| 21 | Sicksackgrottan | Medel | 4 | 0 | 272.9 |
| 22 | Vändkroken | Svår | 1 | 0 | 55.2 |
| 23 | Kanten och hänget | Svår | 1 | 0 | 51.0 |
| 24 | Bromsbalansen | Svår | 1 | 0 | 46.0 |
| 25 | Gruvans återvändsgränder | Medel | 4 | 3 | 446.0 |
| 26 | Två snabba bågar | Svår | 1 | 0 | 62.6 |
| 27 | Mittpunkten | Svår | 1 | 0 | 114.1 |
| 28 | Himmelsvarvet | Svår | 1 | 0 | 13.0 |
| 29 | Ficklampans hemlighet | Medel / svår | 5 | 3 | 488.5 |
| 30 | Toppen från höger | Svår | 1 | 0 | 121.9 |
| 31 | Hjulnyckeln | Expert | 1 | 0 | 50.0 |
| 32 | Rännans mitt | Svår | 1 | 0 | 77.8 |
| 33 | Djupgruvans valv | Svår | 6 | 4 | 644.3 |
| 34 | Raketen | Expert | 1 | 0 | 45.2 |
| 35 | Schaktets fall | Expert | 1 | 0 | 91.8 |
| 36 | Stora bergslabyrinten | Svår | 6 | 5 | 844.2 |
| 37 | Sista flytet | Expert | 1 | 0 | 146.5 |
| 38 | Hjärtat av labyrinten | Expert | 8 | 7 | 1208.4 |

## Återskapa och kontrollera

`python3 -m pip install "shapely>=2,<3"` följt av `python3 tools/build_level_campaign.py`. Shapely används endast vid banbygge. Spelet är fortfarande en HTML-fil utan nya runtimeberoenden. `node tests/levels.test.cjs`, `node tests/drive-campaign.cjs` och `node tests/trials-drive.cjs` kontrollerar genererade banor och skyddar allt utanför bandatablocket mot oavsiktliga ändringar.

Den separata körkontrollen använder en analog återkopplingsregulator i originalets fysikmotor och når alla stjärnor och målet på de första sju ursprungliga labyrintbanorna (kontrollen söker efter namn, inte menyplats). Ytterligare nio trialsbanor – inklusive vänsterstarter, uppförsbanorna och skål-/flowbanor – körs till alla stjärnor och målet av `trials-drive.cjs`. Det ersätter inte speltest med touch eller tangentbord. De övriga teknikbanorna, inklusive Halvmånen, hjulfickorna, gravitationsbanan och expertlabyrinterna, har kontrollerats geometriskt, vid start och genom rendering, men inte körts hela vägen till mål. Medaljtiderna är preliminära designmål. Geometriska kontroller och stabila starter bevisar inte att samtliga avancerade banor är fullständigt speltestade.

Hjulfickorna har 1,92 meters centrumavstånd, lika med originalcykelns hjulbas. Övningsfickorna är 1,28 meter breda och 0,62 meter djupa; expertfickorna är 1,10 meter breda och 0,90 meter djupa. Originalhjulens diameter är 0,80 meter. Stjärnorna i expertfickorna ligger nere i urtagen. Inga magnetgrepp eller nya kollisionsregler läggs till.
