import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';
import { JournalEntry } from '../../types/travel';

export default function JournalScreen() {
  const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('Keyifli');
  const [imageUrl, setImageUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const pickImage = async (target: 'add' | 'edit' = 'add') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf seçebilmek için galeri erişimine izin vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!result.canceled) {
      const nextUri = result.assets[0]?.uri ?? '';
      if (target === 'edit') setEditImageUrl(nextUri);
      else setImageUrl(nextUri);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !body.trim()) return;
    await addJournalEntry({
      title: title.trim(),
      cityName: cityName.trim() || 'Genel',
      body: body.trim(),
      mood: mood.trim() || 'Keyifli',
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      imageUrl: imageUrl.trim() || undefined,
    });
    setTitle('');
    setCityName('');
    setBody('');
    setMood('Keyifli');
    setImageUrl('');
    setModalVisible(false);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditTitle(entry.title);
    setEditCityName(entry.cityName);
    setEditBody(entry.body);
    setEditMood(entry.mood ?? 'Keyifli');
    setEditImageUrl(entry.imageUrl ?? '');
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedEntry || !editTitle.trim() || !editBody.trim()) return;
    await updateJournalEntry(selectedEntry.id, {
      title: editTitle.trim(),
      cityName: editCityName.trim() || 'Genel',
      body: editBody.trim(),
      mood: editMood.trim() || 'Keyifli',
      imageUrl: editImageUrl.trim() || undefined,
    });
    setSelectedEntry((current) => current ? {
      ...current,
      title: editTitle.trim(),
      cityName: editCityName.trim() || 'Genel',
      body: editBody.trim(),
      mood: editMood.trim() || 'Keyifli',
      imageUrl: editImageUrl.trim() || undefined,
    } : current);
    setEditVisible(false);
  };

  const confirmDelete = () => {
    if (!selectedEntry) return;
    Alert.alert('Günlüğü sil', 'Bu günlük kaydı silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void deleteJournalEntry(selectedEntry.id);
          setSelectedEntry(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>Gezi Günlüğü</Text>
          <Text style={styles.subtitle} numberOfLines={2}>Her yerin arkasındaki hikayeyi sakla</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={21} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={journal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.entryCard} onPress={() => setSelectedEntry(item)} activeOpacity={0.84}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.entryImage} alt={`${item.title} fotoğrafı`} />}
            <View style={styles.entryBody}>
              <View style={styles.entryTop}>
                <Text style={styles.city} numberOfLines={1}>{item.cityName}</Text>
                <Text style={styles.date} numberOfLines={1}>{item.date}</Text>
              </View>
              <Text style={styles.entryTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.entryText}>{item.body}</Text>
              {!!item.mood && <Text style={styles.mood}>Ruh hali: {item.mood}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Günlük Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Başlık" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
              <TextInput style={styles.input} placeholder="Şehir / mekan" placeholderTextColor="#64748B" value={cityName} onChangeText={setCityName} />
              <TextInput style={styles.input} placeholder="Ruh hali" placeholderTextColor="#64748B" value={mood} onChangeText={setMood} />
              <TouchableOpacity style={styles.photoPickerButton} onPress={() => pickImage('add')}>
                <Ionicons name="images-outline" size={20} color="#A7F3D0" />
                <Text style={styles.photoPickerText}>{imageUrl ? 'Fotoğrafı değiştir' : 'Galeriden fotoğraf seç'}</Text>
              </TouchableOpacity>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} alt="Seçilen fotoğraf önizlemesi" /> : null}
              <TextInput style={[styles.input, styles.textArea]} placeholder="Bugünün hikayesi..." placeholderTextColor="#64748B" multiline value={body} onChangeText={setBody} />
              <TouchableOpacity style={[styles.saveButton, (!title.trim() || !body.trim()) && styles.saveButtonDisabled]} onPress={handleAdd} disabled={!title.trim() || !body.trim()}>
                <Text style={styles.saveText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(selectedEntry)} animationType="slide" transparent onRequestClose={() => setSelectedEntry(null)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.detailHeader}>
              <View style={styles.detailTitleGroup}>
                <Text style={styles.detailTitle} numberOfLines={2}>{selectedEntry?.title}</Text>
                <Text style={styles.detailCity} numberOfLines={1}>{selectedEntry?.cityName} · {selectedEntry?.date}</Text>
              </View>
              <TouchableOpacity style={styles.detailCloseButton} onPress={() => setSelectedEntry(null)}>
                <Ionicons name="close" size={23} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedEntry?.imageUrl ? <Image source={{ uri: selectedEntry.imageUrl }} style={styles.detailImage} alt={`${selectedEntry.title} büyük fotoğrafı`} /> : null}
              {!!selectedEntry?.mood && <Text style={styles.detailMood}>Ruh hali: {selectedEntry.mood}</Text>}
              <Text style={styles.detailBody}>{selectedEntry?.body}</Text>
              <View style={styles.detailActions}>
                <TouchableOpacity style={styles.detailEditButton} onPress={() => selectedEntry && openEdit(selectedEntry)}>
                  <Ionicons name="create-outline" size={18} color="#FFF" />
                  <Text style={styles.detailEditText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailDeleteButton} onPress={confirmDelete}>
                  <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                  <Text style={styles.detailDeleteText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Günlüğü Düzenle</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Başlık" placeholderTextColor="#64748B" value={editTitle} onChangeText={setEditTitle} />
              <TextInput style={styles.input} placeholder="Şehir / mekan" placeholderTextColor="#64748B" value={editCityName} onChangeText={setEditCityName} />
              <TextInput style={styles.input} placeholder="Ruh hali" placeholderTextColor="#64748B" value={editMood} onChangeText={setEditMood} />
              <TouchableOpacity style={styles.photoPickerButton} onPress={() => pickImage('edit')}>
                <Ionicons name="images-outline" size={20} color="#A7F3D0" />
                <Text style={styles.photoPickerText}>{editImageUrl ? 'Fotoğrafı değiştir' : 'Galeriden fotoğraf seç'}</Text>
              </TouchableOpacity>
              {editImageUrl ? <Image source={{ uri: editImageUrl }} style={styles.previewImage} alt="Seçilen fotoğraf önizlemesi" /> : null}
              <TextInput style={[styles.input, styles.textArea]} placeholder="Bugünün hikayesi..." placeholderTextColor="#64748B" multiline value={editBody} onChangeText={setEditBody} />
              <TouchableOpacity style={[styles.saveButton, (!editTitle.trim() || !editBody.trim()) && styles.saveButtonDisabled]} onPress={handleUpdate} disabled={!editTitle.trim() || !editBody.trim()}>
                <Text style={styles.saveText}>Güncelle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852', marginRight: 12 },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  addButton: { flexShrink: 0, width: 42, height: 42, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 28 },
  entryCard: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  entryImage: { width: '100%', height: 150 },
  entryBody: { padding: 14 },
  entryTop: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginBottom: 6 },
  city: { flex: 1, minWidth: 0, color: '#38BDF8', fontSize: 12, fontWeight: '800' },
  date: { flexShrink: 0, maxWidth: 130, color: '#64748B', fontSize: 12, textAlign: 'right' },
  entryTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  entryText: { color: '#CBD5E1', fontSize: 13, lineHeight: 19 },
  mood: { color: '#F59E0B', fontSize: 12, fontWeight: '700', marginTop: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', justifyContent: 'flex-end' },
  modal: { maxHeight: '84%', backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: '#263852' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '800' },
  input: { backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  photoPickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111C2F', borderWidth: 1, borderColor: '#263852', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 10 },
  photoPickerText: { flexShrink: 1, color: '#A7F3D0', fontSize: 13, fontWeight: '800' },
  previewImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: '#263852' },
  textArea: { height: 130, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.78)', justifyContent: 'flex-end' },
  detailSheet: { maxHeight: '86%', backgroundColor: '#0B1120', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, borderWidth: 1, borderColor: '#263852' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailTitleGroup: { flex: 1, minWidth: 0 },
  detailTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  detailCity: { color: '#38BDF8', fontSize: 12, fontWeight: '800', marginTop: 2 },
  detailCloseButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#111C2F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#263852' },
  detailImage: { width: '100%', height: 210, borderRadius: 14, marginBottom: 12, backgroundColor: '#263852' },
  detailMood: { color: '#F59E0B', fontSize: 12, fontWeight: '800', marginBottom: 8 },
  detailBody: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  detailEditButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0EA5E9', borderRadius: 12, paddingVertical: 13 },
  detailEditText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  detailDeleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.25)', backgroundColor: 'rgba(239,68,68,.08)', borderRadius: 12, paddingVertical: 13 },
  detailDeleteText: { color: '#FCA5A5', fontSize: 14, fontWeight: '900' },
});
