import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '../../components/PostCard';
import { INITIAL_POSTS } from '../../services/storage';
import { CommunityPost } from '../../types/travel';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCity, setNewPostCity] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;

    const newPost: CommunityPost = {
      id: `p-${Date.now()}`,
      authorName: 'Taha Emre',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      cityName: newPostCity.trim() || 'Genel',
      content: newPostText,
      likes: 0,
      commentsCount: 0,
      createdAt: 'Şimdi',
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setNewPostCity('');
    setShowNewPostForm(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Gezgin Topluluğu 💬</Text>
            <Text style={styles.subtitle}>İpuçları, mekan önerileri ve deneyimler</Text>
          </View>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setShowNewPostForm(!showNewPostForm)}
          >
            <Ionicons name={showNewPostForm ? 'close' : 'create-outline'} size={20} color="#FFF" />
            <Text style={styles.newPostText}>{showNewPostForm ? 'Kapat' : 'Paylaş'}</Text>
          </TouchableOpacity>
        </View>

        {/* New Post Form */}
        {showNewPostForm && (
          <View style={styles.postForm}>
            <TextInput
              style={styles.cityInput}
              placeholder="Hangi şehir / mekan hakkında? (Örn: Roma)"
              placeholderTextColor="#64748B"
              value={newPostCity}
              onChangeText={setNewPostCity}
            />
            <TextInput
              style={styles.postInput}
              placeholder="Topluluk ile bir gezi tavsiyesi veya deneyim paylaş..."
              placeholderTextColor="#64748B"
              multiline={true}
              numberOfLines={3}
              value={newPostText}
              onChangeText={setNewPostText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleCreatePost}>
              <Ionicons name="send" size={16} color="#FFF" />
              <Text style={styles.sendButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  newPostText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  postForm: {
    marginTop: 14,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cityInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 8,
  },
  postInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
});
