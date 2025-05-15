import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { SessionForm, SessionFormValues } from './components/SessionForm';

interface Session {
  id: string;
  subject: string;
  subjectName?: string;
  locationName: string;
  date: string;
  time: string;
  description?: string;
  createdBy: string;
  hostName?: string;
}

const MySessions: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editFields, setEditFields] = useState<Partial<Session>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      try {
        const sessionsCol = collection(db, 'sessions');
        const q = query(sessionsCol, where('createdBy', '==', user.uid));
        const sessionSnapshot = await getDocs(q);
        const sessionList = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
        setSessions(sessionList);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  const handleDelete = async (sessionId: string) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'sessions', sessionId));
            setSessions(sessions.filter(s => s.id !== sessionId));
          } catch (error) {
            Alert.alert('Error', 'Could not delete session.');
          }
        }
      }
    ]);
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setEditFields({ ...session });
  };

  const closeEditModal = () => {
    setEditingSession(null);
    setEditFields({});
    setEditSubmitting(false);
  };

  const handleEditField = (fields: Partial<SessionFormValues>) => {
    setEditFields(prev => ({ ...prev, ...fields }));
  };

  const handleEditSave = async () => {
    if (!editingSession) return;
    setEditSubmitting(true);
    try {
      const sessionRef = doc(db, 'sessions', editingSession.id);
      await updateDoc(sessionRef, {
        subject: editFields.subject,
        subjectName: editFields.subjectName,
        locationName: editFields.locationName,
        date: editFields.date,
        time: editFields.time,
        description: editFields.description,
      });
      setSessions(sessions.map(s => s.id === editingSession.id ? { ...s, ...editFields } as Session : s));
      closeEditModal();
    } catch (error) {
      Alert.alert('Error', 'Could not update session.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCardBox}>
      <View style={styles.sessionCardTopRow}>
        {/* Avatar and Host */}
        <View style={styles.sessionAvatarCol}>
          <View style={styles.sessionAvatar} />
        </View>
        <View style={styles.sessionHostCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.sessionHostName}>{item.hostName ?? 'You'}</Text>
            <Text style={styles.sessionHostLabel}> is hosting</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sessionLabel}>Subject code: <Text style={styles.sessionValue}>{item.subject}</Text></Text>
      <Text style={styles.sessionLabel}>Subject name: <Text style={styles.sessionValue}>{item.subjectName}</Text></Text>
      <Text style={styles.sessionLabel}>Location: <Text style={styles.sessionValue}>{item.locationName}</Text></Text>
      <Text style={styles.sessionLabel}>Date: <Text style={styles.sessionValue}>{item.date}</Text></Text>
      <Text style={styles.sessionLabel}>Time: <Text style={styles.sessionValue}>{item.time}</Text></Text>
      <View style={styles.sessionDivider} />
      <View style={styles.sessionButtonRow}>
        <TouchableOpacity style={styles.sessionButtonLeft} onPress={() => openEditModal(item)}>
          <Text style={styles.sessionButtonText}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.sessionButtonDivider} />
        <TouchableOpacity style={styles.sessionButtonRight} onPress={() => handleDelete(item.id)}>
          <Text style={styles.sessionButtonTextBold}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Sessions</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't created any sessions yet.</Text>}
        />
      )}
      {/* Edit Modal */}
      <Modal
        visible={!!editingSession}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <ScrollView contentContainerStyle={styles.editModalContainer}>
          <Text style={styles.editModalTitle}>Edit Session</Text>
          <SessionForm
            values={editFields as SessionFormValues}
            onChange={handleEditField}
            submitting={editSubmitting}
          />
          <View style={{ flexDirection: 'row', marginTop: 18, gap: 12 }}>
            <TouchableOpacity
              style={[styles.createButton, { flex: 1, backgroundColor: '#18181b' }]}
              onPress={handleEditSave}
              disabled={editSubmitting}
            >
              <Text style={styles.createButtonText}>{editSubmitting ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#18181b' }]}
              onPress={closeEditModal}
              disabled={editSubmitting}
            >
              <Text style={[styles.createButtonText, { color: '#18181b' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8fa' },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 0,
    paddingBottom: 40,
  },
  sessionCardBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    marginBottom: 24,
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  sessionCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionAvatarCol: {
    marginRight: 10,
  },
  sessionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  sessionHostCol: {
    flex: 1,
  },
  sessionHostName: {
    fontWeight: '700',
    fontSize: 20,
    color: '#18181b',
    marginRight: 4,
    letterSpacing: -0.2,
  },
  sessionHostLabel: {
    fontSize: 18,
    color: '#7c7c85',
    fontWeight: '400',
  },
  sessionLabel: {
    fontSize: 17,
    color: '#18181b',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 0,
  },
  sessionValue: {
    fontSize: 17,
    color: '#555',
    fontWeight: '500',
  },
  sessionDivider: {
    height: 1,
    backgroundColor: '#ececec',
    marginVertical: 10,
  },
  sessionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
    gap: 16,
  },
  sessionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 4,
  },
  sessionButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
  sessionButtonDivider: {
    width: 1,
    backgroundColor: '#ececec',
  },
  sessionButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e11d27',
  },
  sessionButtonTextBold: {
    color: '#e11d27',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    color: '#666',
    marginTop: 40,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: '#18181b',
    flex: 1,
    marginBottom: 16,
    marginRight: 0,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 18,
    paddingVertical: 18,
    fontWeight: '500',
    backgroundColor: '#f8f8fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  createButton: {
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#18181b',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  editModalContainer: {
    padding: 18,
    backgroundColor: '#fff',
    flexGrow: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  editModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18181b',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  editSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  row2colEdit: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 0,
  },
});

export default MySessions; 