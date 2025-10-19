/**
 * Enriched Activity Card Component
 * 
 * Enhanced activity card with YouTube videos, Wikipedia info, and web context
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import YouTubeVideoCard from './YouTubeVideoCard';
import WikipediaInfo from './WikipediaInfo';
import WebContextCard from './WebContextCard';
import { enrichmentApiService, ActivityEnrichment } from '../src/services/enrichmentApi';

interface EnrichedActivityCardProps {
  place: any; // The original place/activity data
  onPress?: () => void;
  feedback?: { [key: string]: 'like' | 'dislike' | null };
  onFeedback?: (place: any, type: 'like' | 'dislike') => void;
}

export default function EnrichedActivityCard({ 
  place, 
  onPress, 
  feedback = {}, 
  onFeedback 
}: EnrichedActivityCardProps) {
  const [enrichment, setEnrichment] = useState<ActivityEnrichment | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEnrichment, setShowEnrichment] = useState(false);

  const loadEnrichment = async () => {
    if (enrichment || loading) return;

    setLoading(true);
    try {
      const activityName = place.name || place.activityName || 'activity';
      const region = place.vicinity || place.region || 'Bucharest, Romania';
      
      const enrichmentData = await enrichmentApiService.getActivityEnrichment(activityName, region);
      setEnrichment(enrichmentData);
    } catch (error) {
      console.warn('Failed to load enrichment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnrichment = () => {
    if (!showEnrichment && !enrichment) {
      loadEnrichment();
    }
    setShowEnrichment(!showEnrichment);
  };

  const handleOpenMaps = async () => {
    try {
      let mapsUrl;
      
      if (place.mapsUrl) {
        mapsUrl = place.mapsUrl;
      } else if (place.placeId) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${place.placeId}`;
      } else if (place.location) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
      }
      
      await Linking.openURL(mapsUrl);
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Could not open maps');
    }
  };

  const hasEnrichmentContent = enrichment && (
    (enrichment.tutorialVideos && enrichment.tutorialVideos.length > 0) ||
    enrichment.activityInfo ||
    (enrichment.webContext && (enrichment.webContext.suggestions.length > 0 || enrichment.webContext.tips.length > 0))
  );

  return (
    <View style={styles.card}>
      {/* Main Activity Card */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          {place.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: place.imageUrl }} style={styles.activityImage} />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.placeHeader}>
            <Text style={styles.activityName}>{place.name}</Text>
            <View style={styles.placeRating}>
              {place.weatherSuitability && (
                <Text style={styles.vibeScore}>{Math.round(place.weatherSuitability * 100)}%</Text>
              )}
            </View>
          </View>
          
          {/* Activity-First Blurb */}
          {place.blurb && (
            <Text style={styles.activityBlurb}>{place.blurb}</Text>
          )}
        
          {/* Location and Distance */}
          <Text style={styles.activityDescription}>
            {place.vicinity || place.region || 'Bucharest'} • {place.distance ? `${place.distance.toFixed(1)}km` : 'Nearby'}
          </Text>
          
          {/* Vibe Reasons and Info */}
          <View style={styles.vibeReasons}>
            {place.weatherHint && (
              <Text style={styles.vibeReason}>🌤️ {place.weatherHint}</Text>
            )}
            {place.bucket && (
              <Text style={styles.vibeReason}>🎯 {place.bucket.charAt(0).toUpperCase() + place.bucket.slice(1)} experience</Text>
            )}
            {place.vibeReasons && place.vibeReasons.length > 0 && (
              place.vibeReasons.slice(0, 2).map((reason: string, idx: number) => (
                <Text key={idx} style={styles.vibeReason}>• {reason}</Text>
              ))
            )}
          </View>
          
          <View style={styles.activityMeta}>
            <Text style={styles.activityCategory}>
              {place.estimatedDuration || place.travelTime ? `${place.travelTime} min travel` : 'Visit time varies'}
            </Text>
            {place.walkingTime && (
              <Text style={styles.walkingTime}>{place.walkingTime} min walk</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Enrichment Toggle Button */}
      <TouchableOpacity 
        style={styles.enrichmentToggle} 
        onPress={handleToggleEnrichment}
      >
        <Text style={styles.enrichmentToggleIcon}>
          {loading ? '⏳' : showEnrichment ? '📚' : '🎥'}
        </Text>
        <Text style={styles.enrichmentToggleText}>
          {loading ? 'Loading...' : showEnrichment ? 'Hide Details' : 'Videos & Info'}
        </Text>
        <Text style={styles.enrichmentToggleArrow}>
          {showEnrichment ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Enrichment Content */}
      {showEnrichment && (
        <View style={styles.enrichmentContent}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Loading videos and info...</Text>
            </View>
          )}

          {hasEnrichmentContent && (
            <>
              {/* YouTube Videos */}
              {enrichment.tutorialVideos && enrichment.tutorialVideos.length > 0 && (
                <View style={styles.enrichmentSection}>
                  <Text style={styles.enrichmentSectionTitle}>🎥 Tutorial Videos</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.videosContainer}
                  >
                    {enrichment.tutorialVideos.map((video, index) => (
                      <YouTubeVideoCard key={video.id} video={video} compact />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Wikipedia Info */}
              {enrichment.activityInfo && (
                <View style={styles.enrichmentSection}>
                  <WikipediaInfo summary={enrichment.activityInfo} compact />
                </View>
              )}

              {/* Web Context */}
              {enrichment.webContext && (
                <View style={styles.enrichmentSection}>
                  <WebContextCard webContext={enrichment.webContext} compact />
                </View>
              )}

              {/* Sources Attribution */}
              {enrichment.enrichmentSources.length > 0 && (
                <View style={styles.sourcesContainer}>
                  <Text style={styles.sourcesText}>
                    Enhanced with: {enrichment.enrichmentSources.join(', ')}
                  </Text>
                </View>
              )}
            </>
          )}

          {!loading && !hasEnrichmentContent && (
            <View style={styles.noEnrichmentContainer}>
              <Text style={styles.noEnrichmentText}>
                No additional content available for this activity
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Like/Dislike Buttons */}
        <View style={styles.feedbackButtons}>
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              styles.likeButton,
              feedback[place.id] === 'like' && styles.feedbackButtonActive
            ]}
            onPress={() => onFeedback?.(place, 'like')}
          >
            <Text style={[
              styles.feedbackButtonText,
              feedback[place.id] === 'like' && styles.feedbackButtonTextActive
            ]}>
              👍 {feedback[place.id] === 'like' ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              styles.dislikeButton,
              feedback[place.id] === 'dislike' && styles.feedbackButtonActive
            ]}
            onPress={() => onFeedback?.(place, 'dislike')}
          >
            <Text style={[
              styles.feedbackButtonText,
              feedback[place.id] === 'dislike' && styles.feedbackButtonTextActive
            ]}>
              👎 {feedback[place.id] === 'dislike' ? 'Disliked' : 'Dislike'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Google Maps Button */}
        {(place.mapsUrl || place.location) && (
          <TouchableOpacity style={styles.mapsButton} onPress={handleOpenMaps}>
            <Text style={styles.mapsButtonText}>🗺️ Open in Maps</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  activityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginRight: 12,
  },
  placeRating: {
    alignItems: 'center',
  },
  vibeScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  activityBlurb: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
    marginBottom: 12,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  vibeReasons: {
    marginBottom: 12,
  },
  vibeReason: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCategory: {
    fontSize: 12,
    color: '#999',
  },
  walkingTime: {
    fontSize: 12,
    color: '#999',
  },
  enrichmentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  enrichmentToggleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  enrichmentToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  enrichmentToggleArrow: {
    fontSize: 12,
    color: '#007AFF',
  },
  enrichmentContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  enrichmentSection: {
    marginBottom: 16,
  },
  enrichmentSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  videosContainer: {
    flexDirection: 'row',
  },
  sourcesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  sourcesText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noEnrichmentContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noEnrichmentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    padding: 16,
    backgroundColor: '#fff',
  },
  feedbackButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  likeButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#f44336',
  },
  feedbackButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackButtonTextActive: {
    color: '#fff',
  },
  mapsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
