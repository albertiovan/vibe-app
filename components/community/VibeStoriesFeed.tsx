import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { GlassCard } from '../../ui/components/GlassCard';
import { getCommunityFeed, likePost, unlikePost, CommunityPost } from '../../src/services/communityApi';
import { userStorage } from '../../src/services/userStorage';
import { useLanguage } from '../../src/i18n/LanguageContext';
import PostCard from './PostCard';
import CreatePostButton from './CreatePostButton';

export default function VibeStoriesFeed() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadFeed();
    }
  }, [userId]);

  const loadUserId = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account?.userId) {
        setUserId(account.userId);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const loadFeed = async (offset: number = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('Loading feed for userId:', userId);
      const result = await getCommunityFeed(userId, 20, offset);
      console.log('Feed loaded successfully:', result.posts.length, 'posts');
      
      if (offset === 0) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }
      
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading feed:', error);
      // Show empty state on error
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed(0);
  }, [userId]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadFeed(posts.length);
    }
  }, [loadingMore, hasMore, loading, posts.length, userId]);

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                user_has_liked: !currentlyLiked,
                likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1,
              }
            : post
        )
      );

      // API call
      if (currentlyLiked) {
        await unlikePost(postId, userId);
      } else {
        await likePost(postId, userId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                user_has_liked: currentlyLiked,
                likes_count: currentlyLiked ? post.likes_count + 1 : post.likes_count - 1,
              }
            : post
        )
      );
    }
  };

  const handleComment = (postId: string) => {
    // TODO: Navigate to post detail screen with comments
    console.log('Open comments for post:', postId);
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostCard
      post={item}
      onLike={() => handleLike(item.id, item.user_has_liked)}
      onComment={() => handleComment(item.id)}
      onShare={() => handleShare(item.id)}
      language={language}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon]}>🌊</Text>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No posts yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Be the first to share your vibe! Complete activities and share your experiences with the community.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00D9FF" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading feed...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00D9FF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Create Post Button */}
      <CreatePostButton userId={userId} onPostCreated={() => handleRefresh()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 100, // Space for floating button
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
