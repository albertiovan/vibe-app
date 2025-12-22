import { API_BASE_URL } from '../config/api';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CommunityPost {
  id: string;
  user_id: string;
  activity_id?: number;
  post_type: 'completion' | 'challenge' | 'vibe_check' | 'review';
  content?: string;
  photo_url?: string;
  vibe_before?: string;
  vibe_after?: string;
  energy_level?: 'low' | 'medium' | 'high';
  location_city?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  // Joined fields
  nickname: string;
  profile_picture?: string;
  activity_name?: string;
  activity_name_ro?: string;
  activity_image_url?: string;
  user_has_liked: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
  profile_picture?: string;
}

export interface ActivityReview {
  id: string;
  user_id: string;
  activity_id: number;
  rating: number;
  review_text?: string;
  photo_url?: string;
  vibe_tags: string[];
  recommended_for_energy?: 'low' | 'medium' | 'high';
  helpful_count: number;
  created_at: string;
  nickname: string;
  profile_picture?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  profile_picture?: string;
  challenges_completed: number;
  total_points: number;
  avg_difficulty: number;
}

export interface UserStats {
  posts_count: number;
  reviews_count: number;
  challenges_count: number;
  total_points: number;
  total_likes_received: number;
}

// ============================================
// VIBE STORIES FEED
// ============================================

export async function getCommunityFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ posts: CommunityPost[]; hasMore: boolean }> {
  try {
    console.log('Fetching community feed from:', `${API_BASE_URL}/api/community/feed`);
    const response = await fetch(
      `${API_BASE_URL}/api/community/feed?userId=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch community feed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Feed data received:', data);
    return data;
  } catch (error) {
    console.error('Network error in getCommunityFeed:', error);
    throw error;
  }
}

export async function createPost(post: {
  userId: string;
  activityId?: number;
  postType: 'completion' | 'challenge' | 'vibe_check' | 'review';
  content?: string;
  photoUrl?: string;
  vibeBefore?: string;
  vibeAfter?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  locationCity?: string;
  locationLat?: number;
  locationLng?: number;
}): Promise<CommunityPost> {
  const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}

// ============================================
// LIKES
// ============================================

export async function likePost(postId: string, userId: string): Promise<{ likesCount: number }> {
  const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }

  return response.json();
}

export async function unlikePost(postId: string, userId: string): Promise<{ likesCount: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/posts/${postId}/like?userId=${userId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to unlike post');
  }

  return response.json();
}

// ============================================
// COMMENTS
// ============================================

export async function getComments(
  postId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ comments: PostComment[] }> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/posts/${postId}/comments?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<PostComment> {
  const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  return response.json();
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/comments/${commentId}?userId=${userId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
}

// ============================================
// ACTIVITY REVIEWS & RATINGS
// ============================================

export async function getActivityReviews(
  activityId: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ reviews: ActivityReview[]; avgRating: number; reviewCount: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/activities/${activityId}/reviews?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return response.json();
}

export async function createReview(review: {
  userId: string;
  activityId: number;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
  vibeTags?: string[];
  recommendedForEnergy?: 'low' | 'medium' | 'high';
}): Promise<ActivityReview> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/activities/${review.activityId}/reviews`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create review');
  }

  return response.json();
}

// ============================================
// CHALLENGE LEADERBOARD
// ============================================

export async function getLeaderboard(
  period: 'weekly' | 'monthly' | 'alltime' = 'weekly'
): Promise<{ leaderboard: LeaderboardEntry[]; period: string }> {
  const response = await fetch(`${API_BASE_URL}/api/community/leaderboard?period=${period}`);

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
}

export async function recordChallengeCompletion(completion: {
  userId: string;
  activityId: number;
  originalEnergy: string;
  challengeEnergy: string;
  photoUrl?: string;
  completionNotes?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/community/challenges/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(completion),
  });

  if (!response.ok) {
    throw new Error('Failed to record challenge completion');
  }

  return response.json();
}

// ============================================
// USER STATS
// ============================================

export async function getUserStats(userId: string): Promise<UserStats> {
  const response = await fetch(`${API_BASE_URL}/api/community/users/${userId}/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }

  return response.json();
}

// ============================================
// CONTENT MODERATION
// ============================================

export async function reportContent(report: {
  reporterUserId: string;
  contentType: 'post' | 'comment' | 'review';
  contentId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'other';
  description?: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/community/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error('Failed to submit report');
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export async function registerPushToken(
  userId: string,
  token: string,
  deviceType: 'ios' | 'android' | 'web'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/community/push-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token, deviceType }),
  });

  if (!response.ok) {
    throw new Error('Failed to register push token');
  }
}

export async function updatePushPreferences(
  userId: string,
  preferences: {
    likesEnabled: boolean;
    commentsEnabled: boolean;
    challengesEnabled: boolean;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/community/push-tokens/${userId}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update push preferences');
  }
}
