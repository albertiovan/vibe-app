/**
 * ActivityAcceptedScreen
 * 
 * Exciting screen shown after user accepts an activity
 * Features glowing GO NOW button that opens Google Maps
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { theme } from '../ui/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteParams = {
  ActivityAcceptedScreen: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
};

export const ActivityAcceptedScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ActivityAcceptedScreen'>>();
  const { activity, userLocation } = route.params;

  const colors = theme.colors;
  const typo = theme.typography;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGoNow = async () => {
    try {
      // Get venue or activity location
      const venue = activity.venues?.[0];
      const location = venue?.location || activity.location;
      const latitude = location?.lat || activity.latitude;
      const longitude = location?.lng || activity.longitude;

      if (!latitude || !longitude) {
        Alert.alert('Location Not Available', 'Cannot open maps for this activity');
        return;
      }

      const venueName = encodeURIComponent(venue?.name || activity.name);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${venueName}`;

      console.log('🗺️  Opening maps:', mapsUrl);

      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        Alert.alert('Error', 'Cannot open Google Maps');
      }
    } catch (error) {
      console.error('❌ Failed to open maps:', error);
      Alert.alert('Error', 'Failed to open Google Maps');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <OrbBackdrop variant="dark" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#00AAFF', '#00FFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Text style={styles.iconText}>✓</Text>
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={[typo.titleL, styles.title]}>
            Activity Accepted!
          </Text>

          {/* Activity Name */}
          <Text style={[typo.titleM, styles.activityName]}>
            {activity.name || activity.simplifiedName}
          </Text>

          {/* Subtitle */}
          <Text style={[typo.body, styles.subtitle]}>
            Ready to start your adventure?
          </Text>

          {/* GO NOW Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowOuter,
                {
                  opacity: glowOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(0, 170, 255, 0.4)', 'rgba(0, 255, 255, 0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glowGradient}
              />
            </Animated.View>

            {/* Button */}
            <TouchableOpacity
              style={styles.goButton}
              onPress={handleGoNow}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#00AAFF', '#00FFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goButtonGradient}
              >
                <Text style={[typo.titleL, styles.goButtonText]}>
                  🗺️  GO NOW
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Helper Text */}
          <Text style={[typo.caption, styles.helperText]}>
            Opens in Google Maps
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  activityName: {
    color: '#00AAFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  glowOuter: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 60,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 60,
  },
  goButton: {
    width: SCREEN_WIDTH - 80,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  goButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 28,
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
