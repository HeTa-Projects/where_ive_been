import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCard } from '../components/BadgeCard';
import { useAppData } from '../context/AppDataContext';

export default function BadgesScreen() {
  const { badges } = useAppData();

  const stats = useMemo(() => {
    const unlocked = badges.filter((badge) => badge.unlocked).length;
    const averageProgress = badges.length
      ? Math.round(badges.reduce((total, badge) => total + badge.progress, 0) / badges.length)
      : 0;

    return { unlocked, averageProgress };
  }, [badges]);
  const latestBadge = useMemo(() => badges.filter((badge) => badge.unlocked).at(-1), [badges]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>Rozetler</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Gezilerinle açılan başarıların</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{stats.unlocked}</Text>
            <Text style={styles.summaryLabel}>Kazanıldı</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{badges.length}</Text>
            <Text style={styles.summaryLabel}>Toplam</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>%{stats.averageProgress}</Text>
            <Text style={styles.summaryLabel}>İlerleme</Text>
          </View>
        </View>

        {latestBadge ? (
          <View style={styles.latestBadgeCard}>
            <View style={styles.latestBadgeIcon}>
              <Ionicons name="sparkles-outline" size={22} color="#F59E0B" />
            </View>
            <View style={styles.latestBadgeCopy}>
              <Text style={styles.latestBadgeTitle}>Son kazanılan rozet</Text>
              <Text style={styles.latestBadgeText}>{latestBadge.title}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tüm rozetler</Text>
          <Text style={styles.sectionSubtitle}>Pin, ülke, galeri, günlük ve topluluk ilerlemesine göre hesaplanır</Text>
        </View>

        <View style={styles.badgesList}>
          {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  iconButton: { flexShrink: 0, width: 40, height: 40, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852' },
  headerText: { flex: 1, minWidth: 0 },
  title: { color: '#F8FAFC', fontSize: 21, fontWeight: '900' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  container: { padding: 16, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryBox: { flex: 1, alignItems: 'center', backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8 },
  summaryValue: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800', marginTop: 3 },
  latestBadgeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(245,158,11,.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,.25)', borderRadius: 14, padding: 14, marginBottom: 16 },
  latestBadgeIcon: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,.14)' },
  latestBadgeCopy: { flex: 1, minWidth: 0 },
  latestBadgeTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  latestBadgeText: { color: '#FBBF24', fontSize: 12, fontWeight: '800', marginTop: 2 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 2 },
  badgesList: { marginBottom: 8 },
});
