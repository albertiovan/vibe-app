import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ActivityCardWeb } from '../components/ActivityCardWeb';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../types';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

export const ResultsScreenWeb: React.FC<ResultsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { activities, moodAnalysis, vibe } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTryAgain = () => {
    navigation.goBack();
  };

  if (!activities || activities.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <EmptyState
          title="No Activities Found"
          message="We couldn't find activities matching your vibe. Try a different description!"
          actionText="Try Again"
          onAction={handleTryAgain}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16
          }}
        >
          <Text style={{ fontSize: 18, color: '#374151' }}>←</Text>
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1F2937',
            fontFamily: 'Inter'
          }}>
            Your Activities
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginTop: 2,
            fontFamily: 'Inter'
          }}>
            Based on: "{vibe}"
          </Text>
        </View>
      </View>

      {/* Mood Analysis */}
      <View style={{
        backgroundColor: 'white',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: 8,
          fontFamily: 'Inter'
        }}>
          Mood Analysis
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          fontFamily: 'Inter'
        }}>
          Primary mood: <Text style={{ fontWeight: '500', color: '#0EA5E9' }}>
            {moodAnalysis.primaryMood}
          </Text>
        </Text>
        {moodAnalysis.secondaryMoods && moodAnalysis.secondaryMoods.length > 0 && (
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginTop: 4,
            fontFamily: 'Inter'
          }}>
            Also feeling: {moodAnalysis.secondaryMoods.join(', ')}
          </Text>
        )}
      </View>

      {/* Activities List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 16,
            fontFamily: 'Inter'
          }}>
            Recommended for You ({activities.length})
          </Text>
          
          {activities.map((activity, index) => (
            <View
              key={activity.id}
              style={{
                marginBottom: 16,
                opacity: 1,
                transform: [{ translateY: 0 }],
              }}
            >
              <ActivityCardWeb activity={activity} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Try Again Button */}
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
      }}>
        <TouchableOpacity
          onPress={handleTryAgain}
          style={{
            backgroundColor: '#0EA5E9',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Inter'
          }}>
            Try Different Vibe
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
