import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PostCard } from '../../components/PostCard';
import { useAppData } from '../../context/AppDataContext';
import { CommunityPost } from '../../types/travel';

export default function CommunityScreen() {
  const {
    communityPosts,
    commentsByPost,
    profile,
    user,
    followingIds,
    pendingSyncCount,
    addCommunityPost,
    addPin,
    togglePostLike,
    addComment,
    watchComments,
    hideCommunityPost,
    reportCommunityPost,
    blockUser,
    followUser,
    unfollowUser,
  } = useAppData();
  const [newPostText, setNewPostText] = useState('');
  const [newPostCity, setNewPostCity] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!selectedPost) return;
    return watchComments(selectedPost.id);
  }, [selectedPost, watchComments]);

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    if (imageUri.trim() && !imageUri.trim().startsWith('http://') && !imageUri.trim().startsWith('https://')) {
      Alert.alert('URL gerekli', 'Spark planda Firebase Storage kapalı olduğu için fotoğraf internet URLsi olmalı.');
      return;
    }
    await addCommunityPost({
      cityName: newPostCity.trim() || 'Genel',
      content: newPostText.trim(),
      imageUrl: imageUri.trim() || undefined,
      hidden: false,
      status: 'active',
    });
    setNewPostText('');
    setNewPostCity('');
    setImageUri('');
    setShowNewPostForm(false);
  };

  const handleAddComment = async () => {
    if (!selectedPost || !commentText.trim()) return;
    await addComment(selectedPost.id, commentText);
    setCommentText('');
  };

  const filteredPosts = communityPosts.filter((post) => {
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    if (!query) return true;
    return [post.cityName, post.content, post.authorName].join(' ').toLocaleLowerCase('tr-TR').includes(query);
  });

  const handleSavePin = async (post: CommunityPost) => {
    await addPin({
      title: post.cityName || 'Topluluk önerisi',
      cityName: post.cityName || 'Genel',
      countryName: 'Türkiye',
      category: 'İstek',
      rating: 4,
      note: post.content,
      latitude: 39,
      longitude: 35,
      imageUrl: post.imageUrl,
      tags: ['Topluluk', 'Öneri'],
      createdAt: new Date().toISOString(),
    });
    Alert.alert('Pin eklendi', 'Topluluk önerisi istek listene eklendi.');
  };

  const handleToggleFollow = async (post: CommunityPost) => {
    if (!post.authorId || post.authorId === user?.uid) return;
    if (followingIds.includes(post.authorId)) await unfollowUser(post.authorId);
    else await followUser(post.authorId);
  };

  const handleReport = (post: CommunityPost) => {
    Alert.alert('Paylaşımı rapor et', 'Bu paylaşımı neden rapor ediyorsun?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Spam', onPress: () => void reportCommunityPost(post, 'spam') },
      { text: 'Taciz', onPress: () => void reportCommunityPost(post, 'harassment') },
      { text: 'Diğer', onPress: () => void reportCommunityPost(post, 'other') },
    ]);
  };

  const handleBlock = (post: CommunityPost) => {
    if (!post.authorId || post.authorId === user?.uid) return;
    Alert.alert('Kullanıcıyı engelle', `${post.authorName} artık topluluk akışında görünmeyecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Engelle', style: 'destructive', onPress: () => void blockUser(post.authorId!) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text style={styles.title} numberOfLines={1}>Gezgin Topluluğu</Text>
            <Text style={styles.subtitle} numberOfLines={2}>Site ve mobil aynı Firebase topluluk akışını kullanır</Text>
          </View>
          <TouchableOpacity style={styles.newPostButton} onPress={() => setShowNewPostForm(!showNewPostForm)}>
            <Ionicons name={showNewPostForm ? 'close' : 'create-outline'} size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {pendingSyncCount > 0 && (
          <View style={styles.syncPill}>
            <Ionicons name="cloud-upload-outline" size={15} color="#FBBF24" />
            <Text style={styles.syncText} numberOfLines={2}>{pendingSyncCount} işlem internet gelince gönderilecek</Text>
          </View>
        )}

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Toplulukta şehir, kişi veya konu ara..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {showNewPostForm && (
          <View style={styles.postForm}>
            <TextInput style={styles.cityInput} placeholder="Şehir / mekan" placeholderTextColor="#64748B" value={newPostCity} onChangeText={setNewPostCity} />
            <TextInput style={styles.postInput} placeholder="Toplulukla bir tavsiye paylaş..." placeholderTextColor="#64748B" multiline value={newPostText} onChangeText={setNewPostText} />
            <TextInput style={styles.cityInput} placeholder="Fotoğraf URLsi (isteğe bağlı)" placeholderTextColor="#64748B" value={imageUri} onChangeText={setImageUri} autoCapitalize="none" />
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.sendButton} onPress={handleCreatePost}>
                <Ionicons name="send" size={16} color="#FFF" />
                <Text style={styles.sendButtonText}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            canModerate={profile.isAdmin}
            onLike={(post) => void togglePostLike(post)}
            onComment={setSelectedPost}
            onSavePin={(post) => void handleSavePin(post)}
            isFollowing={Boolean(item.authorId && followingIds.includes(item.authorId))}
            onToggleFollow={(post) => void handleToggleFollow(post)}
            onHide={(postId) => void hideCommunityPost(postId)}
            onReport={handleReport}
            onBlock={handleBlock}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz topluluk paylaşımı yok. İlk tavsiyeyi sen bırak.</Text>}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={Boolean(selectedPost)} animationType="slide" transparent onRequestClose={() => setSelectedPost(null)}>
        <View style={styles.overlay}>
          <View style={styles.commentModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yorumlar</Text>
              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedPost ? commentsByPost[selectedPost.id] ?? [] : []}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              ListEmptyComponent={<Text style={styles.emptyText}>Bu paylaşıma henüz yorum gelmedi.</Text>}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.authorName}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
            />

            <View style={styles.commentInputRow}>
              <TextInput style={styles.commentInput} placeholder="Yorum yaz..." placeholderTextColor="#64748B" value={commentText} onChangeText={setCommentText} />
              <TouchableOpacity style={styles.commentSend} onPress={handleAddComment}>
                <Ionicons name="send" size={17} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, backgroundColor: '#0B1120', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: 21, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  newPostButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
  syncPill: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: 'rgba(251,191,36,.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,.2)' },
  syncText: { flex: 1, minWidth: 0, color: '#FBBF24', fontSize: 12, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 11 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 13 },
  postForm: { marginTop: 14, backgroundColor: '#111C2F', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#263852' },
  cityInput: { backgroundColor: '#0B1120', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: '#F8FAFC', fontSize: 13, marginBottom: 8 },
  postInput: { backgroundColor: '#0B1120', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: '#F8FAFC', fontSize: 13, minHeight: 74, textAlignVertical: 'top', marginBottom: 10 },
  previewImage: { height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: '#263852' },
  formActions: { flexDirection: 'row', gap: 10 },
  sendButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 11, borderRadius: 10, gap: 6 },
  sendButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 28 },
  emptyText: { color: '#94A3B8', fontSize: 13, lineHeight: 19, paddingVertical: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  commentModal: { maxHeight: '78%', backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '800' },
  commentsList: { maxHeight: 320 },
  commentItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  commentAuthor: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  commentText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginTop: 3 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  commentInput: { flex: 1, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11 },
  commentSend: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
});
