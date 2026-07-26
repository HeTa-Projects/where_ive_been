import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';

export default function GalleryScreen() {
  const { gallery, pendingSyncCount, addGalleryItem } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = async () => {
    if (!title.trim() || !imageUrl.trim()) return;
    if (!imageUrl.trim().startsWith('http://') && !imageUrl.trim().startsWith('https://')) {
      Alert.alert('URL gerekli', 'Spark planda Firebase Storage kapalı olduğu için fotoğraf internet URLsi olmalı.');
      return;
    }
    await addGalleryItem({
      title: title.trim(),
      cityName: cityName.trim() || 'Genel',
      imageUrl: imageUrl.trim(),
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setCityName('');
    setImageUrl('');
    setNote('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>Fotoğraf Galerisi</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Storage kapalı modda internet URLsi ile ortak galeri</Text>
          {pendingSyncCount > 0 && <Text style={styles.pendingText}>{pendingSyncCount} işlem senkron bekliyor</Text>}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={21} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={gallery}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz fotoğraf yok. İlk anını galeriden ekleyebilirsin.</Text>}
        renderItem={({ item }) => (
          <View style={styles.photoCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
            <View style={styles.caption}>
              <Text style={styles.photoTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cityName} numberOfLines={1}>{item.cityName}</Text>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fotoğraf Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Başlık" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Şehir / mekan" placeholderTextColor="#64748B" value={cityName} onChangeText={setCityName} />
            <TextInput style={styles.input} placeholder="Fotoğraf URLsi (https://...)" placeholderTextColor="#64748B" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} /> : null}
            <TextInput style={[styles.input, styles.textArea]} placeholder="Kısa not" placeholderTextColor="#64748B" multiline value={note} onChangeText={setNote} />
            <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  title: { color: '#F8FAFC', fontSize: 21, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  pendingText: { color: '#FBBF24', fontSize: 12, fontWeight: '700', marginTop: 5 },
  addButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
  grid: { padding: 16, paddingBottom: 28 },
  row: { gap: 12, alignItems: 'stretch' },
  emptyText: { color: '#94A3B8', fontSize: 13, lineHeight: 19 },
  photoCard: { flex: 1, maxWidth: '48.5%', minWidth: 0, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: '#263852' },
  caption: { padding: 10 },
  photoTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  cityName: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '800' },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  previewImage: { height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: '#263852' },
  textArea: { height: 86, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
