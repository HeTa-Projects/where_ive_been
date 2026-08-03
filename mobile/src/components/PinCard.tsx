import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PinItem } from '../types/travel';

interface PinCardProps {
  pin: PinItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export const PinCard: React.FC<PinCardProps> = ({ pin, onPress, onDelete }) => {
  const badgeStyle = (() => {
    if (pin.category === 'Gittim') return { bg: 'rgba(16,185,129,.15)', text: '#10B981', border: 'rgba(16,185,129,.3)' };
    if (pin.category === 'İstek') return { bg: 'rgba(59,130,246,.15)', text: '#3B82F6', border: 'rgba(59,130,246,.3)' };
    return { bg: 'rgba(239,68,68,.15)', text: '#EF4444', border: 'rgba(239,68,68,.3)' };
  })();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {pin.imageUrl ? <Image source={{ uri: pin.imageUrl }} style={styles.image} resizeMode="cover" /> : (
        <View style={styles.placeholderImage}>
          <Ionicons name="location" size={32} color="#64748B" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text style={styles.title} numberOfLines={2}>{pin.title}</Text>
            <Text style={styles.location} numberOfLines={1}>{pin.cityName}, {pin.countryName}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]} numberOfLines={1}>{pin.category}</Text>
          </View>
        </View>

        {pin.note && <Text style={styles.note} numberOfLines={2}>{pin.note}</Text>}

        {!!pin.tags?.length && (
          <View style={styles.tags}>
            {pin.tags.slice(0, 3).map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name={star <= pin.rating ? 'star' : 'star-outline'} size={14} color={star <= pin.rating ? '#F59E0B' : '#475569'} />
            ))}
            <Text style={styles.ratingText}>{pin.rating}.0</Text>
          </View>
          {pin.visitedDate && <Text style={styles.dateText} numberOfLines={1}>{pin.visitedDate}</Text>}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#111C2F', borderRadius: 14, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#263852' },
  image: { width: '100%', height: 142 },
  placeholderImage: { width: '100%', height: 96, backgroundColor: '#0B1120', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  titleArea: { flex: 1, minWidth: 0, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' },
  location: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badge: { flexShrink: 0, maxWidth: 92, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  note: { fontSize: 13, color: '#CBD5E1', lineHeight: 18, marginVertical: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { color: '#7DD3FC', backgroundColor: 'rgba(14,165,233,.12)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#263852' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 2 },
  ratingText: { fontSize: 12, color: '#F59E0B', fontWeight: '700', marginLeft: 4 },
  dateText: { flex: 1, minWidth: 0, fontSize: 11, color: '#64748B', textAlign: 'right' },
  deleteButton: { flexShrink: 0, padding: 4 },
});
