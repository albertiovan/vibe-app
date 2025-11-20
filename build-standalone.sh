#!/bin/bash

echo "🚀 Building Standalone Vibe App"
echo ""
echo "This will create an app that works ANYWHERE (no Mac needed)"
echo ""

# Check if logged in
if ! eas whoami &>/dev/null; then
    echo "📝 Please login to Expo:"
    eas login
fi

echo ""
echo "🏗️  Starting cloud build..."
echo ""
echo "This will:"
echo "  ✅ Build in the cloud (no sandbox issues)"
echo "  ✅ Bundle all JavaScript inside the app"
echo "  ✅ Create a standalone .ipa file"
echo "  ✅ App works anywhere (no Metro needed)"
echo ""
echo "Build takes ~15-20 minutes"
echo ""

# Build
eas build --platform ios --profile standalone

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To install on your iPhone:"
echo "  eas build:run --platform ios --latest"
echo ""
echo "Or download from: https://expo.dev/accounts/[your-account]/projects/vibe-debug/builds"
echo ""
echo "🎉 Your standalone app is ready!"
