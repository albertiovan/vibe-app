/**
 * YouTube Video Card Component
 * 
 * Displays tutorial videos for activities with thumbnail, title, and link to YouTube
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { YouTubeVideo } from '../src/services/enrichmentApi';

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  compact?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export default function YouTubeVideoCard({ video, compact = false }: YouTubeVideoCardProps) {
  const handleOpenVideo = async () => {
    try {
      if (!video.url) {
        Alert.alert('Error', 'Video URL not available');
        return;
      }
      await Linking.openURL(video.url);
    } catch (error) {
      console.error('Error opening YouTube video:', error);
      Alert.alert('Error', 'Could not open YouTube video');
    }
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return '0:00';
    
    // Convert ISO 8601 duration (PT4M13S) to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const formatViewCount = (count: number): string => {
    if (!count || count < 0) return '0 views';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleOpenVideo}>
        <Image 
          source={{ 
            uri: video.thumbnail?.url || 'https://via.placeholder.com/120x80/f0f0f0/999?text=Video' 
          }} 
          style={styles.compactThumbnail} 
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {video.title || 'Untitled Video'}
          </Text>
          <Text style={styles.compactChannel}>{video.channel || 'Unknown Channel'}</Text>
          <Text style={styles.compactDuration}>{formatDuration(video.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.videoCard} onPress={handleOpenVideo}>
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ 
            uri: video.thumbnail?.url || 'https://via.placeholder.com/400x180/f0f0f0/999?text=Video' 
          }} 
          style={styles.thumbnail} 
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶️</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || 'Untitled Video'}
        </Text>
        <Text style={styles.channelName}>{video.channel || 'Unknown Channel'}</Text>
        <View style={styles.videoMeta}>
          <Text style={styles.viewCount}>{formatViewCount(video.viewCount)}</Text>
          <Text style={styles.relevanceScore}>
            {Math.round((video.relevanceScore || 0) * 100)}% match
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    marginLeft: 2,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  channelName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 12,
    color: '#888',
  },
  relevanceScore: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Compact styles for horizontal scrolling
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    width: screenWidth * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  compactThumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  compactContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  compactChannel: {
    fontSize: 12,
    color: '#666',
  },
  compactDuration: {
    fontSize: 11,
    color: '#888',
    alignSelf: 'flex-end',
  },
});
