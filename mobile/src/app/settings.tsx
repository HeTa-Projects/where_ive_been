import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function SettingsScreen() {
  const { profile, notifications, registerPushToken, updateSettings, markNotificationRead, exportUserData, requestAccountDeletion } = useAppData();
  const settings = profile.settings ?? { darkMode: true, communityNotifications: true, syncOnWifiOnly: false, language: 'tr' as const };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>Ayarlar</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Bildirimler, senkron ve hesap tercihleri</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SettingRow
          icon="notifications-outline"
          title="Topluluk bildirimleri"
          description="Paylaşımına beğeni veya yorum gelince bildirim kaydı oluştur."
          value={settings.communityNotifications}
          onValueChange={(value) => void updateSettings({ communityNotifications: value })}
        />
        <SettingRow
          icon="cloud-outline"
          title="Sadece Wi-Fi ile senkron"
          description="Büyük fotoğraf yüklemeleri için hazırlık ayarı."
          value={settings.syncOnWifiOnly}
          onValueChange={(value) => void updateSettings({ syncOnWifiOnly: value })}
        />
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => void registerPushToken().then(() => Alert.alert('Bildirimler hazır', 'Bu cihaz bildirim almak için kaydedildi.'))}>
          <Ionicons name="phone-portrait-outline" size={20} color="#7DD3FC" />
          <Text style={styles.actionText}>Bu cihazda push bildirimi aç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void exportUserData().then(() => Alert.alert('Dışa aktarıldı', 'Gezi arşivin paylaşım dosyası olarak hazırlandı.'))}>
          <Ionicons name="download-outline" size={20} color="#A7F3D0" />
          <Text style={styles.actionText}>Gezi verilerimi dışa aktar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => Alert.alert('Hesap silme talebi', 'Public profilin gizlenecek ve admin panelde silme talebin görünecek.', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Talep oluştur', style: 'destructive', onPress: () => void requestAccountDeletion() },
          ])}
        >
          <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
          <Text style={[styles.actionText, styles.dangerText]}>Hesap silme talebi oluştur</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <Text style={styles.sectionSubtitle}>{notifications.filter((item) => !item.read).length} okunmamış</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notifications}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz bildirimin yok.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notification, !item.read && styles.notificationUnread]} onPress={() => void markNotificationRead(item.id)}>
            <Ionicons name={item.type === 'like' ? 'heart-outline' : item.type === 'comment' ? 'chatbubble-outline' : 'sparkles-outline'} size={21} color="#7DD3FC" />
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.notificationDate}>{item.createdAt}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function SettingRow({ icon, title, description, value, onValueChange }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Ionicons name={icon} size={22} color="#7DD3FC" />
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? '#38BDF8' : '#64748B'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852' },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  section: { margin: 16, backgroundColor: '#111C2F', borderRadius: 14, borderWidth: 1, borderColor: '#263852' },
  actionSection: { marginHorizontal: 16, marginBottom: 16, gap: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 14 },
  actionText: { flex: 1, minWidth: 0, color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  dangerButton: { borderColor: 'rgba(239,68,68,.25)', backgroundColor: 'rgba(239,68,68,.08)' },
  dangerText: { color: '#FCA5A5' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  settingDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4 },
  sectionTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  notifications: { padding: 16, paddingBottom: 28 },
  emptyText: { color: '#94A3B8', fontSize: 13 },
  notification: { flexDirection: 'row', gap: 12, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 14, marginBottom: 10 },
  notificationUnread: { borderColor: '#0EA5E9', backgroundColor: '#10233A' },
  notificationCopy: { flex: 1 },
  notificationTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  notificationBody: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginTop: 3 },
  notificationDate: { color: '#64748B', fontSize: 11, marginTop: 6 },
});
