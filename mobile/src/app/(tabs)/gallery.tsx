import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';
import { GalleryItem } from '../../types/travel';

export default function GalleryScreen() {
  const { gallery, pendingSyncCount, addGalleryItem } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf seçebilmek için galeri erişimine izin vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0]?.uri ?? '');
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !imageUrl.trim()) return;
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>Fotoğraf Galerisi</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Anılarını cihaz galerinden seçerek ekle</Text>
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
          <TouchableOpacity style={styles.photoCard} onPress={() => setSelectedPhoto(item)} activeOpacity={0.82}>
            <Image source={{ uri: item.imageUrl }} style={styles.photo} alt={`${item.title} fotoğrafı`} />
            <View style={styles.caption}>
              <Text style={styles.photoTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cityName} numberOfLines={1}>{item.cityName}</Text>
            </View>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={20} color="#A7F3D0" />
              <Text style={styles.photoPickerText}>{imageUrl ? 'Fotoğrafı değiştir' : 'Galeriden fotoğraf seç'}</Text>
            </TouchableOpacity>
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} alt="Seçilen fotoğraf önizlemesi" /> : null}
            <TextInput style={[styles.input, styles.textArea]} placeholder="Kısa not" placeholderTextColor="#64748B" multiline value={note} onChangeText={setNote} />
            <TouchableOpacity style={[styles.saveButton, (!title.trim() || !imageUrl.trim()) && styles.saveButtonDisabled]} onPress={handleAdd} disabled={!title.trim() || !imageUrl.trim()}>
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(selectedPhoto)} animationType="slide" transparent onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.detailHeader}>
              <View style={styles.detailTitleGroup}>
                <Text style={styles.detailTitle} numberOfLines={1}>{selectedPhoto?.title}</Text>
                <Text style={styles.detailCity} numberOfLines={1}>{selectedPhoto?.cityName}</Text>
              </View>
              <TouchableOpacity style={styles.detailCloseButton} onPress={() => setSelectedPhoto(null)}>
                <Ionicons name="close" size={23} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            {selectedPhoto ? <Image source={{ uri: selectedPhoto.imageUrl }} style={styles.detailImage} alt={`${selectedPhoto.title} büyük fotoğrafı`} /> : null}
            {selectedPhoto?.note ? <Text style={styles.detailNote}>{selectedPhoto.note}</Text> : null}
            <TouchableOpacity
              style={styles.detailShareButton}
              onPress={() => selectedPhoto && void Share.share({ message: `${selectedPhoto.title} - ${selectedPhoto.cityName}\n${selectedPhoto.imageUrl}`, url: selectedPhoto.imageUrl })}
            >
              <Ionicons name="share-social-outline" size={18} color="#FBBF24" />
              <Text style={styles.detailShareText}>Paylaş</Text>
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
  backButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852', marginRight: 12 },
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
  photoPickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 10 },
  photoPickerText: { flexShrink: 1, color: '#A7F3D0', fontSize: 13, fontWeight: '800' },
  previewImage: { height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: '#263852' },
  textArea: { height: 86, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.78)', justifyContent: 'flex-end' },
  detailSheet: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, borderWidth: 1, borderColor: '#263852' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailTitleGroup: { flex: 1, minWidth: 0 },
  detailTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  detailCity: { color: '#38BDF8', fontSize: 12, fontWeight: '800', marginTop: 2 },
  detailCloseButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852' },
  detailImage: { width: '100%', height: 340, maxHeight: '62%', borderRadius: 14, backgroundColor: '#263852' },
  detailNote: { color: '#CBD5E1', fontSize: 13, lineHeight: 19, marginTop: 12 },
  detailShareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(251,191,36,.35)', backgroundColor: 'rgba(251,191,36,.08)', borderRadius: 12, paddingVertical: 13, marginTop: 14 },
  detailShareText: { color: '#FBBF24', fontSize: 14, fontWeight: '900' },
});
