import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityPost } from '../types/travel';

interface PostCardProps {
  post: CommunityPost;
  canModerate?: boolean;
  onLike: (post: CommunityPost) => void;
  onComment: (post: CommunityPost) => void;
  onSavePin?: (post: CommunityPost) => void;
  isFollowing?: boolean;
  onToggleFollow?: (post: CommunityPost) => void;
  onHide?: (postId: string) => void;
  onReport?: (post: CommunityPost) => void;
  onBlock?: (post: CommunityPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, canModerate, onLike, onComment, onSavePin, isFollowing, onToggleFollow, onHide, onReport, onBlock }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.authorAvatar || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&auto=format&fit=crop&q=80' }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
          <Text style={styles.cityTag} numberOfLines={1}>Konum: {post.cityName} · {post.createdAt}</Text>
        </View>
        {post.authorId && onToggleFollow && (
          <TouchableOpacity style={styles.followButton} onPress={() => onToggleFollow(post)}>
            <Text style={styles.followText} numberOfLines={1}>{isFollowing ? 'Takipte' : 'Takip et'}</Text>
          </TouchableOpacity>
        )}
        {canModerate && (
          <TouchableOpacity style={styles.moderateButton} onPress={() => onHide?.(post.id)}>
            <Ionicons name="eye-off-outline" size={18} color="#FCA5A5" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onLike(post)}>
          <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={20} color={post.isLiked ? '#EF4444' : '#94A3B8'} />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>{post.likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={18} color="#94A3B8" />
          <Text style={styles.actionText}>{post.commentsCount} Yorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onSavePin?.(post)}>
          <Ionicons name="bookmark-outline" size={18} color="#94A3B8" />
          <Text style={styles.actionText}>Pin</Text>
        </TouchableOpacity>
      </View>

      {(onReport || onBlock) && (
        <View style={styles.safetyRow}>
          {onReport && (
            <TouchableOpacity style={styles.safetyButton} onPress={() => onReport(post)}>
              <Ionicons name="flag-outline" size={16} color="#FBBF24" />
              <Text style={styles.safetyText}>Rapor et</Text>
            </TouchableOpacity>
          )}
          {post.authorId && onBlock && (
            <TouchableOpacity style={styles.safetyButton} onPress={() => onBlock(post)}>
              <Ionicons name="ban-outline" size={16} color="#FCA5A5" />
              <Text style={styles.blockText}>Engelle</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#111C2F', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#263852' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#263852' },
  authorInfo: { flex: 1, minWidth: 0 },
  authorName: { fontSize: 14, fontWeight: '800', color: '#F8FAFC' },
  cityTag: { fontSize: 12, color: '#38BDF8', marginTop: 2 },
  moderateButton: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,.1)' },
  followButton: { flexShrink: 0, borderWidth: 1, borderColor: '#263852', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 },
  followText: { color: '#7DD3FC', fontSize: 11, fontWeight: '900' },
  content: { fontSize: 14, color: '#CBD5E1', lineHeight: 20, marginBottom: 10 },
  postImage: { width: '100%', height: 190, borderRadius: 12, marginBottom: 10, backgroundColor: '#263852' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#263852' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
  likedText: { color: '#EF4444' },
  safetyRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 11 },
  safetyButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  safetyText: { color: '#FBBF24', fontSize: 12, fontWeight: '800' },
  blockText: { color: '#FCA5A5', fontSize: 12, fontWeight: '800' },
});
