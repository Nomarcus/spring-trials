# Fjädra – 30 nya banor (för Claude)

Bygg 30 nya, korta och roliga banor till Fjädra (spelet i repot Nomarcus/spring-trials, `game/index.html`) utifrån skisserna här.

## Innehåll
- `plan.md` – progression: namn, idé, features, ny färdighet och svårighet (1–10) per bana.
- `bana_01.png` … `bana_30.png` – konceptskiss per bana (sidovy, numrerade features, streckad idealväg, äpplen, blomma = mål).
- `oversikt.jpg` – alla 30 i ett rutnät.

## Viktigt
- Skisserna är KONCEPT, inte exakt geometri. Tolka rytm, features och känsla – bygg geometrin så att den funkar med spelets riktiga fysik.
- Ändra INTE fysik, cykel eller ragdoll. Använd samma bandataformat som befintliga banor i `game/index.html`.
- Korta banor: ca 20–60 s per bana. Variera form (horisontell, vertikal klättring, nedfart, labyrint, fram-och-tillbaka med vändning, äpplen i gömda fickor). Inget enformigt.
- Bana 1–5 lär ut en sak i taget (gas, broms, luta, wheelie, pumpa), 6–12 kombinerar, 13–20 flow + teknik, 21–27 svåra kombos, 28–30 mästarbanor.
- Inspiration: Elasto Mania / Across + Sonic-flow: halfpipes, loopar, takkörning, bromssving upp på kanter, trånga tunnlar, schakt, vändningar.
- Släta kurvor (tillräcklig segmentupplösning), inga hak.
- Testa att varje bana går att klara med riktig fysik.

## Kända fel i skisserna
- Stjärnorna stämmer inte alltid – siffran "x/10" är rätt.
- Bana 10 (Skorstenen) ska vara ett smalt vertikalt schakt, inte en trappa.
- Bana 11: ignorera fotbollsmålet bredvid blomman.
- Bana 27: ignorera den svarta randen i nederkant.
- Bana 30: bromssvingen (feature 4) betyder att man bromsar/roterar cykeln upp på en hög kant – inte en hängande gunga.
