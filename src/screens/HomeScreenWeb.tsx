import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VibeInputWeb } from '../components/VibeInputWeb';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList, RecommendationRequest } from '../types';
import { apiService } from '../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreenWeb: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleVibeSubmit = async (vibe: string) => {
    console.log('handleVibeSubmit called with:', vibe);
    setLoading(true);
    
    try {
      // Test proxy fetch first
      console.log('Testing proxy fetch...');
      const testResponse = await fetch('/api/health');
      console.log('Proxy fetch test:', testResponse.status, testResponse.ok);
      
      // Create recommendation request
      const request: RecommendationRequest = {
        vibe,
        city: 'Sinaia, Romania', // Start with Sinaia for testing
      };

      console.log('Making API request:', request);
      console.log('API base URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
      
      // Get recommendations from API
      const response = await apiService.getRecommendations(request);
      console.log('API response:', response);
      console.log('Response success:', response.success);
      console.log('Activities length:', response.data?.activities?.length);
      
      if (response.success && response.data.activities.length > 0) {
        console.log('Navigating to results with activities:', response.data.activities);
        // Navigate to results screen
        navigation.navigate('Results', {
          activities: response.data.activities,
          moodAnalysis: response.data.moodAnalysis,
          vibe
        });
      } else {
        console.log('Showing no activities alert');
        // Show empty state message using web-compatible method
        if (typeof window !== 'undefined') {
          // Use browser alert for web
          window.alert('No Activities Found\n\nWe couldn\'t find any activities matching your vibe. Try a different description or check back later!');
        } else {
          // Use React Native Alert for mobile
          Alert.alert(
            'No Activities Found',
            'We couldn\'t find any activities matching your vibe. Try a different description or check back later!',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error: error
      });
      
      if (typeof window !== 'undefined') {
        // Use browser alert for web
        window.alert(`Connection Error\n\nUnable to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        // Use React Native Alert for mobile
        Alert.alert(
          'Connection Error',
          `Unable to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ paddingTop: 32, paddingBottom: 24 }}>
          <Text style={{
            fontSize: 36,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1F2937',
            fontFamily: 'Inter'
          }}>
            vibe
          </Text>
          <Text style={{
            fontSize: 18,
            textAlign: 'center',
            color: '#6B7280',
            marginTop: 8,
            fontFamily: 'Inter'
          }}>
            Discover activities that match your mood
          </Text>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? (
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 48,
                height: 48,
                borderWidth: 4,
                borderColor: '#BFDBFE',
                borderTopColor: '#0EA5E9',
                borderRadius: 24,
                marginBottom: 16,
              }} />
              <Text style={{
                color: '#6B7280',
                fontFamily: 'Inter'
              }}>
                Finding your perfect activities...
              </Text>
            </View>
          ) : (
            <VibeInputWeb
              onSubmit={handleVibeSubmit}
              loading={loading}
              placeholder="How are you feeling today? What's your vibe?"
            />
          )}
        </View>

        {/* Footer */}
        <View style={{ paddingBottom: 32, paddingTop: 16 }}>
          <Text style={{
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: 14,
            fontFamily: 'Inter'
          }}>
            Powered by AI • Discover Romania
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
