# Designbeslut och Marcus krav (i den ordning de kom)

Marcus är systemutvecklare som bygger spel på hobbynivå, skriver svenska, kort och ibland via röstinmatning. Han testar på telefon i liggande läge. Han styr genom att beskriva *känsla*, så tolka vad han menar och verifiera mot fysiken.

## Fysik och känsla
1. Spelet ska kännas som **Elasto Mania**: fjädringen är det roliga, man slänger sig runt och använder fysiken på banorna. Men inte en kopia (därför stjärnor, annan cykel, egna banor).
2. **Trials-känsla:** lugnare tempo, tyngre cykel, "pussel" snarare än att köra fram och tillbaka. Föraren står/sitter som en trialsförare och viktförflyttning är en egen mekanik.
3. **Mjukare fjädring** med längre hjulbas. Cykeln ska inte vara för känslig.
4. **Förarens fysik:** egen fjädrad kropp som gungar med i landningar, ragdoll vid krasch med mjuka leder.
5. **Bunny hop** som i Trials: bromsa, luta bak, sen fram. **Pumpning** med armarna för att ta fart. **Elma-studs** på broms i botten av fjädringen. **Brutal volt.**
6. **Hänga i bakhjulet** med bromsen och **köra upp och ner** (blå stjärnor). Banorna ska kräva detta, med **gott om yta**.
7. **Man ska inte dö i onödan:** fjädringen slår aldrig igenom, en lätt stöt med huvudet är en duns, huvudet går igenom tunna balkar, och efter en blå stjärna vrider sig cykeln själv rätt. Man ska kunna **kämpa sig tillbaka** när man välter bakåt (broms + luta fram).
8. **Inga dödliga hinder** (spikbollar, sågar) tills vidare.
9. Vändningen ska se ut som ett papper som vänder sig. (Nu: hela cykeln svänger runt sin lodräta axel, hjulen glider förbi varandra.)

## Grafik
- **Ren, enkel, tydlig, supermjuk, lugn, ADHD-vänlig.** Fysiken är det som ska vara vilt. Inga skärmskakningar, få och långsamma effekter, svag vinjett. Bergen "uppe vid molnen" togs bort. Äpplen ska sitta i trädkronan.
- **Referens:** Trials-spelens förare och motorcykel (mörk hjälm, spegelgoggles, mörk jacka, trialscykel med smal ram). Se `docs/reference/`.
- **Stil:** tecknad (grundstil, med ChatGPT:s polerade palett) och **neon** som valbar stil som ska finnas kvar. Ett grafikark med 20 stilförslag finns (länk i `CLAUDE.md`); inget av dem är valt ännu.
- **Kontroller (liggande mobil):** vänster ↺ ↻ (stora, 90 px). Höger: övre rad OMSTART + VÄND (små), undre rad BROMS + GAS (lika stora, röd/grön). Översiktsknapp, ljud och paus uppe till höger. Banans namn i en tydlig ruta.
- Banmeny: flikar *Banpaket 1/2*, förhandsbild, guldtid, framsteg, **Spela nästa**.
- Musik: lugn, genererad. Suno-spår finns i repot men är inte inkopplade.

## Releasehistorik (kort)
- v1–v3: första fysikcykeln (hjul på fjädrar med impulsbaserad kontakt), 7 banor, papperskänsla i vändning.
- v4: förarens egen fjädrade massa, bunny hop, ragdoll.
- v5: stjärnor, bromsgrepp (häng), tyngdkraftsbanor, rymligare banor.
- v6: trögare fart, pumpning, Elma-studs, brutal volt.
- v7: 20 förbättringar: spöke, översikt, konfetti, blomma som knoppar, fler banor.
- v8: bottenstopp (ingen igenomslag), borttagna dödliga hinder, lugn grafik, kamera.
- v9: musik, nya banor, trialsförare och cykel, mjukare vändning, kontroller omgjorda.
- v10: stabila ban-ID, Banpaket 2, förlåtande hjälm, vändhjälp, bättre häng, översikt, pilar.
- **v11:** ragdoll fixad (4× för hög startfart), bromsen flyttar vikt, anti-vält, mjuk bana 1 + ledtråd, neon-stil.
- **v11.1:** ChatGPT:s grafikuppdatering inbyggd.
