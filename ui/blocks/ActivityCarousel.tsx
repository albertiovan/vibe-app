/**
 * ActivityCarousel Component
 * Swipeable photo carousel with pagination dots
 */

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/tokens';

const { width } = Dimensions.get('window');

interface ActivityCarouselProps {
  images: string[];
  height?: number;
  showLabel?: boolean;
}

export const ActivityCarousel: React.FC<ActivityCarouselProps> = ({
  images,
  height = 400,
  showLabel = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colors = theme.colors;
  const typo = theme.typography;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  // Ensure we have at least one image
  const imageList = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
  ];

  return (
    <View style={[styles.container, { height }]}>
      {/* Scrollable Images */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {imageList.map((imageUri, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Gradient Overlay (bottom) - enhanced */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.7)',
        ]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* Pagination Dots */}
      {imageList.length > 1 && (
        <View style={styles.pagination}>
          {imageList.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Photo Carousel Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[typo.body, styles.label, { color: colors.fg.primary }]}>
            Photo Carousel
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  pagination: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 217, 255, 0.3)', // Cyan inactive dots
  },
  dotActive: {
    backgroundColor: 'rgba(0, 217, 255, 0.95)', // Bright cyan active dot
    width: 28,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
