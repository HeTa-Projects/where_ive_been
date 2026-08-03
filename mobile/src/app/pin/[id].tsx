import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';

export default function PinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pins, deletePin } = useAppData();
  const pin = useMemo(() => pins.find((item) => item.id === id), [id, pins]);

  if (!pin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.title}>Pin bulunamadı</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>

        {pin.imageUrl ? <Image source={{ uri: pin.imageUrl }} style={styles.cover} /> : <View style={styles.coverPlaceholder}><Ionicons name="location" size={44} color="#64748B" /></View>}

        <View style={styles.content}>
          <Text style={styles.kicker}>{pin.category}</Text>
          <Text style={styles.title}>{pin.title}</Text>
          <Text style={styles.location}>{pin.cityName}, {pin.countryName}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="star" size={15} color="#F59E0B" />
              <Text style={styles.metaText}>{pin.rating}.0</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="navigate-outline" size={15} color="#7DD3FC" />
              <Text style={styles.metaText}>{pin.latitude.toFixed(3)}, {pin.longitude.toFixed(3)}</Text>
            </View>
          </View>

          {pin.visitedDate ? <Text style={styles.dateText}>{pin.visitedDate}</Text> : null}
          {pin.note ? <Text style={styles.sectionText}>{pin.note}</Text> : null}
          {pin.journal ? (
            <View style={styles.journalBox}>
              <Text style={styles.sectionTitle}>Gezi günlüğü</Text>
              <Text style={styles.sectionText}>{pin.journal}</Text>
            </View>
          ) : null}

          {!!pin.tags?.length && (
            <View style={styles.tags}>
              {pin.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
            </View>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={() => void deletePin(pin.id).then(() => router.back())}>
            <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
            <Text style={styles.deleteText}>Pini sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { paddingBottom: 28 },
  iconButton: { position: 'absolute', zIndex: 2, top: 16, left: 16, width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(15,23,42,.82)', alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 270, backgroundColor: '#263852' },
  coverPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111C2F' },
  content: { padding: 18 },
  kicker: { color: '#38BDF8', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  title: { color: '#F8FAFC', fontSize: 27, fontWeight: '900' },
  location: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  metaText: { color: '#CBD5E1', fontSize: 12, fontWeight: '800' },
  dateText: { color: '#A7F3D0', fontSize: 13, fontWeight: '800', marginTop: 14 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  sectionText: { color: '#CBD5E1', fontSize: 14, lineHeight: 21, marginTop: 12 },
  journalBox: { backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', padding: 14, marginTop: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tag: { color: '#7DD3FC', backgroundColor: 'rgba(14,165,233,.12)', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: '800' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: 'rgba(239,68,68,.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,.25)', borderRadius: 12, paddingVertical: 14, marginTop: 22 },
  deleteText: { color: '#FCA5A5', fontSize: 14, fontWeight: '900' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backButton: { marginTop: 14, backgroundColor: '#0EA5E9', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  backText: { color: '#FFF', fontWeight: '900' },
});
