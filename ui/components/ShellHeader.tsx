/**
 * ShellHeader Component
 * Consistent top bar with glass background, back, and profile buttons
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme, blur, radius } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ShellHeaderProps {
  showBack?: boolean;
  showProfile?: boolean;
  onBack?: () => void;
  onProfile?: () => void;
  testID?: string;
}

export const ShellHeader: React.FC<ShellHeaderProps> = ({
  showBack = false,
  showProfile = true,
  onBack,
  onProfile,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top || (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0),
        },
      ]}
      testID={testID}
    >
      <BlurView intensity={blur.md} tint="dark" style={styles.blurContainer}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.glass.surface,
              borderBottomColor: colors.glass.border,
            },
          ]}
        >
          <View style={styles.leftSection}>
            {showBack && onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={[styles.button, { backgroundColor: colors.glass.surface }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                testID={`${testID}-back`}
              >
                <View style={[styles.backArrow, { borderRightColor: colors.fg.primary }]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.rightSection}>
            {showProfile && onProfile && (
              <TouchableOpacity
                onPress={onProfile}
                style={[styles.button, { backgroundColor: colors.glass.surface }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                testID={`${testID}-profile`}
              >
                <View style={styles.profileIcon}>
                  <View style={[styles.profileCircle, { borderColor: colors.fg.primary }]} />
                  <View style={[styles.profileBody, { backgroundColor: colors.fg.primary }]} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  backArrow: {
    width: 0,
    height: 0,
    borderRightWidth: 12,
    borderRightColor: '#EAF6FF',
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
  },
  profileIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    position: 'absolute',
    top: 0,
  },
  profileBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    bottom: 0,
  },
});
