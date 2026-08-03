import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0B1120',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 92 : 72,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
          paddingTop: 9,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          includeFontPadding: false,
        },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarItemStyle: { borderRadius: 14, marginHorizontal: 6, minWidth: 74 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Harita', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Topluluk', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="gallery" options={{ href: null }} />
      <Tabs.Screen name="routes" options={{ href: null }} />
    </Tabs>
  );
}
