# Bankampanj: långa labyrinter

30 banor, från helt platt introduktion till åtta våningar. Endast bandata ändras; fysik, grafik, ragdoll, touch och ljud behålls.

Valven har en körbar ramp upp och en 2,65 meter hög återvändsgränd under. Ta stjärnan ovanpå, kör ner från änden, vänd tillbaka under valvet och vänd sedan ut igen. Våningarnas nedfarter är avsiktliga envägspassager: ta stjärnorna före nedfarten. Alla stjärnor ligger före öppningen, med plats att bromsa. Vid en miss finns den befintliga omstartsknappen.

| # | Bana | Svårighet | Våningar | Valv med retur | Avsedd väg, cirka m |
|---|---|---|---:|---:|---:|
| 1 | Startängen | Mycket lätt | 1 | 0 | 22.0 |
| 2 | Den lilla dalen | Mycket lätt | 1 | 0 | 36.0 |
| 3 | De mjuka kullarna | Mycket lätt | 1 | 0 | 52.0 |
| 4 | Första upptäcktsfärden | Lätt | 1 | 0 | 64.1 |
| 5 | Bergsvalvet | Lätt | 1 | 1 | 84.8 |
| 6 | Tillbaka under bron | Lätt | 1 | 1 | 96.8 |
| 7 | Bergets två våningar | Lätt | 2 | 0 | 104.6 |
| 8 | Den gömda gången | Lätt | 2 | 1 | 171.4 |
| 9 | Gruvans första vägskäl | Lätt | 2 | 1 | 183.4 |
| 10 | Lilla labyrinten | Lätt / medel | 3 | 1 | 210.9 |
| 11 | Stjärnan under stigen | Medel | 3 | 2 | 303.0 |
| 12 | Tre långa omvägar | Medel | 3 | 2 | 333.0 |
| 13 | Sicksackgrottan | Medel | 4 | 0 | 272.9 |
| 14 | De fyra valven | Medel | 4 | 2 | 389.4 |
| 15 | Bergsbiblioteket | Medel | 4 | 2 | 408.4 |
| 16 | Gruvans återvändsgränder | Medel | 4 | 3 | 446.0 |
| 17 | Den långa vägen hem | Medel / svår | 5 | 2 | 475.3 |
| 18 | Tvillingbergets gångar | Medel / svår | 4 | 3 | 486.6 |
| 19 | Ficklampans hemlighet | Medel / svår | 5 | 3 | 488.5 |
| 20 | De fem balkongerna | Medel / svår | 5 | 3 | 575.2 |
| 21 | Ormens långa resa | Svår | 5 | 3 | 617.1 |
| 22 | Djupgruvans valv | Svår | 6 | 4 | 644.3 |
| 23 | De gömda tvillingvalven | Svår | 5 | 4 | 654.8 |
| 24 | Bergens underjord | Svår | 6 | 4 | 685.2 |
| 25 | Vägskälens väktare | Svår | 6 | 5 | 800.8 |
| 26 | Stora bergslabyrinten | Svår | 6 | 5 | 844.2 |
| 27 | Sju våningar hem | Expert | 7 | 5 | 865.1 |
| 28 | Bergets minne | Expert | 7 | 6 | 1022.5 |
| 29 | Ormarkivet | Expert | 8 | 6 | 1029.3 |
| 30 | Hjärtat av labyrinten | Expert | 8 | 7 | 1208.4 |

## Återskapa och kontrollera

`python3 -m pip install "shapely>=2,<3"` följt av `python3 tools/build_level_campaign.py`. Shapely används endast vid banbygge. Spelet är fortfarande en HTML-fil utan nya runtimeberoenden. `node tests/levels.test.cjs` och `node tests/drive-campaign.cjs` kontrollerar genererade banor och skyddar allt utanför bandatablocket mot oavsiktliga ändringar.

Den separata körkontrollen använder en analog återkopplingsregulator i originalets fysikmotor och når alla stjärnor och målet på bana 1–7. Det ersätter inte speltest med touch eller tangentbord. Övriga banor har kontrollerats geometriskt, vid start och genom rendering, men inte körts hela vägen till mål. Medaljtiderna är preliminära designmål. Geometriska kontroller och stabila starter bevisar inte att samtliga avancerade banor är fullständigt speltestade.
