/**
 * Development Menu
 * Quick actions for testing and development
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';
import { userStorage } from '../src/services/userStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DevMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const handleClearUserData = () => {
    Alert.alert(
      'Clear User Data',
      'This will delete your account and all data. The app will restart with onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await userStorage.clearAllData();
              // Also clear device ID
              await AsyncStorage.removeItem('@device_id');
              setVisible(false);
              Alert.alert('Success', 'Data cleared! Please restart the app.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Force app reload
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleShowUserInfo = async () => {
    const account = await userStorage.getAccount();
    const prefs = await userStorage.getPreferences();
    
    Alert.alert(
      'User Info',
      `Name: ${account?.name || 'N/A'}\nUser ID: ${account?.userId || 'N/A'}\nInterests: ${prefs?.interests.join(', ') || 'N/A'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      {/* Floating Dev Button */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setVisible(true)}
        >
          <Ionicons name="bug" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Dev Menu Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menu}>
            <View style={styles.header}>
              <Text style={styles.title}>🛠️ Dev Menu</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleClearUserData}>
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={[styles.menuText, styles.dangerText]}>
                Clear All User Data
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShowUserInfo}>
              <Ionicons name="information-circle" size={20} color={colors.text.secondary} />
              <Text style={styles.menuText}>Show User Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                const keys = await AsyncStorage.getAllKeys();
                console.log('All AsyncStorage keys:', keys);
                Alert.alert('Keys', keys.join('\n'));
              }}
            >
              <Ionicons name="list" size={20} color={colors.text.secondary} />
              <Text style={styles.menuText}>Show All Storage Keys</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  menu: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.base.surface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.sm,
    backgroundColor: colors.base.canvas,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: tokens.spacing.sm,
  },
  dangerText: {
    color: '#FF6B6B',
  },
});
