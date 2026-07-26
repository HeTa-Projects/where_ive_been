import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeItem } from '../types/travel';

interface BadgeCardProps {
  badge: BadgeItem;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  return (
    <View style={[styles.card, badge.unlocked ? styles.cardUnlocked : styles.cardLocked]}>
      <View style={[styles.iconContainer, badge.unlocked ? styles.iconUnlocked : styles.iconLocked]}>
        <Ionicons name={badge.unlocked ? 'trophy' : 'lock-closed'} size={24} color={badge.unlocked ? '#F59E0B' : '#64748B'} />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{badge.title}</Text>
          {badge.unlocked && <Text style={styles.unlockedTag}>Kazanıldı</Text>}
        </View>
        <Text style={styles.description}>{badge.description}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${badge.progress}%` }, badge.unlocked ? styles.progressUnlocked : styles.progressLocked]} />
        </View>
        <Text style={styles.progressText}>%{badge.progress} ilerleme</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1 },
  cardUnlocked: { backgroundColor: '#111C2F', borderColor: '#263852' },
  cardLocked: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderColor: '#1E293B' },
  iconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconUnlocked: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  iconLocked: { backgroundColor: '#0B1120' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  unlockedTag: { fontSize: 11, color: '#F59E0B', fontWeight: '800' },
  description: { fontSize: 12, color: '#94A3B8', marginTop: 2, marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: '#0B1120', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  progressUnlocked: { backgroundColor: '#10B981' },
  progressLocked: { backgroundColor: '#0EA5E9' },
  progressText: { fontSize: 10, color: '#64748B', marginTop: 4, textAlign: 'right' },
});
