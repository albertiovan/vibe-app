import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { VibeInputProps } from '../types';

const SUGGESTION_CHIPS = [
  'I feel adventurous',
  'Something cozy',
  'Want to be social',
  'Need to relax',
  'Feeling creative',
  'High energy mood'
];

export const VibeInputWeb: React.FC<VibeInputProps> = ({
  onSubmit,
  loading = false,
  placeholder = "What's your vibe today?"
}) => {
  const [vibe, setVibe] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    console.log('Submit button clicked, vibe:', vibe);
    if (vibe.trim() && !loading) {
      console.log('Calling onSubmit with:', vibe.trim());
      Keyboard.dismiss();
      onSubmit(vibe.trim());
    } else {
      console.log('Submit blocked - vibe empty or loading:', { vibe: vibe.trim(), loading });
    }
  };

  const handleChipPress = (suggestion: string) => {
    console.log('Chip pressed:', suggestion);
    setVibe(suggestion);
    onSubmit(suggestion);
  };

  return (
    <View style={{ width: '100%', paddingHorizontal: 24 }}>
      {/* Main Input */}
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            transform: [{ scale: isFocused ? 1.02 : 1 }],
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
            style={{
              padding: 16,
              color: '#1F2937',
              fontSize: 16,
              fontFamily: 'Inter',
              lineHeight: 24,
              minHeight: 80,
            }}
            editable={!loading}
          />
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!vibe.trim() || loading}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: vibe.trim() && !loading ? '#0EA5E9' : '#D1D5DB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>
              {loading ? '⟳' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestion Chips */}
      {!isFocused && (
        <View>
          <Text style={{
            color: '#6B7280',
            fontSize: 14,
            fontFamily: 'Inter',
            marginBottom: 12,
            textAlign: 'center'
          }}>
            Or try one of these:
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8
          }}>
            {SUGGESTION_CHIPS.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => handleChipPress(suggestion)}
                disabled={loading}
                style={{
                  backgroundColor: '#EFF6FF',
                  borderColor: '#BFDBFE',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  opacity: index * 0.1 + 0.7, // Staggered animation effect
                }}
              >
                <Text style={{
                  color: '#1D4ED8',
                  fontSize: 14,
                  fontFamily: 'Inter'
                }}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
