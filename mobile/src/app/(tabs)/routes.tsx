import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { RouteCard } from '../../components/RouteCard';
import { useAppData } from '../../context/AppDataContext';
import { TravelRoute } from '../../types/travel';

const DESTINATION_HINTS = [
  { city: 'Prag', country: 'Çekya', reason: 'Tarih ve yürüyüş pinlerini seviyorsan iyi bir eşleşme.' },
  { city: 'Roma', country: 'İtalya', reason: 'Mimari, müze ve lezzet rotaları güçlü.' },
  { city: 'Kapadokya', country: 'Türkiye', reason: 'Fotoğraf ve doğa odaklı geziler için ideal.' },
  { city: 'Amsterdam', country: 'Hollanda', reason: 'Kanal yürüyüşleri ve kısa rota planları için iyi.' },
];

export default function RoutesScreen() {
  const { routes: initialRoutes, pins } = useAppData();
  const [routes, setRoutes] = useState<TravelRoute[]>(initialRoutes);

  const recommendations = useMemo(() => {
    const visitedCities = new Set(pins.map((pin) => pin.cityName.toLocaleLowerCase('tr-TR')));
    const tags = pins.flatMap((pin) => pin.tags ?? []).join(' ').toLocaleLowerCase('tr-TR');
    return DESTINATION_HINTS
      .filter((item) => !visitedCities.has(item.city.toLocaleLowerCase('tr-TR')))
      .map((item) => ({
        ...item,
        reason: tags.includes('tarih') && item.city === 'Prag' ? 'Tarih etiketlerine göre öne çıktı.' : item.reason,
      }))
      .slice(0, 3);
  }, [pins]);

  const handleToggleStop = (routeId: string, stopId: string) => {
    setRoutes((current) =>
      current.map((route) => {
        if (route.id !== routeId) return route;
        return { ...route, stops: route.stops.map((stop) => (stop.id === stopId ? { ...stop, completed: !stop.completed } : stop)) };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>Rota Planları</Text>
        <Text style={styles.subtitle} numberOfLines={2}>Şehir rehberleri, durak takibi ve kişisel keşif önerileri</Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.recommendBox}>
            <Text style={styles.recommendTitle}>Sana önerilenler</Text>
            {recommendations.map((item) => (
              <View key={item.city} style={styles.recommendItem}>
                <Text style={styles.recommendCity} numberOfLines={1}>{item.city}, {item.country}</Text>
                <Text style={styles.recommendReason}>{item.reason}</Text>
              </View>
            ))}
          </View>
        }
        renderItem={({ item }) => <RouteCard route={item} onToggleStop={handleToggleStop} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: '#0B1120', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  title: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  listContent: { padding: 16, paddingBottom: 28 },
  recommendBox: { backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852', padding: 14, marginBottom: 14 },
  recommendTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  recommendItem: { borderTopWidth: 1, borderTopColor: '#263852', paddingTop: 10, marginTop: 10 },
  recommendCity: { color: '#7DD3FC', fontSize: 14, fontWeight: '900' },
  recommendReason: { color: '#CBD5E1', fontSize: 12, lineHeight: 17, marginTop: 3 },
});
