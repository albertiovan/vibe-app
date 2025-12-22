/**
 * Translate missing Romanian activities
 * Updates 14 activities that are missing Romanian translations
 */

import { Pool } from 'pg';

const translations = [
  {
    id: 107,
    name_ro: 'Seară de Trivia la un Bar de Bere Artizanală din București',
    description_ro: 'Testează-ți cunoștințele generale într-o atmosferă relaxată la un bar de bere artizanală din București. Formează o echipă cu prietenii și bucură-te de bere locală în timp ce răspunzi la întrebări despre cultură, istorie, sport și divertisment.'
  },
  {
    id: 109,
    name_ro: 'Inițiere în Olărit la Roată (București)',
    description_ro: 'Descoperă arta olăritului într-o sesiune practică la roata olarului în București. Învață tehnici de bază de modelare a argilei și creează propria ta creație ceramică sub îndrumarea unui meșter olar experimentat.'
  },
  {
    id: 110,
    name_ro: 'Atelier de Fabricare Lumânări (București)',
    description_ro: 'Creează lumânări personalizate parfumate într-un atelier creativ din București. Învață despre diferite tipuri de ceară, fitiluri și parfumuri în timp ce îți creezi propriile lumânări unice de dus acasă.'
  },
  {
    id: 113,
    name_ro: 'Picnic la Apus în Parcul Herăstrău',
    description_ro: 'Bucură-te de un picnic romantic la apusul soarelui în cel mai mare parc din București. Relaxează-te lângă lac cu mâncare delicioasă și priveliști frumoase în timp ce soarele apune peste capitală.'
  },
  {
    id: 114,
    name_ro: 'Cină pe Terasă cu Vedere la Oraș (București)',
    description_ro: 'Savurează o cină romantică pe o terasă la înălțime cu priveliști panoramice asupra Bucureștiului. Bucură-te de bucătărie rafinată și atmosferă intimă în timp ce admiri luminile orașului de noapte.'
  },
  {
    id: 115,
    name_ro: 'Curs Privat de Gătit pentru Doi (București)',
    description_ro: 'Învață să gătești mâncăruri delicioase împreună într-un curs de gătit privat pentru cupluri. Un chef profesionist vă va ghida prin prepararea unui meniu complet, de la aperitive la desert, într-o atmosferă intimă.'
  },
  {
    id: 116,
    name_ro: 'Seară de Privit Stelele lângă București',
    description_ro: 'Evadează din oraș pentru o noapte romantică de observare a stelelor. Departe de poluarea luminoasă, admiră cerul înstelat, învață despre constelații și bucură-te de liniștea nopții sub un cer clar.'
  },
  {
    id: 117,
    name_ro: 'Tur al Fantomelor în București (Centrul Vechi)',
    description_ro: 'Explorează partea întunecată a istoriei Bucureștiului într-un tur ghidat al fantomelor prin Centrul Vechi. Ascultă povești înfiorătoare despre clădiri bântuite, legende urbane și evenimente misterioase din trecutul capitalei.'
  },
  {
    id: 118,
    name_ro: 'Tur Culinar prin Piețele Bucureștiului (Obor/Dorobanți)',
    description_ro: 'Descoperă autenticele piețe alimentare ale Bucureștiului într-un tur ghidat. Gustă produse locale, brânzeturi tradiționale, mezeluri și specialități românești în timp ce înveți despre cultura culinară locală de la un ghid expert.'
  },
  {
    id: 119,
    name_ro: 'Tur de Shopping Vintage în București',
    description_ro: 'Explorează cele mai bune magazine vintage și second-hand din București. Descoperă piese unice de îmbrăcăminte, accesorii și obiecte retro în timp ce înveți despre moda și designul din diferite epoci.'
  },
  {
    id: 120,
    name_ro: 'Tur Arhitectural Pedestru în București',
    description_ro: 'Admiră diversitatea arhitecturală a Bucureștiului într-un tur pedestru ghidat. Descoperă clădiri Art Nouveau, arhitectură interbelică, construcții comuniste și creații contemporane în timp ce înveți despre evoluția urbanistică a capitalei.'
  },
  {
    id: 121,
    name_ro: 'Tur al Istoriei Comuniste în București',
    description_ro: 'Înțelege perioada comunistă a României printr-un tur educațional al Bucureștiului. Vizitează monumente emblematice, clădiri guvernamentale și locuri istorice în timp ce afli despre viața cotidiană și evenimentele majore din epoca comunistă.'
  },
  {
    id: 122,
    name_ro: 'Tur al Patrimoniului Evreiesc în București',
    description_ro: 'Explorează bogata istorie a comunității evreiești din București. Vizitează sinagogi istorice, muzee și cartiere semnificative în timp ce afli despre contribuțiile culturale și provocările comunității evreiești din capitală.'
  },
  {
    id: 126,
    name_ro: 'Curs de Pilates (București)',
    description_ro: 'Îmbunătățește-ți flexibilitatea, forța și postura într-un curs de Pilates în București. Învață exerciții controlate de întărire a mușchilor profunzi sub îndrumarea unui instructor certificat, potrivit pentru toate nivelurile de fitness.'
  }
];

async function translateActivities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🌍 Starting Romanian translation for 14 activities...\n');

    for (const translation of translations) {
      const result = await pool.query(
        `UPDATE activities 
         SET name_ro = $1, description_ro = $2 
         WHERE id = $3
         RETURNING id, name, name_ro`,
        [translation.name_ro, translation.description_ro, translation.id]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Translated activity ${translation.id}: ${result.rows[0].name}`);
        console.log(`   → ${result.rows[0].name_ro}\n`);
      }
    }

    // Verify all translations
    const verifyResult = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(name_ro) as translated,
              COUNT(*) - COUNT(name_ro) as missing
       FROM activities`
    );

    console.log('\n📊 Translation Summary:');
    console.log(`   Total activities: ${verifyResult.rows[0].total}`);
    console.log(`   Translated to Romanian: ${verifyResult.rows[0].translated}`);
    console.log(`   Missing translations: ${verifyResult.rows[0].missing}`);

    if (verifyResult.rows[0].missing === '0') {
      console.log('\n🎉 All activities are now translated to Romanian!');
    }

  } catch (error) {
    console.error('❌ Error translating activities:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

translateActivities();
