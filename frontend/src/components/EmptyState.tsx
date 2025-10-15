import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon = '🤔'
}) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      className="flex-1 justify-center items-center px-8"
    >
      <Text className="text-6xl mb-4">{icon}</Text>
      
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2 font-inter">
        {title}
      </Text>
      
      <Text className="text-gray-600 text-center mb-6 font-inter leading-6">
        {message}
      </Text>
      
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold font-inter">
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
};
