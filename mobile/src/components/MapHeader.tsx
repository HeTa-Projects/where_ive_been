import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinCategory } from '../types/travel';

interface MapHeaderProps {
  selectedCategory: 'Tümü' | PinCategory;
  onSelectCategory: (cat: 'Tümü' | PinCategory) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onOpenAddModal: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) => {
  const categories: Array<'Tümü' | PinCategory> = ['Tümü', 'Gittim', 'İstek', 'Favori'];

  const getBadgeColor = (cat: 'Tümü' | PinCategory) => {
    if (cat === 'Gittim') return '#10B981';
    if (cat === 'İstek') return '#3B82F6';
    if (cat === 'Favori') return '#EF4444';
    return '#0EA5E9';
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Where I've Been</Text>
          <Text style={styles.subtitle}>Gezdiğin, sevdiğin ve hedeflediğin yerler</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onOpenAddModal} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şehir, mekan veya ülke ara..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabRow}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const activeColor = getBadgeColor(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isSelected ? { backgroundColor: activeColor } : styles.chipInactive]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111C2F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#263852',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
  },
  chipInactive: {
    backgroundColor: '#111C2F',
    borderWidth: 1,
    borderColor: '#263852',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFF',
  },
  chipTextInactive: {
    color: '#94A3B8',
  },
});
