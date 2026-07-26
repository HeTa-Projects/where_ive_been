import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinCategory, PinItem } from '../types/travel';

interface AddPinModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPin: (pin: Omit<PinItem, 'id'>) => void | Promise<void>;
}

export const AddPinModal: React.FC<AddPinModalProps> = ({ visible, onClose, onAddPin }) => {
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [category, setCategory] = useState<PinCategory>('Gittim');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [journal, setJournal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visitedDate, setVisitedDate] = useState('');
  const [latitude, setLatitude] = useState('41.0082');
  const [longitude, setLongitude] = useState('28.9784');
  const [tags, setTags] = useState('');

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
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    reset();
    onClose();
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
            <Text style={styles.label}>Mekan / Yer Adı *</Text>
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

            <Text style={styles.label}>Ziyaret Tarihi</Text>
            <TextInput style={styles.input} placeholder="12 Mayıs 2026" placeholderTextColor="#64748B" value={visitedDate} onChangeText={setVisitedDate} />

            <Text style={styles.label}>Fotoğraf URL</Text>
            <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#64748B" autoCapitalize="none" value={imageUrl} onChangeText={setImageUrl} />

            <Text style={styles.label}>Etiketler</Text>
            <TextInput style={styles.input} placeholder="Tarih, Manzara, Lezzet" placeholderTextColor="#64748B" value={tags} onChangeText={setTags} />

            <Text style={styles.label}>Kısa Not</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Bu yer hakkındaki kısa notun..." placeholderTextColor="#64748B" multiline value={note} onChangeText={setNote} />

            <Text style={styles.label}>Gezi Günlüğü</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0B1120',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#263852',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#111C2F',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#263852',
  },
  textArea: {
    height: 76,
    textAlignVertical: 'top',
  },
  bigTextArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  halfLeft: {
    flex: 1,
    marginRight: 7,
  },
  halfRight: {
    flex: 1,
    marginLeft: 7,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111C2F',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#263852',
  },
  catButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#38BDF8',
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  catTextActive: {
    color: '#FFF',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 3,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
    gap: 8,
  },
  submitText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
