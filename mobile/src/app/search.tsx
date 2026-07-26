import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

type SearchResult = {
  id: string;
  type: 'Pin' | 'Günlük' | 'Galeri' | 'Rota' | 'Topluluk';
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export default function SearchScreen() {
  const { pins, journal, gallery, routes, communityPosts } = useAppData();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    const term = query.trim().toLocaleLowerCase('tr-TR');
    if (!term) return [];

    const matches = (values: Array<string | undefined>) => values.join(' ').toLocaleLowerCase('tr-TR').includes(term);
    return [
      ...pins.filter((pin) => matches([pin.title, pin.cityName, pin.countryName, pin.note, ...(pin.tags ?? [])])).map((pin) => ({
        id: `pin-${pin.id}`,
        type: 'Pin' as const,
        title: pin.title,
        subtitle: `${pin.cityName}, ${pin.countryName}`,
        icon: 'location-outline' as const,
        onPress: () => router.push(`/pin/${pin.id}`),
      })),
      ...journal.filter((entry) => matches([entry.title, entry.cityName, entry.body])).map((entry) => ({
        id: `journal-${entry.id}`,
        type: 'Günlük' as const,
        title: entry.title,
        subtitle: entry.cityName,
        icon: 'book-outline' as const,
      })),
      ...gallery.filter((item) => matches([item.title, item.cityName, item.note])).map((item) => ({
        id: `gallery-${item.id}`,
        type: 'Galeri' as const,
        title: item.title,
        subtitle: item.cityName,
        icon: 'image-outline' as const,
      })),
      ...routes.filter((route) => matches([route.title, route.cityName, route.description])).map((route) => ({
        id: `route-${route.id}`,
        type: 'Rota' as const,
        title: route.title,
        subtitle: `${route.cityName} · ${route.duration}`,
        icon: 'trail-sign-outline' as const,
      })),
      ...communityPosts.filter((post) => matches([post.cityName, post.content, post.authorName])).map((post) => ({
        id: `post-${post.id}`,
        type: 'Topluluk' as const,
        title: post.cityName,
        subtitle: `${post.authorName}: ${post.content.slice(0, 80)}`,
        icon: 'chatbubbles-outline' as const,
      })),
    ];
  }, [communityPosts, gallery, journal, pins, query, routes]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Arama</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={19} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pin, şehir, günlük, rota veya topluluk ara..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{query.trim() ? 'Eşleşen sonuç bulunamadı.' : 'Aramak için yazmaya başla.'}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultRow} onPress={item.onPress}>
            <View style={styles.resultIcon}>
              <Ionicons name={item.icon} size={20} color="#7DD3FC" />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.resultType}>{item.type}</Text>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  iconButton: { flexShrink: 0, width: 40, height: 40, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852' },
  title: { color: '#F8FAFC', fontSize: 21, fontWeight: '900' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 9, marginHorizontal: 16, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyText: { color: '#94A3B8', fontSize: 13, paddingTop: 10 },
  resultRow: { flexDirection: 'row', gap: 12, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 13, marginBottom: 10 },
  resultIcon: { flexShrink: 0, width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(14,165,233,.12)', alignItems: 'center', justifyContent: 'center' },
  resultText: { flex: 1, minWidth: 0 },
  resultType: { color: '#7DD3FC', fontSize: 11, fontWeight: '900', marginBottom: 2 },
  resultTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  resultSubtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 2 },
});
