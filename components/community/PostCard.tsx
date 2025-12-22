import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { GlassCard } from '../../ui/components/GlassCard';
import { CommunityPost } from '../../src/services/communityApi';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 20;
const IMAGE_HEIGHT = 300;

// Mock images for posts
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
];

// Mock comments
const MOCK_COMMENTS = [
  { id: '1', user: 'Maria', text: 'This looks amazing! 🔥', time: '2h ago' },
  { id: '2', user: 'David', text: 'I need to try this!', time: '1h ago' },
  { id: '3', user: 'Sofia', text: 'Love the vibe! 💙', time: '30m ago' },
];

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  language: string;
}

export default function PostCard({ post, onLike, onComment, onShare, language }: PostCardProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  
  // Assign a mock image based on post ID
  const mockImageIndex = parseInt(post.id) % MOCK_IMAGES.length;
  const mockImage = MOCK_IMAGES[mockImageIndex];

  const getPostTypeLabel = () => {
    switch (post.post_type) {
      case 'completion':
        return '✅ Completed Activity';
      case 'challenge':
        return '🔥 Challenge Accepted';
      case 'vibe_check':
        return '🌊 Vibe Check';
      case 'review':
        return '⭐ Activity Review';
      default:
        return '';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return posted.toLocaleDateString();
  };

  const activityName = language === 'ro' && post.activity_name_ro 
    ? post.activity_name_ro 
    : post.activity_name;

  const displayImage = post.photo_url || mockImage;
  
  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([...comments, {
        id: Date.now().toString(),
        user: 'You',
        text: commentText,
        time: 'Just now'
      }]);
      setCommentText('');
    }
  };
  
  const handleCommentPress = () => {
    setShowComments(true);
    onComment();
  };

  return (
    <View style={styles.card}>
      {/* Header: User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {post.profile_picture ? (
            <Image source={{ uri: post.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {post.nickname?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={[styles.nickname, { color: colors.text.primary }]}>
              {post.nickname}
            </Text>
            <Text style={[styles.timestamp, { color: colors.text.secondary }]}>
              {getTimeAgo(post.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.postTypeBadge}>
          <Text style={styles.postTypeText}>{getPostTypeLabel()}</Text>
        </View>
      </View>

      {/* Content */}
      {post.content && (
        <Text style={[styles.content, { color: colors.text.primary }]}>
          {post.content}
        </Text>
      )}

      {/* Activity Info */}
      {activityName && (
        <View style={styles.activityInfo}>
          <Text style={[styles.activityLabel, { color: colors.text.secondary }]}>
            Activity:
          </Text>
          <Text style={[styles.activityName, { color: '#00D9FF' }]}>
            {activityName}
          </Text>
        </View>
      )}

      {/* Vibe Before/After */}
      {(post.vibe_before || post.vibe_after) && (
        <View style={styles.vibeContainer}>
          {post.vibe_before && (
            <View style={styles.vibeItem}>
              <Text style={[styles.vibeLabel, { color: colors.text.secondary }]}>
                Before:
              </Text>
              <Text style={[styles.vibeText, { color: colors.text.primary }]}>
                {post.vibe_before}
              </Text>
            </View>
          )}
          {post.vibe_after && (
            <View style={styles.vibeItem}>
              <Text style={[styles.vibeLabel, { color: colors.text.secondary }]}>
                After:
              </Text>
              <Text style={[styles.vibeText, { color: colors.text.primary }]}>
                {post.vibe_after}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Photo */}
      {displayImage && !imageError && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImage }}
            style={styles.postImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
            style={styles.imageGradient}
          />
        </View>
      )}

      {/* Location */}
      {post.location_city && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={[styles.locationText, { color: colors.text.secondary }]}>
            {post.location_city}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, post.user_has_liked && styles.likedIcon]}>
            {post.user_has_liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, { color: colors.text.secondary }]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCommentPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionText, { color: colors.text.secondary }]}>
            {comments.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={[styles.actionText, { color: colors.text.secondary }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal - Instagram Style Bottom Sheet */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setShowComments(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContainer, { backgroundColor: colors.background }]}
          >
            {/* Modal Handle */}
            <View style={styles.modalHandle} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Comments
              </Text>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{comment.user.charAt(0)}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentText, { color: colors.text.primary }]}>
                      <Text style={styles.commentUser}>{comment.user}</Text> {comment.text}
                    </Text>
                    <View style={styles.commentFooter}>
                      <Text style={[styles.commentTime, { color: colors.text.secondary }]}>
                        {comment.time}
                      </Text>
                      <TouchableOpacity>
                        <Text style={[styles.replyButton, { color: colors.text.secondary }]}>Reply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Comment Input - Instagram Style */}
            <View style={[styles.commentInputContainer, { borderTopColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <View style={[styles.commentAvatar, styles.avatarPlaceholder, { width: 32, height: 32, borderRadius: 16 }]}>
                <Text style={[styles.avatarText, { fontSize: 14 }]}>Y</Text>
              </View>
              <TextInput
                style={[styles.commentInput, { color: colors.text.primary }]}
                placeholder="Add a comment..."
                placeholderTextColor={colors.text.secondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              {commentText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleAddComment}
                >
                  <Text style={styles.postButton}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D9FF',
  },
  userDetails: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '400',
  },
  postTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D9FF',
  },
  content: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  vibeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  vibeItem: {
    flex: 1,
  },
  vibeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Comments Modal Styles - Instagram Style
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    marginRight: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  commentFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  commentTime: {
    fontSize: 12,
  },
  replyButton: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
  },
  postButton: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
});
