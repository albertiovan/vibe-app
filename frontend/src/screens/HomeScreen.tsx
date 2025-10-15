import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { StackNavigationProp } from '@react-navigation/stack';
import { VibeInput } from '../components/VibeInput';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList, RecommendationRequest } from '../types';
import { apiService } from '../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleVibeSubmit = async (vibe: string) => {
    setLoading(true);
    
    try {
      // Create recommendation request
      const request: RecommendationRequest = {
        vibe,
        city: 'Bucharest, Romania', // Default city for MVP
      };

      // Get recommendations from API
      const response = await apiService.getRecommendations(request);
      
      if (response.success && response.data.activities.length > 0) {
        // Navigate to results screen
        navigation.navigate('Results', {
          activities: response.data.activities,
          moodAnalysis: response.data.moodAnalysis,
          vibe
        });
      } else {
        // Show empty state message
        Alert.alert(
          'No Activities Found',
          'We couldn\'t find any activities matching your vibe. Try a different description or check back later!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      Alert.alert(
        'Connection Error',
        'Unable to get recommendations right now. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="pt-8 pb-6"
        >
          <Text className="text-4xl font-bold text-center text-gray-900 font-inter">
            vibe
          </Text>
          <Text className="text-lg text-center text-gray-600 mt-2 font-inter">
            Discover activities that match your mood
          </Text>
        </MotiView>

        {/* Main Content */}
        <View className="flex-1 justify-center">
          {loading ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="items-center"
            >
              <MotiView
                animate={{ rotate: '360deg' }}
                transition={{
                  type: 'timing',
                  duration: 2000,
                  loop: true,
                }}
                className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mb-4"
              />
              <Text className="text-gray-600 font-inter">
                Finding your perfect activities...
              </Text>
            </MotiView>
          ) : (
            <VibeInput
              onSubmit={handleVibeSubmit}
              loading={loading}
              placeholder="How are you feeling today? What's your vibe?"
            />
          )}
        </View>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 800, delay: 400 }}
          className="pb-8 pt-4"
        >
          <Text className="text-center text-gray-500 text-sm font-inter">
            Powered by AI • Discover Romania
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};
