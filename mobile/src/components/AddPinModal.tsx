import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PinCategory, PinItem } from '../types/travel';

interface AddPinModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPin: (pin: Omit<PinItem, 'id'>) => void | Promise<void>;
  initialLocation?: { latitude: number; longitude: number } | null;
}

export const AddPinModal: React.FC<AddPinModalProps> = ({ visible, onClose, onAddPin, initialLocation }) => {
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [category, setCategory] = useState<PinCategory>('Gittim');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [journal, setJournal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visitedDate, setVisitedDate] = useState('');
  const [latitude, setLatitude] = useState(String(initialLocation?.latitude ?? 41.0082));
  const [longitude, setLongitude] = useState(String(initialLocation?.longitude ?? 28.9784));
  const [tags, setTags] = useState('');
  const [resolvingLocation, setResolvingLocation] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setLatitude(String(initialLocation?.latitude ?? 41.0082));
      setLongitude(String(initialLocation?.longitude ?? 28.9784));
    }, 0);
    return () => clearTimeout(timer);
  }, [initialLocation, visible]);

  const reset = () => {
    setTitle('');
    setCityName('');
    setCountryName('');
    setCategory('Gittim');
    setRating(5);
    setNote('');
    setJournal('');
    setImageUrl('');
    setVisitedDate('');
    setLatitude('41.0082');
    setLongitude('28.9784');
    setTags('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !cityName.trim()) return;

    await onAddPin({
      title: title.trim(),
      cityName: cityName.trim(),
      countryName: countryName.trim() || 'Türkiye',
      category,
      rating,
      note: note.trim() || undefined,
      journal: journal.trim() || undefined,
      visitedDate: visitedDate.trim() || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      latitude: Number(latitude.replace(',', '.')) || 41.0082,
      longitude: Number(longitude.replace(',', '.')) || 28.9784,
      imageUrl: imageUrl.trim() || undefined,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    });

    reset();
    onClose();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Yer fotoğrafı seçebilmek için galeri erişimine izin vermelisin.');
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

  const resolveLocation = async () => {
    const lat = Number(latitude.replace(',', '.'));
    const lon = Number(longitude.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    setResolvingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=tr`, {
        headers: { 'User-Agent': 'WhereIveBeenMobile/1.0' },
      });
      const data = await response.json();
      const address = data.address ?? {};
      setCityName(address.city || address.town || address.village || address.county || address.province || cityName);
      setCountryName(address.country || countryName || 'Türkiye');
    } catch {
      Alert.alert('Konum bulunamadı', 'Koordinattan şehir/ülke bilgisi alınamadı.');
    } finally {
      setResolvingLocation(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Yer Ekle</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Mekan / Yer adı *</Text>
            <TextInput style={styles.input} placeholder="Örn: Galata Kulesi" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />

            <View style={styles.rowInputs}>
              <View style={styles.halfLeft}>
                <Text style={styles.label}>Şehir *</Text>
                <TextInput style={styles.input} placeholder="İstanbul" placeholderTextColor="#64748B" value={cityName} onChangeText={setCityName} />
              </View>
              <View style={styles.halfRight}>
                <Text style={styles.label}>Ülke</Text>
                <TextInput style={styles.input} placeholder="Türkiye" placeholderTextColor="#64748B" value={countryName} onChangeText={setCountryName} />
              </View>
            </View>

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryRow}>
              {(['Gittim', 'İstek', 'Favori'] as PinCategory[]).map((cat) => (
                <TouchableOpacity key={cat} style={[styles.catButton, category === cat && styles.catButtonActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Puan</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={26} color={star <= rating ? '#F59E0B' : '#475569'} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfLeft}>
                <Text style={styles.label}>Enlem</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="41.0082" placeholderTextColor="#64748B" value={latitude} onChangeText={setLatitude} />
              </View>
              <View style={styles.halfRight}>
                <Text style={styles.label}>Boylam</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="28.9784" placeholderTextColor="#64748B" value={longitude} onChangeText={setLongitude} />
              </View>
            </View>
            <TouchableOpacity style={styles.resolveButton} onPress={resolveLocation} disabled={resolvingLocation}>
              <Ionicons name="navigate-outline" size={17} color="#7DD3FC" />
              <Text style={styles.resolveText}>{resolvingLocation ? 'Konum okunuyor...' : 'Koordinattan şehir/ülke bul'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Ziyaret tarihi</Text>
            <TextInput style={styles.input} placeholder="12 Mayıs 2026" placeholderTextColor="#64748B" value={visitedDate} onChangeText={setVisitedDate} />
            <Text style={styles.label}>Fotoğraf</Text>
            <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={19} color="#A7F3D0" />
              <Text style={styles.photoPickerText}>{imageUrl ? 'Fotoğrafı değiştir' : 'Galeriden fotoğraf seç'}</Text>
            </TouchableOpacity>
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} alt="Seçilen yer fotoğrafı" /> : null}
            <Text style={styles.label}>Etiketler</Text>
            <TextInput style={styles.input} placeholder="Tarih, Manzara, Lezzet" placeholderTextColor="#64748B" value={tags} onChangeText={setTags} />
            <Text style={styles.label}>Kısa not</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Bu yer hakkındaki kısa notun..." placeholderTextColor="#64748B" multiline value={note} onChangeText={setNote} />
            <Text style={styles.label}>Gezi günlüğü</Text>
            <TextInput style={[styles.input, styles.bigTextArea]} placeholder="O gün ne oldu, ne hissettin, tekrar gider misin?" placeholderTextColor="#64748B" multiline value={journal} onChangeText={setJournal} />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.submitText}>Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, maxHeight: '90%', borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#F8FAFC' },
  closeButton: { padding: 4 },
  formContent: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#111C2F', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, color: '#F8FAFC', fontSize: 14, borderWidth: 1, borderColor: '#263852' },
  textArea: { height: 76, textAlignVertical: 'top' },
  bigTextArea: { height: 110, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  halfLeft: { flex: 1, minWidth: 126 },
  halfRight: { flex: 1, minWidth: 126 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catButton: { flexGrow: 1, minWidth: 82, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111C2F', alignItems: 'center', borderWidth: 1, borderColor: '#263852' },
  catButtonActive: { backgroundColor: '#0EA5E9', borderColor: '#38BDF8' },
  catText: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  catTextActive: { color: '#FFF' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starButton: { padding: 3 },
  resolveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#263852', borderRadius: 11, paddingVertical: 10, marginTop: 10 },
  resolveText: { color: '#7DD3FC', fontSize: 13, fontWeight: '800' },
  photoPickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12 },
  photoPickerText: { flexShrink: 1, color: '#A7F3D0', fontSize: 13, fontWeight: '800' },
  previewImage: { width: '100%', height: 150, borderRadius: 12, marginTop: 10, backgroundColor: '#263852' },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, marginTop: 18, gap: 8 },
  submitText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
