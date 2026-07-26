import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BadgeCard } from '../../components/BadgeCard';
import { useAppData } from '../../context/AppDataContext';

export default function ProfileScreen() {
  const { profile, badges, authMode, firebaseReady, pendingSyncCount, user, logout, updateUserProfile } = useAppData();
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [favoritePlace, setFavoritePlace] = useState(profile.favoritePlace ?? '');
  const [website, setWebsite] = useState(profile.website ?? '');

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const openEditModal = () => {
    setName(profile.name);
    setHandle(profile.handle);
    setBio(profile.bio);
    setAvatar(profile.avatar);
    setFavoritePlace(profile.favoritePlace ?? '');
    setWebsite(profile.website ?? '');
    setEditVisible(true);
  };

  const handleSave = async () => {
    await updateUserProfile({
      name: name.trim() || profile.name,
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      bio: bio.trim(),
      avatar: avatar.trim() || profile.avatar,
      favoritePlace: favoritePlace.trim(),
      website: website.trim(),
    });
    setEditVisible(false);
  };

  const shareProfile = async () => {
    if (!user?.uid) return;
    const url = `https://where-ive-been.vercel.app/u/${user.uid}`;
    await Share.share({ message: `${profile.name} seyahat profilim: ${url}`, url });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.userName} numberOfLines={2}>{profile.name}</Text>
          <Text style={styles.handle} numberOfLines={1}>{profile.handle}</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>

          <Text style={styles.bio}>{profile.bio}</Text>
          {profile.favoritePlace ? <Text style={styles.favoriteText}>Favori yer: {profile.favoritePlace}</Text> : null}

          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={17} color="#FFF" />
            <Text style={styles.editButtonText}>Profili düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={17} color="#7DD3FC" />
            <Text style={styles.settingsButtonText}>Ayarlar ve bildirimler</Text>
          </TouchableOpacity>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/collections')}>
              <Ionicons name="albums-outline" size={17} color="#A7F3D0" />
              <Text style={styles.quickText}>Koleksiyonlar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/search')}>
              <Ionicons name="search-outline" size={17} color="#A7F3D0" />
              <Text style={styles.quickText}>Arama</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={shareProfile}>
            <Ionicons name="share-social-outline" size={17} color="#FBBF24" />
            <Text style={styles.shareText}>Profil linkini paylaş</Text>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.totalCities}</Text>
              <Text style={styles.statLabel}>Şehir</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.totalCountries}</Text>
              <Text style={styles.statLabel}>Ülke</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.totalPins}</Text>
              <Text style={styles.statLabel}>Pin</Text>
            </View>
          </View>
        </View>

        <View style={styles.syncCard}>
          <Ionicons name={authMode === 'firebase' ? 'cloud-done-outline' : 'phone-portrait-outline'} size={22} color="#38BDF8" />
          <View style={styles.syncTextGroup}>
            <Text style={styles.syncTitle}>{authMode === 'firebase' ? 'Firebase senkronizasyonu' : 'Demo mod'}</Text>
            <Text style={styles.syncDesc}>
              {authMode === 'firebase'
                ? `Veriler users/{uid} ve communityPosts yollarında tutuluyor.${pendingSyncCount ? ` ${pendingSyncCount} işlem bekliyor.` : ''}`
                : firebaseReady
                  ? 'Demo veridesin. Gerçek hesapla giriş yapınca boş profilin Firebase ile başlar.'
                  : 'Firebase config girilince giriş-kayıt ve ortak veri açılır.'}
            </Text>
          </View>
        </View>

        {profile.isAdmin && (
          <View style={styles.adminCard}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#A7F3D0" />
            <Text style={styles.adminText}>Admin yetkisi aktif. Topluluk paylaşımlarını gizleyebilirsin.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gezgin Rozetleri</Text>
          <Text style={styles.sectionSubtitle}>Pin, ülke, galeri, günlük ve topluluk ilerlemesine göre hesaplanır</Text>
        </View>

        <View style={styles.badgesList}>
          {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili düzenle</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="@kullaniciadi" placeholderTextColor="#64748B" value={handle} onChangeText={setHandle} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Avatar URL" placeholderTextColor="#64748B" value={avatar} onChangeText={setAvatar} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Favori yer" placeholderTextColor="#64748B" value={favoritePlace} onChangeText={setFavoritePlace} />
            <TextInput style={styles.input} placeholder="Web sitesi / sosyal link" placeholderTextColor="#64748B" value={website} onChangeText={setWebsite} autoCapitalize="none" />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Bio" placeholderTextColor="#64748B" multiline value={bio} onChangeText={setBio} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 16, paddingBottom: 32 },
  profileHeader: { alignItems: 'center', backgroundColor: '#111C2F', borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#263852' },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#38BDF8', marginBottom: 12, backgroundColor: '#263852' },
  userName: { maxWidth: '100%', textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  handle: { maxWidth: '100%', fontSize: 13, color: '#38BDF8', marginTop: 2 },
  levelBadge: { backgroundColor: 'rgba(14,165,233,.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: 'rgba(14,165,233,.3)' },
  levelText: { fontSize: 12, color: '#7DD3FC', fontWeight: '800' },
  bio: { fontSize: 13, color: '#CBD5E1', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  favoriteText: { fontSize: 12, color: '#A7F3D0', marginTop: 7, fontWeight: '700' },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#0EA5E9', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 14 },
  editButtonText: { flexShrink: 1, color: '#FFF', fontSize: 13, fontWeight: '800' },
  settingsButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 9 },
  settingsButtonText: { flexShrink: 1, color: '#7DD3FC', fontSize: 13, fontWeight: '800' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9, marginTop: 9 },
  quickButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minWidth: 132, gap: 7, borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  quickText: { flexShrink: 1, color: '#A7F3D0', fontSize: 13, fontWeight: '800' },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(251,191,36,.35)', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 9 },
  shareText: { flexShrink: 1, color: '#FBBF24', fontSize: 13, fontWeight: '800' },
  statsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#263852' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: '#263852' },
  syncCard: { flexDirection: 'row', gap: 12, backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', padding: 14, marginBottom: 12 },
  syncTextGroup: { flex: 1, minWidth: 0 },
  syncTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  syncDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 3 },
  adminCard: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(16,185,129,.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,.25)', borderRadius: 14, padding: 14, marginBottom: 14 },
  adminText: { flex: 1, color: '#A7F3D0', fontSize: 12, lineHeight: 17, fontWeight: '700' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#F8FAFC' },
  sectionSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badgesList: { marginBottom: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,.1)', paddingVertical: 14, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.25)' },
  logoutText: { fontSize: 13, color: '#FCA5A5', fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '800' },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  textArea: { height: 92, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
