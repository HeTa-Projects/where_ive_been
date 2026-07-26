import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function CollectionsScreen() {
  const { collections, pins, createCollection, addPinToCollection } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const pinsById = useMemo(() => new Map(pins.map((pin) => [pin.id, pin])), [pins]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createCollection(title, description);
    setTitle('');
    setDescription('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>Koleksiyonlar</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Pinlerini gezi planı, favori rota veya tema olarak grupla</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {collections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="albums-outline" size={30} color="#38BDF8" />
            <Text style={styles.emptyTitle}>Henüz koleksiyon yok</Text>
            <Text style={styles.emptyText}>Yeni bir koleksiyon oluşturup şehirlerini temalara ayırabilirsin.</Text>
          </View>
        ) : collections.map((collection) => (
          <View key={collection.id} style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <View style={styles.collectionCopy}>
              <Text style={styles.collectionTitle} numberOfLines={2}>{collection.title}</Text>
                {collection.description ? <Text style={styles.collectionDesc}>{collection.description}</Text> : null}
              </View>
              <Text style={styles.pinCount} numberOfLines={1}>{collection.pinIds.length} pin</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinRail}>
              {collection.pinIds.map((pinId) => {
                const pin = pinsById.get(pinId);
                if (!pin) return null;
                return (
                  <View key={pinId} style={styles.pinChip}>
                    <Ionicons name="location-outline" size={15} color="#A7F3D0" />
                    <Text style={styles.pinChipText} numberOfLines={1}>{pin.title}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <Text style={styles.addPinLabel}>Pin ekle</Text>
            <View style={styles.pinGrid}>
              {pins.slice(0, 8).map((pin) => (
                <TouchableOpacity key={pin.id} style={styles.smallPinButton} onPress={() => addPinToCollection(collection.id, pin.id)}>
                  <Text style={styles.smallPinText} numberOfLines={1}>{pin.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni koleksiyon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Örn: Kapadokya hafta sonu" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Kısa açıklama" placeholderTextColor="#64748B" multiline value={description} onChangeText={setDescription} />
            <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
              <Text style={styles.saveText}>Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: { flexShrink: 0, width: 40, height: 40, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 30 },
  emptyCard: { alignItems: 'center', backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 20 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 8 },
  emptyText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 5, lineHeight: 18 },
  collectionCard: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, padding: 14, marginBottom: 14 },
  collectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  collectionCopy: { flex: 1, minWidth: 0 },
  collectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  collectionDesc: { color: '#94A3B8', fontSize: 12, marginTop: 3, lineHeight: 17 },
  pinCount: { flexShrink: 0, color: '#7DD3FC', fontSize: 12, fontWeight: '900' },
  pinRail: { gap: 8, paddingVertical: 12 },
  pinChip: { flexDirection: 'row', alignItems: 'center', maxWidth: 180, gap: 5, backgroundColor: 'rgba(16,185,129,.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,.25)', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 },
  pinChipText: { flex: 1, minWidth: 0, color: '#A7F3D0', fontSize: 12, fontWeight: '800' },
  addPinLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '800', marginBottom: 7 },
  pinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallPinButton: { maxWidth: '100%', borderWidth: 1, borderColor: '#263852', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 },
  smallPinText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  textArea: { height: 86, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});
