// Simple test script to verify API functionality
import { MoodParser } from '../services/moodParser';

export function testMoodParser() {
  const parser = new MoodParser();
  
  const testVibes = [
    "I feel adventurous and want to explore",
    "Need something cozy and relaxing",
    "Want to be social and meet people",
    "Feeling creative and artistic",
    "High energy, need something exciting"
  ];

  console.log('🧠 Testing Mood Parser...\n');
  
  testVibes.forEach((vibe, index) => {
    const analysis = parser.parseMood(vibe);
    console.log(`Test ${index + 1}: "${vibe}"`);
    console.log(`Primary Mood: ${analysis.primaryMood}`);
    console.log(`Secondary Moods: ${analysis.secondaryMoods.join(', ')}`);
    console.log(`Categories: ${analysis.suggestedCategories.join(', ')}`);
    console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log('---');
  });
}

// Run tests if called directly
if (require.main === module) {
  testMoodParser();
}
