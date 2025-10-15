import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { LoadingShimmerProps } from '../types';

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({
  count = 3,
  height = 200
}) => {
  return (
    <View className="px-6">
      {Array.from({ length: count }).map((_, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
            repeatReverse: true,
            delay: index * 200,
          }}
          className="bg-gray-200 rounded-2xl mb-4"
          style={{ height }}
        >
          {/* Image placeholder */}
          <View className="h-32 bg-gray-300 rounded-t-2xl" />
          
          {/* Content placeholder */}
          <View className="p-4 space-y-3">
            {/* Title */}
            <View className="h-4 bg-gray-300 rounded w-3/4" />
            
            {/* Subtitle */}
            <View className="h-3 bg-gray-300 rounded w-1/2" />
            
            {/* Description lines */}
            <View className="space-y-2">
              <View className="h-3 bg-gray-300 rounded w-full" />
              <View className="h-3 bg-gray-300 rounded w-2/3" />
            </View>
            
            {/* Tags */}
            <View className="flex-row space-x-2">
              <View className="h-6 w-16 bg-gray-300 rounded" />
              <View className="h-6 w-20 bg-gray-300 rounded" />
              <View className="h-6 w-14 bg-gray-300 rounded" />
            </View>
          </View>
        </MotiView>
      ))}
    </View>
  );
};
