import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { SessionForm, SessionFormValues } from '../components/SessionForm';

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
  attendees?: string[];
}

const MySessions: React.FC = () => {
  const router = useRouter();
  const [hosting, setHosting] = useState<Session[]>([]);
  const [attending, setAttending] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'hosting' | 'attending'>('hosting');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const sessionsCol = collection(db, 'sessions');
        const sessionSnapshot = await getDocs(sessionsCol);
        const allSessions = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
        setHosting(allSessions.filter(s => s.createdBy === user.uid));
        setAttending(allSessions.filter(s => s.attendees && s.attendees.includes(user.uid) && s.createdBy !== user.uid));
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  const handleLeave = async (sessionId: string) => {
    if (!user) return;
    Alert.alert('Leave Session', 'Are you sure you want to leave this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          try {
            const sessionRef = doc(db, 'sessions', sessionId);
            await updateDoc(sessionRef, {
              attendees: arrayRemove(user.uid),
            });
            setAttending(attending.filter(s => s.id !== sessionId));
          } catch (error) {
            Alert.alert('Error', 'Could not leave session.');
          }
        }
      }
    ]);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCardBox}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionTitle}>{item.subject}{item.subjectName ? ` ${item.subjectName}` : ''}</Text>
          <Text style={styles.sessionMeta}>{item.locationName}</Text>
          <Text style={styles.sessionMeta}>{item.date} at {item.time}</Text>
          <Text style={styles.sessionMeta}>Hosted by {item.hostName || 'Anonymous'}</Text>
        </View>
        {tab === 'attending' && (
          <View style={styles.attendingBadge}><Text style={styles.attendingBadgeText}>Attending</Text></View>
        )}
      </View>
      <View style={styles.sessionButtonRow}>
        <TouchableOpacity style={styles.sessionButtonLeft} onPress={() => router.push({ pathname: '/(tabs)/SessionDetails', params: { session: JSON.stringify(item) } })}>
          <Text style={styles.sessionButtonText}>View Details</Text>
        </TouchableOpacity>
        {tab === 'attending' && (
          <>
        <View style={styles.sessionButtonDivider} />
            <TouchableOpacity style={styles.sessionButtonRight} onPress={() => handleLeave(item.id)}>
              <Text style={styles.sessionButtonTextRed}>Leave Session</Text>
        </TouchableOpacity>
          </>
        )}
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
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'hosting' && styles.tabActive]} onPress={() => setTab('hosting')}>
          <Text style={[styles.tabText, tab === 'hosting' && styles.tabTextActive]}>Hosting ({hosting.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'attending' && styles.tabActive]} onPress={() => setTab('attending')}>
          <Text style={[styles.tabText, tab === 'attending' && styles.tabTextActive]}>Attending ({attending.length})</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={tab === 'hosting' ? hosting : attending}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>{tab === 'hosting' ? "You haven't created any sessions yet." : "You aren't attending any sessions yet."}</Text>}
        />
      )}
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
  },
  backButton: { marginRight: 18, borderRadius: 20, padding: 4 },
  headerTitle: { fontSize: 30, fontWeight: '700', color: '#18181b', letterSpacing: -0.5 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2979ff',
  },
  tabText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2979ff',
    fontWeight: '700',
  },
  sessionCardBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    marginBottom: 18,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionTitle: { fontSize: 17, fontWeight: '700', color: '#18181b', marginBottom: 4 },
  sessionMeta: { fontSize: 15, color: '#888', marginBottom: 2 },
  attendingBadge: {
    backgroundColor: '#ececec',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  attendingBadgeText: { color: '#18181b', fontWeight: '700', fontSize: 14 },
  sessionButtonRow: {
    flexDirection: 'row',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    paddingTop: 12,
    gap: 8,
  },
  sessionButtonLeft: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  sessionButtonRight: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  sessionButtonDivider: {
    width: 12,
  },
  sessionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sessionButtonTextRed: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    color: '#666',
    marginTop: 40,
    fontWeight: '500',
  },
});

export default MySessions; 