/**
 * ActivityDetailModal
 * Full-screen modal showing complete activity details
 * Appears when user taps on a card in the swipeable stack
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { theme } from '../theme/tokens';
import { SwipeableActivity } from './SwipeableCardStack';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActivityDetailModalProps {
  activity: SwipeableActivity;
  visible: boolean;
  onClose: () => void;
  onExplore: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  visible,
  onClose,
  onExplore,
}) => {
  const colors = theme.colors;
  const typo = theme.typography;

  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      style={styles.overlay}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </TouchableOpacity>

      {/* Modal Content */}
      <Animated.View 
        entering={SlideInDown.springify().damping(20).stiffness(90)}
        style={styles.modalContainer}
      >
        <View style={styles.modal}>
          {/* Header Image */}
          <View style={styles.imageContainer}>
            {activity.imageUrl ? (
              <Image
                source={{ uri: activity.imageUrl }}
                style={styles.headerImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.gradient.primary.from, colors.gradient.primary.to]}
                style={styles.headerImage}
              />
            )}
            
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <BlurView intensity={20} tint="dark" style={styles.closeButtonBlur}>
                <Text style={styles.closeButtonText}>✕</Text>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Title */}
            <Text style={[typo.titleXL, styles.title]}>
              {activity.name}
            </Text>

            {/* Location */}
            {(activity.city || activity.region) && (
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={[typo.body, styles.locationText]}>
                  {activity.city}{activity.region && `, ${activity.region}`}
                </Text>
              </View>
            )}

            {/* Category Badge */}
            {activity.category && (
              <View style={styles.categoryBadge}>
                <BlurView intensity={15} tint="dark" style={styles.categoryBadgeBlur}>
                  <Text style={[typo.bodySmall, styles.categoryText]}>
                    {activity.category.toUpperCase()}
                  </Text>
                </BlurView>
              </View>
            )}

            {/* Description */}
            <Text style={[typo.bodyLarge, styles.description]}>
              {activity.description}
            </Text>

            {/* Match Score */}
            {activity.matchScore && (
              <View style={styles.matchContainer}>
                <View style={styles.matchBar}>
                  <View 
                    style={[
                      styles.matchBarFill, 
                      { width: `${activity.matchScore * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={[typo.bodySmall, styles.matchLabel]}>
                  {Math.round(activity.matchScore * 100)}% Match for your vibe
                </Text>
              </View>
            )}

            {/* Spacer for button */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Explore Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={onExplore}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradient.primary.from, colors.gradient.primary.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreButtonGradient}
              >
                <Text style={[typo.titleM, styles.exploreButtonText]}>
                  Explore Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.85,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 25, 0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryBadgeBlur: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderRadius: 16,
  },
  categoryText: {
    color: 'rgba(0, 217, 255, 0.95)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  matchContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  matchBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  matchBarFill: {
    height: '100%',
    backgroundColor: 'rgba(0, 217, 255, 0.9)',
    borderRadius: 3,
  },
  matchLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(10, 15, 25, 0.95)',
  },
  exploreButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  exploreButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
