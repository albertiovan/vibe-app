/**
 * Translate Activities to Romanian
 * Uses Claude API to translate all activity names, descriptions, and tags to Romanian
 */

import Anthropic from '@anthropic-ai/sdk';
import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tag translation mapping (faceted tags)
const TAG_TRANSLATIONS: Record<string, string> = {
  // Facets
  'category': 'categorie',
  'experience_level': 'nivel_experienta',
  'energy': 'energie',
  'indoor_outdoor': 'interior_exterior',
  'seasonality': 'sezonalitate',
  'mood': 'stare',
  'terrain': 'teren',
  'equipment': 'echipament',
  'context': 'context',
  'requirement': 'cerinta',
  'cost_band': 'pret',
  'travel_time_band': 'timp_calatorie',
  'risk_level': 'nivel_risc',
  'weather_fit': 'vreme',
  'time_of_day': 'moment_zi',
  'skills': 'abilitati',
  
  // Values
  'creative': 'creativ',
  'wellness': 'wellness',
  'nature': 'natura',
  'culture': 'cultura',
  'adventure': 'aventura',
  'learning': 'invatare',
  'culinary': 'culinar',
  'water': 'apa',
  'nightlife': 'viata_noapte',
  'social': 'social',
  'fitness': 'fitness',
  'sports': 'sport',
  'seasonal': 'sezonier',
  'romance': 'romantic',
  'mindfulness': 'mindfulness',
  'beginner': 'incepator',
  'intermediate': 'intermediar',
  'advanced': 'avansat',
  'mixed': 'mixt',
  'low': 'scazut',
  'medium': 'mediu',
  'high': 'ridicat',
  'chill': 'relaxat',
  'indoor': 'interior',
  'outdoor': 'exterior',
  'either': 'oricare',
  'winter': 'iarna',
  'summer': 'vara',
  'shoulder': 'sezon_intermediar',
  'all': 'tot_anul',
  'adrenaline': 'adrenalina',
  'cozy': 'confortabil',
  'romantic': 'romantic',
  'mindful': 'contemplativ',
  'explorer': 'explorator',
  'relaxed': 'relaxat',
  'urban': 'urban',
  'forest': 'padure',
  'mountain': 'munte',
  'coast': 'coasta',
  'lake': 'lac',
  'rental-gear': 'inchiriere_echipament',
  'helmet': 'casca',
  'harness': 'ham',
  'provided': 'furnizat',
  'family': 'familie',
  'kids': 'copii',
  'solo': 'solo',
  'group': 'grup',
  'small-group': 'grup_mic',
  'date': 'intalnire',
  'guide-required': 'ghid_necesar',
  'booking-required': 'rezervare_necesara',
  'lesson-recommended': 'lectie_recomandata',
  'all_weather': 'orice_vreme',
  'daytime': 'zi',
  'evening': 'seara',
  'morning': 'dimineata',
  'afternoon': 'dupa_amiaza',
  'night': 'noapte',
  'nearby': 'aproape',
  'in-city': 'in_oras',
  'day-trip': 'excursie_zi',
  'overnight': 'peste_noapte',
  'technique': 'tehnica',
  'physical': 'fizic',
  'knowledge': 'cunostinte',
};

function translateTag(tag: string): string {
  const [facet, value] = tag.split(':');
  const translatedFacet = TAG_TRANSLATIONS[facet] || facet;
  const translatedValue = TAG_TRANSLATIONS[value] || value;
  return `${translatedFacet}:${translatedValue}`;
}

