import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCard } from '../../components/BadgeCard';
import { useAppData } from '../../context/AppDataContext';

export default function ProfileScreen() {
  const { profile, badges, authMode, firebaseReady, logout } = useAppData();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.handle}>{profile.handle}</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>

          <Text style={styles.bio}>{profile.bio}</Text>

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
                ? 'Veriler users/{uid} altında Firestore ile tutuluyor.'
                : firebaseReady
                  ? 'Demo veridesin. Gerçek hesapla giriş yapınca Firebase aktif olur.'
                  : 'Firebase config girilince giriş-kayıt ve ortak veri açılır.'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gezgin Rozetleri</Text>
          <Text style={styles.sectionSubtitle}>Pin, ülke ve galeri ilerlemesine göre otomatik hesaplanır</Text>
        </View>

        <View style={styles.badgesList}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 16, paddingBottom: 32 },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#111C2F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#263852',
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#38BDF8', marginBottom: 12 },
  userName: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  handle: { fontSize: 13, color: '#38BDF8', marginTop: 2 },
  levelBadge: { backgroundColor: 'rgba(14, 165, 233, 0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)' },
  levelText: { fontSize: 12, color: '#7DD3FC', fontWeight: '800' },
  bio: { fontSize: 13, color: '#CBD5E1', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#263852' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: '#263852' },
  syncCard: { flexDirection: 'row', gap: 12, backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', padding: 14, marginBottom: 18 },
  syncTextGroup: { flex: 1 },
  syncTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  syncDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#F8FAFC' },
  sectionSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badgesList: { marginBottom: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)' },
  logoutText: { fontSize: 13, color: '#FCA5A5', fontWeight: '800' },
});
