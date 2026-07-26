import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function Index() {
  const { loading, user } = useAppData();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#38BDF8" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/auth'} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
});
