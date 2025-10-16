import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { ActivityCardProps } from '../types';

export const ActivityCardWeb: React.FC<ActivityCardProps> = ({
  activity,
  onPress
}) => {
  const handlePress = () => {
    onPress?.();
  };

  const handleMapPress = () => {
    if (activity.location.coordinates) {
      const { lat, lng } = activity.location.coordinates;
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const handleWebsitePress = () => {
    if (activity.website) {
      Linking.openURL(activity.website);
    }
  };

  const renderPriceLevel = () => {
    if (!activity.priceLevel) return null;
    
    const priceSymbols = {
      free: 'Free',
      budget: '$',
      moderate: '$$',
      expensive: '$$$'
    };

    return (
      <View style={{
        backgroundColor: activity.priceLevel === 'free' ? '#10B981' : '#F59E0B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start'
      }}>
        <Text style={{
          color: 'white',
          fontSize: 12,
          fontWeight: '600',
          fontFamily: 'Inter'
        }}>
          {priceSymbols[activity.priceLevel]}
        </Text>
      </View>
    );
  };

  const renderRating = () => {
    if (!activity.rating) return null;

    const stars = Math.round(activity.rating);
    const starString = '★'.repeat(stars) + '☆'.repeat(5 - stars);

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
          color: '#F59E0B',
          fontSize: 14,
          marginRight: 4,
          fontFamily: 'Inter'
        }}>
          {starString}
        </Text>
        <Text style={{
          color: '#6B7280',
          fontSize: 14,
          fontFamily: 'Inter'
        }}>
          {activity.rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Image */}
      {activity.imageUrl && (
        <Image
          source={{ uri: activity.imageUrl }}
          style={{
            width: '100%',
            height: 200,
            backgroundColor: '#F3F4F6'
          }}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8
        }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: 4,
              fontFamily: 'Inter'
            }}>
              {activity.name}
            </Text>
            {renderRating()}
          </View>
          {renderPriceLevel()}
        </View>

        {/* Description */}
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          lineHeight: 20,
          marginBottom: 12,
          fontFamily: 'Inter'
        }}>
          {activity.description}
        </Text>

        {/* Location */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>📍</Text>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            flex: 1,
            fontFamily: 'Inter'
          }}>
            {activity.location.address}
          </Text>
        </View>

        {/* Category & Tags */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 16
        }}>
          <View style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 8,
            marginBottom: 8
          }}>
            <Text style={{
              color: '#1D4ED8',
              fontSize: 12,
              fontWeight: '500',
              fontFamily: 'Inter'
            }}>
              {activity.category}
            </Text>
          </View>
          
          {activity.tags?.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginRight: 6,
                marginBottom: 8
              }}
            >
              <Text style={{
                color: '#6B7280',
                fontSize: 11,
                fontFamily: 'Inter'
              }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: 12
        }}>
          <TouchableOpacity
            onPress={handleMapPress}
            style={{
              flex: 1,
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{
              color: '#374151',
              fontSize: 14,
              fontWeight: '600',
              fontFamily: 'Inter'
            }}>
              📍 View on Map
            </Text>
          </TouchableOpacity>

          {activity.website && (
            <TouchableOpacity
              onPress={handleWebsitePress}
              style={{
                flex: 1,
                backgroundColor: '#0EA5E9',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600',
                fontFamily: 'Inter'
              }}>
                🌐 Visit Website
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
