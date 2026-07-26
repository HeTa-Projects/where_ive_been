import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';

export default function AuthScreen() {
  const { login, register, enterDemo, firebaseReady } = useAppData();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Taha Emre');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!firebaseReady) {
      setError('Firebase config değerleri girilmeden gerçek giriş/kayıt çalışmaz.');
      return;
    }
    if (!email.trim() || password.length < 6 || (isRegister && !name.trim())) {
      setError('E-posta ve en az 6 karakter şifre gerekli.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      router.replace('/(tabs)');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Giriş işlemi başarısız oldu.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = () => {
    enterDemo();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Ionicons name="earth" size={34} color="#38BDF8" />
          </View>
          <Text style={styles.title}>Where I've Been</Text>
          <Text style={styles.subtitle}>Gezdiğin yerleri, günlüklerini ve fotoğraflarını tek hesapta tut.</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{isRegister ? 'Hesap oluştur' : 'Giriş yap'}</Text>
          {!firebaseReady && (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.warningText}>Firebase bilgileri henüz girilmedi. Şimdilik demo mod açık.</Text>
            </View>
          )}

          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={busy}>
            {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>{isRegister ? 'Kayıt ol' : 'Giriş yap'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleDemo}>
            <Text style={styles.secondaryText}>Demo ile devam et</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsRegister((current) => !current)}>
            <Text style={styles.switchText}>
              {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10233F',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    marginBottom: 14,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  panel: {
    backgroundColor: '#111C2F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#263852',
    padding: 16,
  },
  panelTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    color: '#FCD34D',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#0B1120',
    borderColor: '#263852',
    borderWidth: 1,
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    marginTop: 4,
  },
  primaryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginTop: 10,
  },
  secondaryText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    paddingTop: 14,
  },
  switchText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
});
