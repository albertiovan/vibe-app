#!/bin/bash

echo "🔧 Fixing Folly coroutine headers..."

FOLLY_DIR="ios/Pods/Headers/Public/ReactNativeDependencies/folly"
FILES_TO_PATCH=(
  "Expected.h"
  "Optional.h"
)

if [ ! -d "$FOLLY_DIR" ]; then
  echo "❌ Folly directory not found. Run 'pod install' first."
  echo "   Expected location: $FOLLY_DIR"
  exit 1
fi

PATCHED_COUNT=0
ALREADY_PATCHED_COUNT=0

for FILE in "${FILES_TO_PATCH[@]}"; do
  FOLLY_FILE="$FOLLY_DIR/$FILE"
  
  if [ ! -f "$FOLLY_FILE" ]; then
    echo "⚠️  File not found: $FILE (skipping)"
    continue
  fi
  
  # Check if already patched
  if grep -q "FOLLY_HAS_COROUTINES && 0" "$FOLLY_FILE"; then
    echo "✅ $FILE already patched"
    ((ALREADY_PATCHED_COUNT++))
    continue
  fi
  
  # Make file writable
  chmod +w "$FOLLY_FILE"
  
  # Create backup
  cp "$FOLLY_FILE" "$FOLLY_FILE.backup"
  
  # Apply patch
  sed -i '' 's/#if FOLLY_HAS_COROUTINES/#if FOLLY_HAS_COROUTINES \&\& 0/' "$FOLLY_FILE"
  
  # Restore read-only permission
  chmod -w "$FOLLY_FILE"
  
  # Verify patch
  if grep -q "FOLLY_HAS_COROUTINES && 0" "$FOLLY_FILE"; then
    echo "✅ Successfully patched $FILE"
    ((PATCHED_COUNT++))
  else
    echo "❌ Failed to patch $FILE"
    mv "$FOLLY_FILE.backup" "$FOLLY_FILE"
  fi
done

echo ""
echo "📊 Summary:"
echo "   Patched: $PATCHED_COUNT files"
echo "   Already patched: $ALREADY_PATCHED_COUNT files"
echo ""
echo "This disables coroutine support to avoid missing header errors."
echo ""
echo "Next step: npx expo run:ios"
