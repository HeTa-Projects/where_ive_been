import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelRoute } from '../types/travel';

interface RouteCardProps {
  route: TravelRoute;
  onToggleStop: (routeId: string, stopId: string) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onToggleStop }) => {
  const completedStopsCount = route.stops.filter((stop) => stop.completed).length;
  const progressPercent = Math.round((completedStopsCount / route.stops.length) * 100);

  return (
    <View style={styles.card}>
      <Image source={{ uri: route.coverImage }} style={styles.coverImage} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.cityName}>{route.cityName}</Text>
          <View style={styles.tagGroup}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{route.duration}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{route.difficulty}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>{route.title}</Text>
        <Text style={styles.description}>{route.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Durak ilerlemesi ({completedStopsCount}/{route.stops.length})</Text>
            <Text style={styles.progressPercentage}>%{progressPercent}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.stopsList}>
          {route.stops.map((stop, index) => (
            <TouchableOpacity key={stop.id} style={[styles.stopRow, stop.completed && styles.stopCompleted]} onPress={() => onToggleStop(route.id, stop.id)} activeOpacity={0.7}>
              <Ionicons name={stop.completed ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={stop.completed ? '#10B981' : '#64748B'} />
              <View style={styles.stopTextContent}>
                <Text style={[styles.stopTitle, stop.completed && styles.stopTitleCompleted]}>{index + 1}. {stop.title}</Text>
                <Text style={styles.stopDesc}>{stop.description}</Text>
              </View>
              {stop.estimatedTime && <Text style={styles.stopTime}>{stop.estimatedTime}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#111C2F', borderRadius: 14, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#263852' },
  coverImage: { width: '100%', height: 150 },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cityName: { fontSize: 13, fontWeight: '800', color: '#38BDF8' },
  tagGroup: { flexDirection: 'row', gap: 6 },
  durationBadge: { backgroundColor: 'rgba(14, 165, 233, 0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durationText: { fontSize: 11, color: '#7DD3FC', fontWeight: '700' },
  difficultyBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  difficultyText: { fontSize: 11, color: '#34D399', fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  description: { fontSize: 13, color: '#94A3B8', lineHeight: 18, marginBottom: 14 },
  progressSection: { marginBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTitle: { fontSize: 12, color: '#CBD5E1', fontWeight: '700' },
  progressPercentage: { fontSize: 12, color: '#10B981', fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: '#0B1120', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  stopsList: { gap: 8 },
  stopRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1120', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  stopCompleted: { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  stopTextContent: { flex: 1, marginLeft: 10 },
  stopTitle: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  stopTitleCompleted: { textDecorationLine: 'line-through', color: '#64748B' },
  stopDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  stopTime: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
});
