// Test if Reanimated can be imported
try {
  const Reanimated = require('react-native-reanimated');
  console.log('✅ Reanimated imported successfully');
  console.log('Reanimated keys:', Object.keys(Reanimated).slice(0, 10));
  console.log('Has useSharedValue:', typeof Reanimated.useSharedValue);
  console.log('Has default:', typeof Reanimated.default);
} catch (error) {
  console.log('❌ Reanimated import failed:', error.message);
}
