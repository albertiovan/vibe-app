/**
 * Experience Detail Screen
 * Simple detail page for activity-first experiences with reviews
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import YouTubeVideoCard from './components/YouTubeVideoCard';
import WikipediaInfo from './components/WikipediaInfo';
import WebContextCard from './components/WebContextCard';
import { enrichmentApiService, ActivityEnrichment } from './src/services/enrichmentApi';

export default function ExperienceDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { place } = route.params as { place: any };
  const [enrichment, setEnrichment] = useState<ActivityEnrichment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrichment();
  }, []);

  const loadEnrichment = async () => {
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>★</Text>);
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.halfStar}>☆</Text>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }
    
    return stars;
  };

  // Mock reviews for demonstration
  const mockReviews = [
    {
      author: "Sarah M.",
      rating: 5,
      time: "2 weeks ago",
      text: "Amazing atmosphere and great selection. Perfect place to spend a quiet afternoon."
    },
    {
      author: "Alex K.",
      rating: 4,
      time: "1 month ago", 
      text: "Love the cozy vibe here. Staff is friendly and helpful."
    },
    {
      author: "Maria R.",
      rating: 5,
      time: "2 months ago",
      text: "My go-to spot for finding new books and meeting interesting people."
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Experience Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <Image
          source={{
            uri: place.imageUrl 
              ? `http://localhost:3000${place.imageUrl}`
              : 'https://via.placeholder.com/400x250/E5E7EB/9CA3AF?text=Experience+Awaits'
          }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Title and Basic Info */}
        <View style={styles.titleSection}>
          <Text style={styles.placeName}>{place.name}</Text>
          {place.bucket && (
            <View style={styles.bucketChip}>
              <Text style={styles.bucketText}>{place.bucket}</Text>
            </View>
          )}
        </View>

        {/* What You'll Do Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll do</Text>
          <Text style={styles.blurbText}>
            {place.blurb || 'Experience something new and exciting at this location'}
          </Text>
        </View>

        {/* Enrichment Content */}
        {loading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading videos and info...</Text>
          </View>
        )}

        {enrichment && (
          <>
            {/* YouTube Videos Section */}
            {enrichment.tutorialVideos && enrichment.tutorialVideos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎥 Tutorial Videos</Text>
                <Text style={styles.sectionSubtitle}>Learn more about this activity</Text>
                {enrichment.tutorialVideos.map((video, index) => (
                  <YouTubeVideoCard key={video.id} video={video} />
                ))}
              </View>
            )}

            {/* Wikipedia Info Section */}
            {enrichment.activityInfo && (
              <View style={styles.section}>
                <WikipediaInfo summary={enrichment.activityInfo} />
              </View>
            )}

            {/* Web Context Section */}
            {enrichment.webContext && (
              <View style={styles.section}>
                <WebContextCard webContext={enrichment.webContext} />
              </View>
            )}

            {/* Sources Attribution */}
            {enrichment.enrichmentSources.length > 0 && (
              <View style={styles.sourcesSection}>
                <Text style={styles.sourcesText}>
                  Enhanced with: {enrichment.enrichmentSources.join(', ')}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Location</Text>
            <Text style={styles.detailValue}>{place.vicinity || 'Bucharest'}</Text>
          </View>
          
          {place.rating && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⭐ Rating</Text>
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {renderStars(place.rating)}
                </View>
                <Text style={styles.ratingText}>
                  {place.rating.toFixed(1)} ({place.userRatingsTotal || 0} reviews)
                </Text>
              </View>
            </View>
          )}
          
          {place.activitySubtype && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🎯 Type</Text>
              <Text style={styles.detailValue}>{place.activitySubtype.replace('_', ' ')}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Duration</Text>
            <Text style={styles.detailValue}>{place.estimatedDuration || '1-3 hours'}</Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.reviewsSubtitle}>From Google reviews</Text>
          
          {mockReviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAuthor}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>
                      {review.author.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{review.author}</Text>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                </View>
                <View style={styles.starsContainer}>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleOpenMaps}
          >
            <Text style={styles.primaryButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  bucketChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  bucketText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  blurbText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    color: '#F59E0B',
    fontSize: 14,
  },
  halfStar: {
    color: '#F59E0B',
    fontSize: 14,
  },
  emptyStar: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  reviewsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Enrichment styles
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sourcesSection: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sourcesText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
