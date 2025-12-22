-- Translate missing Romanian activities
-- 14 activities need Romanian translations

UPDATE activities SET 
  name_ro = 'Seară de Trivia la un Bar de Bere Artizanală din București',
  description_ro = 'Testează-ți cunoștințele generale într-o atmosferă relaxată la un bar de bere artizanală din București. Formează o echipă cu prietenii și bucură-te de bere locală în timp ce răspunzi la întrebări despre cultură, istorie, sport și divertisment.'
WHERE id = 107;

UPDATE activities SET 
  name_ro = 'Inițiere în Olărit la Roată (București)',
  description_ro = 'Descoperă arta olăritului într-o sesiune practică la roata olarului în București. Învață tehnici de bază de modelare a argilei și creează propria ta creație ceramică sub îndrumarea unui meșter olar experimentat.'
WHERE id = 109;

UPDATE activities SET 
  name_ro = 'Atelier de Fabricare Lumânări (București)',
  description_ro = 'Creează lumânări personalizate parfumate într-un atelier creativ din București. Învață despre diferite tipuri de ceară, fitiluri și parfumuri în timp ce îți creezi propriile lumânări unice de dus acasă.'
WHERE id = 110;

UPDATE activities SET 
  name_ro = 'Picnic la Apus în Parcul Herăstrău',
  description_ro = 'Bucură-te de un picnic romantic la apusul soarelui în cel mai mare parc din București. Relaxează-te lângă lac cu mâncare delicioasă și priveliști frumoase în timp ce soarele apune peste capitală.'
WHERE id = 113;

UPDATE activities SET 
  name_ro = 'Cină pe Terasă cu Vedere la Oraș (București)',
  description_ro = 'Savurează o cină romantică pe o terasă la înălțime cu priveliști panoramice asupra Bucureștiului. Bucură-te de bucătărie rafinată și atmosferă intimă în timp ce admiri luminile orașului de noapte.'
WHERE id = 114;

UPDATE activities SET 
  name_ro = 'Curs Privat de Gătit pentru Doi (București)',
  description_ro = 'Învață să gătești mâncăruri delicioase împreună într-un curs de gătit privat pentru cupluri. Un chef profesionist vă va ghida prin prepararea unui meniu complet, de la aperitive la desert, într-o atmosferă intimă.'
WHERE id = 115;

UPDATE activities SET 
  name_ro = 'Seară de Privit Stelele lângă București',
  description_ro = 'Evadează din oraș pentru o noapte romantică de observare a stelelor. Departe de poluarea luminoasă, admiră cerul înstelat, învață despre constelații și bucură-te de liniștea nopții sub un cer clar.'
WHERE id = 116;

UPDATE activities SET 
  name_ro = 'Tur al Fantomelor în București (Centrul Vechi)',
  description_ro = 'Explorează partea întunecată a istoriei Bucureștiului într-un tur ghidat al fantomelor prin Centrul Vechi. Ascultă povești înfiorătoare despre clădiri bântuite, legende urbane și evenimente misterioase din trecutul capitalei.'
WHERE id = 117;

UPDATE activities SET 
  name_ro = 'Tur Culinar prin Piețele Bucureștiului (Obor/Dorobanți)',
  description_ro = 'Descoperă autenticele piețe alimentare ale Bucureștiului într-un tur ghidat. Gustă produse locale, brânzeturi tradiționale, mezeluri și specialități românești în timp ce înveți despre cultura culinară locală de la un ghid expert.'
WHERE id = 118;

UPDATE activities SET 
  name_ro = 'Tur de Shopping Vintage în București',
  description_ro = 'Explorează cele mai bune magazine vintage și second-hand din București. Descoperă piese unice de îmbrăcăminte, accesorii și obiecte retro în timp ce înveți despre moda și designul din diferite epoci.'
WHERE id = 119;

UPDATE activities SET 
  name_ro = 'Tur Arhitectural Pedestru în București',
  description_ro = 'Admiră diversitatea arhitecturală a Bucureștiului într-un tur pedestru ghidat. Descoperă clădiri Art Nouveau, arhitectură interbelică, construcții comuniste și creații contemporane în timp ce înveți despre evoluția urbanistică a capitalei.'
WHERE id = 120;

UPDATE activities SET 
  name_ro = 'Tur al Istoriei Comuniste în București',
  description_ro = 'Înțelege perioada comunistă a României printr-un tur educațional al Bucureștiului. Vizitează monumente emblematice, clădiri guvernamentale și locuri istorice în timp ce afli despre viața cotidiană și evenimentele majore din epoca comunistă.'
WHERE id = 121;

UPDATE activities SET 
  name_ro = 'Tur al Patrimoniului Evreiesc în București',
  description_ro = 'Explorează bogata istorie a comunității evreiești din București. Vizitează sinagogi istorice, muzee și cartiere semnificative în timp ce afli despre contribuțiile culturale și provocările comunității evreiești din capitală.'
WHERE id = 122;

UPDATE activities SET 
  name_ro = 'Curs de Pilates (București)',
  description_ro = 'Îmbunătățește-ți flexibilitatea, forța și postura într-un curs de Pilates în București. Învață exerciții controlate de întărire a mușchilor profunzi sub îndrumarea unui instructor certificat, potrivit pentru toate nivelurile de fitness.'
WHERE id = 126;

-- Verify translations
SELECT id, name, name_ro, category 
FROM activities 
WHERE id IN (107, 109, 110, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 126)
ORDER BY id;
