import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { MotiView } from 'moti';
import { VibeInputProps } from '../types';

const SUGGESTION_CHIPS = [
  'I feel adventurous',
  'Something cozy',
  'Want to be social',
  'Need to relax',
  'Feeling creative',
  'High energy mood'
];

export const VibeInput: React.FC<VibeInputProps> = ({
  onSubmit,
  loading = false,
  placeholder = "What's your vibe today?"
}) => {
  const [vibe, setVibe] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (vibe.trim() && !loading) {
      Keyboard.dismiss();
      onSubmit(vibe.trim());
    }
  };

  const handleChipPress = (suggestion: string) => {
    setVibe(suggestion);
    onSubmit(suggestion);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      className="w-full px-6"
    >
      {/* Main Input */}
      <View className="mb-6">
        <MotiView
          animate={{
            scale: isFocused ? 1.02 : 1,
            shadowOpacity: isFocused ? 0.15 : 0.1,
          }}
          transition={{ type: 'timing', duration: 200 }}
          className="bg-white rounded-2xl shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <TextInput
            value={vibe}
            onChangeText={setVibe}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="p-4 text-gray-800 text-base font-inter leading-6"
            style={{ minHeight: 80 }}
            editable={!loading}
          />
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!vibe.trim() || loading}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full items-center justify-center ${
              vibe.trim() && !loading
                ? 'bg-primary-500'
                : 'bg-gray-300'
            }`}
          >
            <MotiView
              animate={{
                rotate: loading ? '360deg' : '0deg',
              }}
              transition={{
                type: 'timing',
                duration: 1000,
                loop: loading,
              }}
            >
              <Text className="text-white text-lg">
                {loading ? '⟳' : '→'}
              </Text>
            </MotiView>
          </TouchableOpacity>
        </MotiView>
      </View>

      {/* Suggestion Chips */}
      {!isFocused && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 200 }}
        >
          <Text className="text-gray-600 text-sm font-inter mb-3 text-center">
            Or try one of these:
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {SUGGESTION_CHIPS.map((suggestion, index) => (
              <MotiView
                key={suggestion}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay: 300 + index * 100,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleChipPress(suggestion)}
                  disabled={loading}
                  className="bg-primary-50 border border-primary-200 rounded-full px-4 py-2"
                >
                  <Text className="text-primary-700 text-sm font-inter">
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>
      )}
    </MotiView>
  );
};
