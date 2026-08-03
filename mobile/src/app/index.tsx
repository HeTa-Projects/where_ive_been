import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function Index() {
  const { loading, user, profile, authMode } = useAppData();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#38BDF8" />
      </View>
    );
  }

  if (!user) return <Redirect href="/auth" />;
  if (authMode === 'firebase' && !profile.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
});
