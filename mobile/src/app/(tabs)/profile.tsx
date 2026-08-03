import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, SafeAreaView, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';

export default function ProfileScreen() {
  const { profile, badges, authMode, firebaseReady, pendingSyncCount, user, logout, updateUserProfile } = useAppData();
  const [editVisible, setEditVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'menu' | 'account'>('menu');
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [favoritePlace, setFavoritePlace] = useState(profile.favoritePlace ?? '');
  const [website, setWebsite] = useState(profile.website ?? '');

  const unlockedBadges = useMemo(() => badges.filter((badge) => badge.unlocked), [badges]);
  const unlockedBadgeCount = unlockedBadges.length;
  const latestBadge = unlockedBadges.at(-1);

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

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Profil fotoğrafı seçebilmek için galeri erişimine izin vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]?.uri ?? avatar);
    }
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
        <View style={styles.profileCard}>
          <View style={styles.identityRow}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} alt={`${profile.name} profil fotoğrafı`} />
            <View style={styles.identityCopy}>
              <Text style={styles.userName} numberOfLines={2}>{profile.name}</Text>
              <Text style={styles.handle} numberOfLines={1}>{profile.handle}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="sparkles-outline" size={13} color="#7DD3FC" />
                <Text style={styles.levelText}>{profile.level}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.bio}>{profile.bio}</Text>
          {profile.favoritePlace ? <Text style={styles.favoriteText}>Favori yer: {profile.favoritePlace}</Text> : null}

          <View style={styles.statsContainer}>
            <ProfileStat value={profile.totalCities} label="Şehir" />
            <View style={styles.statDivider} />
            <ProfileStat value={profile.totalCountries} label="Ülke" />
            <View style={styles.statDivider} />
            <ProfileStat value={profile.totalPins} label="Pin" />
          </View>
        </View>

        <View style={styles.primaryActions}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={18} color="#FFF" />
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareProfile}>
            <Ionicons name="share-social-outline" size={18} color="#FBBF24" />
            <Text style={styles.shareText}>Paylaş</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.segmentedControl}>
          <SegmentButton label="Bilgiler" active={activeSection === 'info'} onPress={() => setActiveSection('info')} />
          <SegmentButton label="Menü" active={activeSection === 'menu'} onPress={() => setActiveSection('menu')} />
          <SegmentButton label="Hesap" active={activeSection === 'account'} onPress={() => setActiveSection('account')} />
        </View>

        {activeSection === 'info' && (
          <>
            {latestBadge ? (
              <View style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={22} color="#F59E0B" />
                </View>
                <View style={styles.achievementCopy}>
                  <Text style={styles.achievementTitle}>Yeni rozet kazanıldı</Text>
                  <Text style={styles.achievementText}>{latestBadge.title}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.infoGroup}>
              <InfoRow label="Favori yer" value={profile.favoritePlace || 'Henüz eklenmedi'} />
              <InfoRow label="Web / sosyal" value={profile.website || 'Henüz eklenmedi'} />
              <InfoRow label="Rozet durumu" value={`${unlockedBadgeCount}/${badges.length} rozet kazanıldı`} />
            </View>
          </>
        )}

        {activeSection === 'menu' && (
          <>
            <View style={styles.menuGroup}>
              <MenuRow
                icon="trophy-outline"
                title="Rozetler"
                description={`${unlockedBadgeCount}/${badges.length} rozet kazanıldı`}
                accent="#F59E0B"
                onPress={() => router.push('/badges')}
              />
              <MenuRow
                icon="images-outline"
                title="Galeri"
                description="Fotoğraflarını ve gezi anılarını görüntüle"
                accent="#A7F3D0"
                onPress={() => router.push('/gallery')}
              />
              <MenuRow
                icon="book-outline"
                title="Günlük"
                description="Notlarını ve seyahat hikayelerini aç"
                accent="#A7F3D0"
                onPress={() => router.push('/journal')}
                isLast
              />
            </View>

            <View style={styles.menuGroup}>
              <MenuRow
                icon="albums-outline"
                title="Koleksiyonlar"
                description="Pinlerini gezi planı veya tema olarak grupla"
                accent="#7DD3FC"
                onPress={() => router.push('/collections')}
              />
              <MenuRow
                icon="search-outline"
                title="Arama"
                description="Şehir, ülke ve mekanları hızlı bul"
                accent="#7DD3FC"
                onPress={() => router.push('/search')}
                isLast
              />
            </View>
          </>
        )}

        {activeSection === 'account' && (
          <>
            <View style={styles.menuGroup}>
              <MenuRow
                icon="settings-outline"
                title="Ayarlar"
                description="Bildirimler, senkron ve hesap tercihleri"
                accent="#7DD3FC"
                onPress={() => router.push('/settings')}
                isLast
              />
            </View>

            <View style={styles.syncCard}>
              <Ionicons name={authMode === 'firebase' ? 'cloud-done-outline' : 'phone-portrait-outline'} size={22} color="#38BDF8" />
              <View style={styles.syncTextGroup}>
                <Text style={styles.syncTitle}>{authMode === 'firebase' ? 'Bulut senkronu açık' : 'Demo mod'}</Text>
                <Text style={styles.syncDesc}>
                  {authMode === 'firebase'
                    ? pendingSyncCount
                      ? `${pendingSyncCount} işlem senkron bekliyor.`
                      : 'Verilerin hesabınla eşleşiyor.'
                    : firebaseReady
                      ? 'Gerçek hesapla giriş yapınca profilin bulutla başlar.'
                      : 'Firebase ayarları girilince hesap özellikleri açılır.'}
                </Text>
              </View>
            </View>

            {profile.isAdmin && (
              <View style={styles.adminCard}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#A7F3D0" />
                <Text style={styles.adminText}>Admin yetkisi aktif. Topluluk paylaşımlarını gizleyebilirsin.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
              <Text style={styles.logoutText}>Çıkış yap</Text>
            </TouchableOpacity>
          </>
        )}
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
            <View style={styles.avatarPickerRow}>
              <Image source={{ uri: avatar }} style={styles.avatarPreview} alt="Seçilen profil fotoğrafı" />
              <TouchableOpacity style={styles.avatarPickerButton} onPress={pickAvatar}>
                <Ionicons name="images-outline" size={19} color="#A7F3D0" />
                <Text style={styles.avatarPickerText}>Telefondan fotoğraf seç</Text>
              </TouchableOpacity>
            </View>
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

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress} activeOpacity={0.78}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  description,
  accent,
  onPress,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.menuRow, isLast && styles.menuRowLast]} onPress={onPress} activeOpacity={0.78}>
      <View style={[styles.menuIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.menuDesc} numberOfLines={2}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748B" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 16, paddingBottom: 32 },
  profileCard: { backgroundColor: '#111C2F', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#263852' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { flexShrink: 0, width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: '#38BDF8', backgroundColor: '#263852' },
  identityCopy: { flex: 1, minWidth: 0 },
  userName: { maxWidth: '100%', fontSize: 20, fontWeight: '900', color: '#F8FAFC' },
  handle: { maxWidth: '100%', fontSize: 13, color: '#38BDF8', marginTop: 2, fontWeight: '800' },
  levelBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(14,165,233,.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: 'rgba(14,165,233,.3)' },
  levelText: { fontSize: 12, color: '#7DD3FC', fontWeight: '900' },
  bio: { fontSize: 13, color: '#CBD5E1', marginTop: 14, lineHeight: 18 },
  favoriteText: { fontSize: 12, color: '#A7F3D0', marginTop: 7, fontWeight: '800' },
  statsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#263852' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#F8FAFC' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '800' },
  statDivider: { width: 1, height: 26, backgroundColor: '#263852' },
  primaryActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#0EA5E9', borderRadius: 12, paddingVertical: 12 },
  editButtonText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(251,191,36,.35)', backgroundColor: 'rgba(251,191,36,.08)', borderRadius: 12, paddingVertical: 12 },
  shareText: { color: '#FBBF24', fontSize: 14, fontWeight: '900' },
  segmentedControl: { flexDirection: 'row', gap: 6, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 5, marginBottom: 12 },
  segmentButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 38, borderRadius: 10, paddingHorizontal: 8 },
  segmentButtonActive: { backgroundColor: '#0EA5E9' },
  segmentText: { color: '#94A3B8', fontSize: 12, fontWeight: '900' },
  segmentTextActive: { color: '#FFF' },
  achievementCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(245,158,11,.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,.25)', borderRadius: 14, padding: 14, marginBottom: 12 },
  achievementIcon: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,.14)' },
  achievementCopy: { flex: 1, minWidth: 0 },
  achievementTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  achievementText: { color: '#FBBF24', fontSize: 12, fontWeight: '800', marginTop: 2 },
  infoGroup: { backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', marginBottom: 12, overflow: 'hidden' },
  infoRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  infoLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '900', marginBottom: 4 },
  infoValue: { color: '#F8FAFC', fontSize: 14, lineHeight: 19, fontWeight: '800' },
  menuGroup: { backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', marginBottom: 12, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: { flexShrink: 0, width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, minWidth: 0 },
  menuTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  menuDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 2 },
  syncCard: { flexDirection: 'row', gap: 12, backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', padding: 14, marginBottom: 12 },
  syncTextGroup: { flex: 1, minWidth: 0 },
  syncTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  syncDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 3 },
  adminCard: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(16,185,129,.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,.25)', borderRadius: 14, padding: 14, marginBottom: 12 },
  adminText: { flex: 1, color: '#A7F3D0', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,.1)', paddingVertical: 14, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.25)' },
  logoutText: { fontSize: 13, color: '#FCA5A5', fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  avatarPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, padding: 12, marginBottom: 10 },
  avatarPreview: { flexShrink: 0, width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: '#38BDF8', backgroundColor: '#263852' },
  avatarPickerButton: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,.25)', backgroundColor: 'rgba(16,185,129,.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 },
  avatarPickerText: { flexShrink: 1, color: '#A7F3D0', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  textArea: { height: 92, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});
