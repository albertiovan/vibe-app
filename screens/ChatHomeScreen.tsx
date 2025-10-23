/**
 * ChatHomeScreen
 * Main conversational interface - "What's the vibe?"
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

type RootStackParamList = {
  ChatHome: undefined;
  ChatConversation: {
    conversationId: number;
    deviceId: string;
    initialMessage?: string;
  };
  UserProfile: undefined;
};
import { GlassCard } from '../components/design-system/GlassCard';
import { ThinkingOrb } from '../components/design-system/ThinkingOrb';
import { VibeChip } from '../components/design-system/VibeChip';
import { chatApi, ChatStartResponse } from '../src/services/chatApi';
import { weatherService, WeatherData } from '../src/services/weatherService';
import { colors, getTimeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

export const ChatHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [deviceId, setDeviceId] = useState<string>('');
  const [greeting, setGreeting] = useState<ChatStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const gradient = getTimeGradient();

  useEffect(() => {
    initializeScreen();
    startGradientAnimation();
  }, []);

  const startGradientAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const initializeScreen = async () => {
    try {
      // Get device ID
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(id);

      // Hardcoded location: Bucharest, Romania
      const location = {
        city: 'Bucharest',
        lat: 44.4268,
        lng: 26.1025,
      };
      
      // Fetch weather for Bucharest
      const weather = await weatherService.getCurrentWeather(
        location.lat,
        location.lng
      );
      
      console.log('🌤️ Current weather in Bucharest:', weather);

      // Start conversation with weather context
      const response = await chatApi.startConversation({
        deviceId: id,
        location,
        weather: weather || undefined, // Only pass if available
      });

      setGreeting(response);
      setCurrentConversationId(response.conversationId);
      
      // Load recent conversations
      const history = await chatApi.getHistory(id, 5);
      setRecentConversations(history.conversations);
      
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !greeting || !currentConversationId || !deviceId) return;

    const messageToSend = inputText.trim();
    
    // Navigate to conversation screen with initial message
    navigation.navigate('ChatConversation', {
      conversationId: currentConversationId,
      deviceId: deviceId,
      initialMessage: messageToSend, // Pass the message to auto-send
    });
    
    setInputText('');
    Keyboard.dismiss();
  };

  const handleConversationPress = (conversation: any) => {
    navigation.navigate('ChatConversation', {
      conversationId: conversation.id,
      deviceId: deviceId,
    });
  };

  const handleVibeChipPress = (vibe: string) => {
    setInputText(vibe);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThinkingOrb size={64} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Animated background gradient */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[gradient.start, gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: gradientAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.02, 0.05],
                }),
              },
            ]}
          />
        </LinearGradient>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Vibe</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
          activeOpacity={0.7}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Centered Content Container */}
      <View style={styles.centeredContainer}>
        {/* AI Greeting Card */}
        {greeting && (
          <GlassCard style={styles.centeredGreetingCard} padding="lg" radius="md">
            <Text style={styles.greetingEmoji}>{greeting.greeting.emoji}</Text>
            <Text style={styles.greetingText}>{greeting.greeting.text}</Text>
          </GlassCard>
        )}

        {/* Suggested Vibes */}
        {greeting && greeting.suggestedVibes.length > 0 && (
          <View style={styles.centeredVibesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {greeting.suggestedVibes.map((vibe, index) => {
                const [emoji, ...labelParts] = vibe.split(' ');
                const label = labelParts.join(' ');
                return (
                  <VibeChip
                    key={index}
                    emoji={emoji}
                    label={label}
                    onPress={() => handleVibeChipPress(label)}
                    style={styles.chip}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {/* Input Field - Always Centered */}
        <View style={styles.centeredInputContainer}>
          <GlassCard style={styles.inputCard} padding="sm" radius="sm">
            <TextInput
              style={styles.input}
              placeholder="Type here..."
              placeholderTextColor={colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              style={styles.sendButton}
            >
              <Text style={[
                styles.sendButtonText,
                !inputText.trim() && styles.sendButtonTextDisabled
              ]}>
                →
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Recent Conversations - Below Input */}
        {recentConversations.length > 0 && (
          <View style={styles.recentConversationsSection}>
            <Text style={styles.recentConversationsTitle}>Recent</Text>
            <ScrollView
              style={styles.recentConversationsScroll}
              showsVerticalScrollIndicator={false}
            >
              {recentConversations.slice(0, 3).map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  activeOpacity={0.8}
                  onPress={() => handleConversationPress(conversation)}
                >
                  <GlassCard style={styles.conversationCard} padding="sm" radius="sm">
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                      {conversation.title || 'Conversation'}
                    </Text>
                    <Text style={styles.conversationDate}>
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.base.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  centeredGreetingCard: {
    marginBottom: tokens.spacing.md,
    width: '100%',
  },
  centeredVibesSection: {
    width: '100%',
    marginBottom: tokens.spacing.lg,
  },
  centeredInputContainer: {
    width: '100%',
    marginBottom: tokens.spacing.lg,
  },
  recentConversationsSection: {
    width: '100%',
    maxHeight: 150,
  },
  recentConversationsTitle: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginBottom: tokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: tokens.typography.letterSpacing.wide,
  },
  recentConversationsScroll: {
    maxHeight: 120,
  },
  logo: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.base.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileIcon: {
    fontSize: 24,
  },
  greetingCard: {
    marginBottom: tokens.spacing.xl,
  },
  greetingEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  greetingText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: tokens.typography.fontSize.lg * tokens.typography.lineHeight.relaxed,
  },
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: tokens.typography.letterSpacing.wide,
  },
  chipsContainer: {
    paddingRight: tokens.spacing.lg,
  },
  chip: {
    marginRight: tokens.spacing.sm,
  },
  conversationCard: {
    marginBottom: tokens.spacing.sm,
  },
  conversationTitle: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  conversationDate: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  inputContainer: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg + 20, // Extra padding for home indicator
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: tokens.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: tokens.spacing.sm,
    paddingRight: tokens.spacing.xs,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  sendButtonTextDisabled: {
    opacity: 0.3,
  },
});
