import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ActivityCard } from '../components/ActivityCard';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../types';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
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

  const getMoodEmoji = (mood: string): string => {
    const moodEmojis: Record<string, string> = {
      adventurous: '🏔️',
      relaxed: '😌',
      social: '👥',
      creative: '🎨',
      energetic: '⚡',
      contemplative: '🧘',
      romantic: '💕',
      curious: '🔍',
      playful: '🎮',
      peaceful: '🕊️'
    };
    return moodEmojis[mood] || '✨';
  };

  if (activities.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="No Activities Found"
          message="We couldn't find any activities matching your vibe. Try describing your mood differently or check back later!"
          actionText="Try Again"
          onAction={handleTryAgain}
          icon="🤔"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="px-6 py-4 bg-white shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBackPress}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Text className="text-gray-700 text-lg">←</Text>
          </TouchableOpacity>
          
          <View className="flex-1 mx-4">
            <Text className="text-lg font-semibold text-gray-900 text-center font-inter">
              Perfect for your vibe
            </Text>
          </View>
          
          <View className="w-10" />
        </View>
      </MotiView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mood Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          className="mx-6 mt-4 mb-6 p-4 bg-white rounded-2xl shadow-sm"
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">
              {getMoodEmoji(moodAnalysis.primaryMood)}
            </Text>
            <Text className="text-lg font-semibold text-gray-900 font-inter">
              {moodAnalysis.primaryMood.charAt(0).toUpperCase() + moodAnalysis.primaryMood.slice(1)} Vibe
            </Text>
          </View>
          
          <Text className="text-gray-600 text-sm font-inter italic mb-2">
            "{vibe}"
          </Text>
          
          {moodAnalysis.secondaryMoods.length > 0 && (
            <Text className="text-gray-500 text-sm font-inter">
              Also feeling: {moodAnalysis.secondaryMoods.join(', ')}
            </Text>
          )}
          
          <View className="flex-row flex-wrap gap-1 mt-3">
            {moodAnalysis.suggestedCategories.slice(0, 3).map((category, index) => (
              <View key={index} className="bg-primary-100 px-2 py-1 rounded">
                <Text className="text-primary-700 text-xs font-inter">
                  {category}
                </Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Results Header */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
          className="px-6 mb-4"
        >
          <Text className="text-lg font-semibold text-gray-900 font-inter">
            {activities.length} Activities Found
          </Text>
          <Text className="text-gray-600 text-sm font-inter">
            Curated just for your mood
          </Text>
        </MotiView>

        {/* Activity Cards */}
        <View className="px-6 pb-6">
          {activities.map((activity, index) => (
            <MotiView
              key={activity.id}
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: 500,
                delay: 600 + index * 100,
              }}
            >
              <ActivityCard activity={activity} />
            </MotiView>
          ))}
        </View>

        {/* Try Again Button */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 1000 }}
          className="px-6 pb-8"
        >
          <TouchableOpacity
            onPress={handleTryAgain}
            className="bg-primary-500 rounded-xl py-4"
          >
            <Text className="text-white text-center font-semibold font-inter">
              Try a Different Vibe
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};
