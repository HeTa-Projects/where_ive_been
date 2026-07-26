import React, { useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { RouteCard } from '../../components/RouteCard';
import { useAppData } from '../../context/AppDataContext';
import { TravelRoute } from '../../types/travel';

export default function RoutesScreen() {
  const { routes: initialRoutes } = useAppData();
  const [routes, setRoutes] = useState<TravelRoute[]>(initialRoutes);

  const handleToggleStop = (routeId: string, stopId: string) => {
    setRoutes((current) =>
      current.map((route) => {
        if (route.id !== routeId) return route;
        return {
          ...route,
          stops: route.stops.map((stop) => (stop.id === stopId ? { ...stop, completed: !stop.completed } : stop)),
        };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <Text style={styles.title}>Rota Planları</Text>
        <Text style={styles.subtitle}>Şehir rehberleri ve adım adım durak takibi</Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
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
  listContent: { padding: 16 },
});
