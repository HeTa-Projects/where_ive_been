import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddPinModal } from '../../components/AddPinModal';
import { MapHeader } from '../../components/MapHeader';
import { PinCard } from '../../components/PinCard';
import { TravelMap } from '../../components/TravelMap';
import { useAppData } from '../../context/AppDataContext';
import { PinCategory } from '../../types/travel';

export default function PinsMapScreen() {
  const { pins, addPin, deletePin } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<'Tümü' | PinCategory>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const matchesCategory = selectedCategory === 'Tümü' || pin.category === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        pin.title.toLowerCase().includes(query) ||
        pin.cityName.toLowerCase().includes(query) ||
        pin.countryName.toLowerCase().includes(query) ||
        pin.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [pins, searchQuery, selectedCategory]);

  const counts = {
    visited: pins.filter((pin) => pin.category === 'Gittim').length,
    wish: pins.filter((pin) => pin.category === 'İstek').length,
    favorite: pins.filter((pin) => pin.category === 'Favori').length,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <MapHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setAddModalVisible(true)}
      />

      <FlatList
        data={filteredPins}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <TravelMap pins={filteredPins} />
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{counts.visited}</Text>
                <Text style={styles.statLabel}>Gittim</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{counts.wish}</Text>
                <Text style={styles.statLabel}>İstek</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{counts.favorite}</Text>
                <Text style={styles.statLabel}>Favori</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => <PinCard pin={item} onDelete={() => deletePin(item.id)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map" size={48} color="#475569" />
            <Text style={styles.emptyTitle}>Henüz pin bulunamadı</Text>
            <Text style={styles.emptyDesc}>Aramana uygun bir yer yok. Yeni bir gezi noktası ekleyebilirsin.</Text>
          </View>
        }
      />

      <AddPinModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAddPin={addPin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111C2F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263852',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
