/**
 * TrainingModeScreen
 * Interface for training the LLM with vibe → activity feedback
 * This screen allows manual curation of activity recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/design-system/GlassCard';
import { colors, getVibeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

const API_URL = __DEV__
  ? 'http://10.103.30.198:3000/api'
  : 'https://your-production-api.com/api';

interface Activity {
  id: number;
  name: string;
  bucket: string;
  region: string;
  energy_level?: string;
  indoor_outdoor?: string;
}

interface Recommendation {
  activities: Activity[];
  vibeAnalysis: {
    primaryMood: string;
    energyLevel: string;
    context: string;
  };
}

export const TrainingModeScreen: React.FC = () => {
  const [vibe, setVibe] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [sessionCount, setSessionCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(100);

  const gradient = getVibeGradient('calm');

  const handleGetRecommendations = async () => {
    if (!vibe.trim()) {
      Alert.alert('Enter a vibe', 'Please describe a vibe or mood to test');
      return;
    }

    setLoading(true);
    setRecommendation(null);
    setFeedback({});

    try {
      // Use the training recommendations endpoint
      const response = await fetch(`${API_URL}/training/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: vibe,
          location: {
            city: 'Bucharest',
            lat: 44.4268,
            lng: 26.1025,
          },
        }),
      });

      const data = await response.json();
      console.log('Training API response:', data);

      if (data.success && data.activities) {
        console.log('Activities received:', data.activities.map((a: any) => ({
          id: a.id,
          name: a.name
        })));
        setRecommendation({
          activities: data.activities,
          vibeAnalysis: data.vibeAnalysis || {
            primaryMood: 'unknown',
            energyLevel: 'unknown',
            context: vibe,
          },
        });
      } else {
        Alert.alert('Error', data.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Training mode error:', error);
      Alert.alert('Error', 'Failed to connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (activityId: number, type: 'up' | 'down') => {
    console.log('Feedback for activity:', activityId, 'Type:', type);
    setFeedback(prev => {
      const newFeedback = {
        ...prev,
        [activityId]: type,
      };
      console.log('Updated feedback state:', newFeedback);
      return newFeedback;
    });
  };

  const handleSubmitFeedback = async () => {
    if (!recommendation || Object.keys(feedback).length === 0) {
      Alert.alert('No feedback', 'Please provide thumbs up/down for at least one activity');
      return;
    }

    try {
      // Submit training feedback to backend
      const response = await fetch(`${API_URL}/training/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: vibe.trim(),
          vibeAnalysis: recommendation.vibeAnalysis,
          activities: recommendation.activities.map(activity => ({
            ...activity,
            feedback: feedback[activity.id] || null,
          })),
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionCount(prev => prev + 1);
        
        // Clear for next training session
        setVibe('');
        setRecommendation(null);
        setFeedback({});

        Alert.alert(
          'Feedback Saved ✅',
          `Session ${sessionCount + 1}/${totalSessions} complete. ${totalSessions - sessionCount - 1} remaining.`,
          [{ text: 'Continue', style: 'default' }]
        );
      } else {
        Alert.alert('Error', 'Failed to save feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  const handleSkip = () => {
    setVibe('');
    setRecommendation(null);
    setFeedback({});
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={[StyleSheet.absoluteFill, { opacity: 0.03 }]} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Training Mode</Text>
          <Text style={styles.subtitle}>
            Help improve recommendations by rating activity suggestions
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBarFill} />
            <Text style={styles.progressText}>
              {sessionCount}/{totalSessions} sessions complete
            </Text>
          </View>
        </View>

        {/* Vibe Input */}
        <GlassCard style={styles.inputCard} padding="md" radius="md">
          <Text style={styles.label}>Enter a vibe or mood:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., I just ate and I'm feeling lethargic"
            placeholderTextColor={colors.text.tertiary}
            value={vibe}
            onChangeText={setVibe}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.getButton, loading && styles.getButtonDisabled]}
            onPress={handleGetRecommendations}
            disabled={loading || !vibe.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.getButtonText}>Get Recommendations</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Recommendations */}
        {recommendation && (
          <>
            {/* Vibe Analysis */}
            <GlassCard style={styles.analysisCard} padding="md" radius="md">
              <Text style={styles.analysisTitle}>AI Analysis:</Text>
              <Text style={styles.analysisText}>
                Mood: {recommendation.vibeAnalysis.primaryMood}
              </Text>
              <Text style={styles.analysisText}>
                Energy: {recommendation.vibeAnalysis.energyLevel}
              </Text>
              <Text style={styles.analysisText}>
                Context: {recommendation.vibeAnalysis.context}
              </Text>
            </GlassCard>

            {/* Activities with Feedback */}
            <Text style={styles.sectionTitle}>
              Rate these recommendations:
            </Text>
            {recommendation.activities.map((activity, index) => (
              <View
                key={`activity-${activity.id || index}`}
                style={[
                  styles.activityCard,
                  feedback[activity.id] === 'up' ? styles.activityCardUp : null,
                  feedback[activity.id] === 'down' ? styles.activityCardDown : null,
                ]}
              >
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityMeta}>
                    {activity.bucket} • {activity.region}
                  </Text>
                  {activity.energy_level && (
                    <Text style={styles.activityEnergy}>
                      Energy: {activity.energy_level}
                    </Text>
                  )}
                </View>
                
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={[
                      styles.thumbButton,
                      feedback[activity.id] === 'up' ? styles.thumbButtonActive : null,
                    ]}
                    onPress={() => handleFeedback(activity.id, 'up')}
                  >
                    <Text style={styles.thumbIcon}>👍</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.thumbButton,
                      feedback[activity.id] === 'down' ? styles.thumbButtonActive : null,
                    ]}
                    onPress={() => handleFeedback(activity.id, 'down')}
                  >
                    <Text style={styles.thumbIcon}>👎</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Submit Buttons */}
            <View style={styles.submitContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  Object.keys(feedback).length === 0 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitFeedback}
                disabled={Object.keys(feedback).length === 0}
              >
                <Text style={styles.submitButtonText}>
                  Submit Feedback ({Object.keys(feedback).length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Instructions */}
        {!recommendation && !loading && (
          <GlassCard style={styles.instructionsCard} padding="lg" radius="md">
            <Text style={styles.instructionsTitle}>📝 How it works:</Text>
            <Text style={styles.instructionsText}>
              1. Enter a vibe or mood (be specific!)
            </Text>
            <Text style={styles.instructionsText}>
              2. Review AI recommendations
            </Text>
            <Text style={styles.instructionsText}>
              3. Give 👍 for good matches, 👎 for bad ones
            </Text>
            <Text style={styles.instructionsText}>
              4. Submit feedback to improve the system
            </Text>
            <Text style={styles.instructionsText}>
              5. Repeat for {totalSessions} different vibes
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.md,
    lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.relaxed,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: tokens.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    width: '0%', // Will be dynamic
  },
  progressText: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: tokens.spacing.xs,
  },
  inputCard: {
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  input: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    minHeight: 60,
    marginBottom: tokens.spacing.md,
  },
  getButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
  },
  getButtonDisabled: {
    opacity: 0.5,
  },
  getButtonText: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  analysisCard: {
    marginBottom: tokens.spacing.lg,
  },
  analysisTitle: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  analysisText: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  activityCard: {
    marginBottom: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityCardUp: {
    borderWidth: 2,
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  activityCardDown: {
    borderWidth: 2,
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  activityInfo: {
    flex: 1,
    marginRight: tokens.spacing.md,
  },
  activityName: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  activityMeta: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: tokens.spacing.xs,
  },
  activityEnergy: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.secondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  thumbButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbButtonActive: {
    backgroundColor: colors.accent.primary,
    transform: [{ scale: 1.1 }],
  },
  thumbIcon: {
    fontSize: 20,
  },
  submitContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
  },
  skipButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  submitButton: {
    flex: 2,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  instructionsCard: {
    marginTop: tokens.spacing.xl,
  },
  instructionsTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  instructionsText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.sm,
    lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.relaxed,
  },
});
