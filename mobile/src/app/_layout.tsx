import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import { AppDataProvider } from '../context/AppDataContext';

export default function RootLayout() {
  return (
    <AppDataProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="collections" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="pin/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppDataProvider>
  );
}
