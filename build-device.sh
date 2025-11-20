#!/bin/bash

echo "🚀 Building Vibe App for iPhone"
echo ""

# Apply Folly patch
echo "📦 Applying Folly coroutine patch..."
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null
perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null
perl -pi -e 's/#if FOLLY_HAS_COROUTINES && 0#include/#if FOLLY_HAS_COROUTINES \&\& 0\n#include/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null

echo "✅ Folly patched"
echo ""

# Check if device is connected
echo "📱 Checking for connected iPhone..."
if xcrun xctrace list devices 2>&1 | grep -q "iPhone"; then
    echo "✅ iPhone detected"
    echo ""
    echo "🔨 Building for device..."
    npx expo run:ios --device
else
    echo "⚠️  No iPhone detected"
    echo ""
    echo "Please connect your iPhone via USB and trust this computer."
    echo "Then run this script again."
    echo ""
    echo "Alternatively, you can build for simulator:"
    echo "  npx expo run:ios"
    exit 1
fi
