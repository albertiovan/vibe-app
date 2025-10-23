/**
 * ChatConversationScreen
 * Active chat with messages and AI recommendations
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { GlassCard } from '../components/design-system/GlassCard';
import { ThinkingOrb } from '../components/design-system/ThinkingOrb';
import { GradientButton } from '../components/design-system/GradientButton';
import ActivityFilters, { FilterOptions } from '../components/filters/ActivityFilters';
import { chatApi, Message } from '../src/services/chatApi';
import { weatherService } from '../src/services/weatherService';
import { colors, getTimeGradient, getVibeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

type RouteParams = {
  ChatConversation: {
    conversationId: number;
    deviceId: string;
    initialMessage?: string;
    initialFilters?: FilterOptions;
  };
};

export const ChatConversationScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ChatConversation'>>();
  const { conversationId, deviceId, initialMessage, initialFilters } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [vibeState, setVibeState] = useState<'calm' | 'excited' | 'romantic' | 'adventurous'>('calm');
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {}); // Use initialFilters if provided
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const gradient = getVibeGradient(vibeState);

  useEffect(() => {
    loadConversation();
    requestLocationPermission();
  }, [conversationId]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log('📍 User location obtained:', location.coords.latitude, location.coords.longitude);
      } else {
        console.log('⚠️ Location permission denied');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const { conversation } = await chatApi.getConversation(conversationId);
      setMessages(conversation.messages || []);
      if (conversation.vibe_state) {
        setVibeState(conversation.vibe_state as any);
      }
      
      // Scroll to bottom after loading
      setTimeout(() => scrollToBottom(), 100);
      
      // Auto-send initial message if provided
      if (initialMessage && initialMessage.trim()) {
        console.log('🚀 Auto-sending initial message:', initialMessage);
        setTimeout(() => {
          sendMessage(initialMessage);
        }, 500); // Small delay to let UI settle
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    // Add user message immediately (optimistic update)
    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);
    
    setLoading(true);
    scrollToBottom();

    try {
      // Use user location if available, fallback to Bucharest
      const location = {
        city: 'Bucharest',
        lat: userLocation?.latitude || 44.4268,
        lng: userLocation?.longitude || 26.1025,
      };
      
      // Prepare filters with user location
      const activeFilters = {
        ...filters,
        userLatitude: userLocation?.latitude,
        userLongitude: userLocation?.longitude,
      };
      
      // Send message to API with filters
      const response = await chatApi.sendMessage({
        conversationId,
        message: messageText,
        location,
        filters: Object.keys(activeFilters).length > 2 ? activeFilters : undefined, // Only send if filters besides location
      });

      // Update vibe state
      setVibeState(response.vibeState);

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        metadata: { activities: response.activities },
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      scrollToBottom();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try to get more details from the response
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Show user-friendly error
      // Could add Alert.alert here
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    
    await sendMessage(userMessage);
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {isUser ? (
          // User message
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{message.content}</Text>
          </View>
        ) : (
          // AI message
          <GlassCard style={styles.aiBubble} padding="md" radius="md">
            <Text style={styles.aiText}>{message.content}</Text>
            
            {/* Activity cards if present */}
            {message.metadata?.activities && message.metadata.activities.length > 0 && (
              <View style={styles.activitiesContainer}>
                <Text style={styles.activitiesLabel}>Recommended for you:</Text>
                {message.metadata.activities.slice(0, 5).map((activity: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.activityCard}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityMeta}>
                      {activity.bucket} • {activity.region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </GlassCard>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Vibe-aware background gradient */}
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={[StyleSheet.absoluteFill, { opacity: 0.03 }]} />
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ActivityFilters
          onFiltersChange={setFilters}
          userLocation={userLocation || undefined}
          initialFilters={filters} // Pass current filters to preserve selections
        />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(renderMessage)}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ThinkingOrb size={32} />
          </View>
        )}
      </ScrollView>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <GlassCard style={styles.inputCard} padding="sm" radius="sm">
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || loading}
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled
            ]}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  filtersContainer: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.md,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  messageContainer: {
    marginBottom: tokens.spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  userBubble: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    maxWidth: '80%',
  },
  userText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.normal,
  },
  aiBubble: {
    maxWidth: '85%',
  },
  aiText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing.sm,
  },
  activitiesContainer: {
    marginTop: tokens.spacing.md,
  },
  activitiesLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityName: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginTop: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
  },
  inputContainer: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md + 20,
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
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.xs,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: tokens.typography.fontWeight.bold,
  },
});
