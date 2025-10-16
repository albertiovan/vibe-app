import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { MotiView } from 'moti';
import { ActivityCardProps } from '../types';

export const ActivityCard: React.FC<ActivityCardProps> = ({
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
    
    const symbols = {
      free: 'FREE',
      budget: '$',
      moderate: '$$',
      expensive: '$$$'
    };

    return (
      <View className="bg-green-100 px-2 py-1 rounded">
        <Text className="text-green-800 text-xs font-semibold">
          {symbols[activity.priceLevel]}
        </Text>
      </View>
    );
  };

  const renderRating = () => {
    if (!activity.rating) return null;

    const stars = Math.round(activity.rating);
    return (
      <View className="flex-row items-center">
        <Text className="text-yellow-500 text-sm">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </Text>
        <Text className="text-gray-600 text-sm ml-1">
          {activity.rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Image */}
        {activity.imageUrl && (
          <Image
            source={{ uri: activity.imageUrl }}
            className="w-full h-48"
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-semibold text-gray-900 font-inter">
                {activity.name}
              </Text>
              <Text className="text-sm text-gray-600 font-inter">
                {activity.location.address}
              </Text>
            </View>
            {renderPriceLevel()}
          </View>

          {/* Rating and Distance */}
          <View className="flex-row justify-between items-center mb-3">
            {renderRating()}
            {activity.distance && (
              <Text className="text-sm text-gray-600">
                {activity.distance.toFixed(1)} km away
              </Text>
            )}
          </View>

          {/* Description */}
          {activity.description && (
            <Text 
              className="text-gray-700 text-sm font-inter leading-5 mb-3"
              numberOfLines={2}
            >
              {activity.description}
            </Text>
          )}

          {/* Tags */}
          {activity.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mb-3">
              {activity.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="bg-gray-100 px-2 py-1 rounded">
                  <Text className="text-gray-700 text-xs">
                    {tag.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {activity.location.coordinates && (
              <TouchableOpacity
                onPress={handleMapPress}
                className="flex-1 bg-primary-500 rounded-lg py-2"
              >
                <Text className="text-white text-center font-semibold">
                  View on Map
                </Text>
              </TouchableOpacity>
            )}
            
            {activity.website && (
              <TouchableOpacity
                onPress={handleWebsitePress}
                className="flex-1 bg-gray-200 rounded-lg py-2"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};
