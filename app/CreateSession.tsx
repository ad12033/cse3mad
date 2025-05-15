import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { SessionForm, SessionFormValues } from './components/SessionForm';

const INITIAL_FORM: SessionFormValues = {
  subject: '',
  subjectName: '',
  locationName: '',
  date: '',
  time: '',
  description: '',
};

const CreateSession: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<SessionFormValues>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (fields: Partial<SessionFormValues>) => {
    setForm(prev => ({ ...prev, ...fields }));
  };

  const handleCreateSession = async () => {
    if (!form.subject || !form.subjectName || !form.locationName || !form.date.trim() || !form.time.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const hostName = user?.displayName || user?.email || 'Anonymous';
      const createdBy = user?.uid || 'anonymous';
      await addDoc(collection(db, 'sessions'), {
        subject: form.subject,
        subjectName: form.subjectName,
        locationName: form.locationName,
        date: form.date,
        time: form.time,
        description: form.description,
        hostName,
        createdBy,
        createdAt: Timestamp.now(),
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Error creating session. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Study Session</Text>
      </View>
      <View style={styles.sectionFirst}>
        <SessionForm values={form} onChange={handleFormChange} submitting={submitting} />
      </View>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateSession} disabled={submitting}>
        <Text style={styles.createButtonText}>{submitting ? 'Creating...' : 'Create Study Session'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 18,
    borderRadius: 20,
    padding: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: -0.5,
  },
  sectionFirst: {
    paddingTop: 32,
    paddingHorizontal: 18,
  },
  createButton: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    marginHorizontal: 18,
    marginTop: 18,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.2,
  },
});

export default CreateSession; 