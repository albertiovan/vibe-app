#!/bin/bash

# Install New Dependencies for Vibe App UI/UX
# Run this script to install all required packages

echo "🚀 Installing new dependencies for Vibe App..."
echo ""

# Install Expo packages
echo "📦 Installing Expo packages..."
npx expo install expo-linear-gradient expo-device expo-haptics expo-blur

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. cd backend && npm run dev  # Start backend server"
echo "2. npm start                   # Start mobile app"
echo "3. Open app to see ChatHomeScreen!"
echo ""
