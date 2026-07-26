import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';

export default function JournalScreen() {
  const { journal, addJournalEntry } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('Keyifli');
  const [imageUrl, setImageUrl] = useState('');

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.header}>
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
          <View style={styles.entryCard}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.entryImage} />}
            <View style={styles.entryBody}>
              <View style={styles.entryTop}>
                <Text style={styles.city} numberOfLines={1}>{item.cityName}</Text>
                <Text style={styles.date} numberOfLines={1}>{item.date}</Text>
              </View>
              <Text style={styles.entryTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.entryText}>{item.body}</Text>
              {!!item.mood && <Text style={styles.mood}>Ruh hali: {item.mood}</Text>}
            </View>
          </View>
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
              <TextInput style={styles.input} placeholder="Fotoğraf URL" placeholderTextColor="#64748B" value={imageUrl} onChangeText={setImageUrl} />
              <TextInput style={[styles.input, styles.textArea]} placeholder="Bugünün hikayesi..." placeholderTextColor="#64748B" multiline value={body} onChangeText={setBody} />
              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Kaydet</Text>
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
  textArea: { height: 130, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