async function translateActivityBatch(activities: any[]): Promise<any[]> {
  const prompt = `You are a professional translator specializing in Romanian. Translate the following activity names and descriptions from English to Romanian. 

CRITICAL: You MUST preserve the exact ID for each activity. Do not mix up the IDs or translations.

Activities to translate:
${activities.map((a) => `
ID: ${a.id}
NAME: ${a.name}
DESCRIPTION: ${a.description}
---
`).join('\n')}

Respond with VALID JSON ONLY. No markdown, no code blocks, just the JSON array:
[
  {
    "id": ${activities[0].id},
    "name_ro": "translated Romanian name",
    "description_ro": "translated Romanian description"
  }${activities.length > 1 ? `,
  {
    "id": ${activities[1]?.id},
    "name_ro": "translated Romanian name",
    "description_ro": "translated Romanian description"
  }` : ''}
]

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown formatting.

RULES:
- Keep venue names in parentheses UNCHANGED (e.g., "Table Tennis Club" stays "Table Tennis Club")
- Translate ONLY the activity type (e.g., "Session" → "Sesiune")
- Use Romanian diacritics (ă, â, î, ș, ț)
- Use ONLY standard ASCII quotes ("), NOT Romanian quotes („")
- Use ONLY standard hyphens (-), NOT em-dashes (—) or en-dashes (–)
- Maintain professional tone
- DOUBLE-CHECK: Each ID must match exactly with the input`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const translations = JSON.parse(jsonMatch[0]);
          
          // Validate that all IDs match
          const inputIds = activities.map(a => a.id).sort();
          const outputIds = translations.map((t: any) => t.id).sort();
          
          if (JSON.stringify(inputIds) !== JSON.stringify(outputIds)) {
            console.error('❌ ID mismatch detected!');
            console.error('Input IDs:', inputIds);
            console.error('Output IDs:', outputIds);
            throw new Error('Translation IDs do not match input IDs');
          }
          
          return translations;
        } catch (parseError) {
          console.error('❌ JSON Parse Error. Raw response:');
          console.error(content.text);
          throw parseError;
        }
      }
    }
    throw new Error('Failed to parse translation response');
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

async function translateAllActivities() {
  console.log('🌍 Starting Romanian translation process...\n');

  try {
    // Get only activities that haven't been translated yet
    const result = await pool.query('SELECT id, name, description, tags FROM activities WHERE name_ro IS NULL ORDER BY id');
    const activities = result.rows;
    
    console.log(`📊 Found ${activities.length} activities to translate\n`);
    
    if (activities.length === 0) {
      console.log('✅ All activities are already translated!');
      return;
    }

    // Process in batches of 10
    const batchSize = 10;
    let translated = 0;

    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      console.log(`🔄 Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(activities.length / batchSize)}...`);

      try {
        const translations = await translateActivityBatch(batch);

        // Update database
        for (const translation of translations) {
          const activity = batch.find(a => a.id === translation.id);
          if (!activity) continue;

          // Translate tags
          const tagsRo = activity.tags.map((tag: string) => translateTag(tag));

          await pool.query(
            'UPDATE activities SET name_ro = $1, description_ro = $2, tags_ro = $3 WHERE id = $4',
            [translation.name_ro, translation.description_ro, tagsRo, translation.id]
          );

          translated++;
          console.log(`  ✅ ${translation.id}: ${activity.name} → ${translation.name_ro}`);
        }

        // Rate limiting - wait 2 seconds between batches
        if (i + batchSize < activities.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`  ❌ Failed to translate batch starting at ${i}:`, error);
        // Wait longer before retrying next batch if we hit rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log(`\n✨ Translation complete! ${translated}/${activities.length} activities translated`);

    // Verify translations
    const verifyResult = await pool.query(
      'SELECT COUNT(*) as total, COUNT(name_ro) as translated FROM activities'
    );
    console.log(`\n📈 Database status:`);
    console.log(`   Total activities: ${verifyResult.rows[0].total}`);
    console.log(`   Translated: ${verifyResult.rows[0].translated}`);
    console.log(`   Coverage: ${Math.round((verifyResult.rows[0].translated / verifyResult.rows[0].total) * 100)}%`);

  } catch (error) {
    console.error('❌ Translation process failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the translation
translateAllActivities().catch(console.error);
