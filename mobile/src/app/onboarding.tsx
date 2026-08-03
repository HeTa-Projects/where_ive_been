import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function OnboardingScreen() {
  const { profile, updateUserProfile } = useAppData();
  const [name, setName] = useState(profile.name === 'Yeni Gezgin' ? '' : profile.name);
  const [handle, setHandle] = useState(profile.handle === '@gezgin' ? '' : profile.handle);
  const [favoritePlace, setFavoritePlace] = useState('');
  const [firstDestination, setFirstDestination] = useState('');

  const finish = async () => {
    await updateUserProfile({
      name: name.trim() || profile.name,
      handle: handle.trim() ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) : profile.handle,
      favoritePlace: favoritePlace.trim(),
      firstDestination: firstDestination.trim(),
      onboardingCompleted: true,
      bio: favoritePlace.trim()
        ? `${favoritePlace.trim()} favori rotam. Sıradaki hedefim ${firstDestination.trim() || 'yeni şehirler'}.`
        : profile.bio,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="compass-outline" size={34} color="#7DD3FC" />
        </View>
        <Text style={styles.title}>Profilini hazırlayalım</Text>
        <Text style={styles.subtitle}>Hesabın boş başlar. Burada sadece profil bilgilerini alıyoruz; otomatik pin veya paylaşım eklenmez.</Text>

        <TextInput style={styles.input} placeholder="Adın" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="@kullaniciadi" placeholderTextColor="#64748B" autoCapitalize="none" value={handle} onChangeText={setHandle} />
        <TextInput style={styles.input} placeholder="Favori şehir / yer" placeholderTextColor="#64748B" value={favoritePlace} onChangeText={setFavoritePlace} />
        <TextInput style={styles.input} placeholder="İlk hedef rota" placeholderTextColor="#64748B" value={firstDestination} onChangeText={setFirstDestination} />

        <TouchableOpacity style={styles.primaryButton} onPress={finish}>
          <Text style={styles.primaryText}>Başla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void updateUserProfile({ onboardingCompleted: true }).then(() => router.replace('/(tabs)'))}>
          <Text style={styles.secondaryText}>Şimdilik geç</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1, padding: 22, justifyContent: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 22 },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 13, marginBottom: 11 },
  primaryButton: { backgroundColor: '#0EA5E9', borderRadius: 12, alignItems: 'center', paddingVertical: 15, marginTop: 6 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', paddingVertical: 14 },
  secondaryText: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },
});
