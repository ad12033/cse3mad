import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { SessionCard } from '../components/SessionCard';

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
  attendeeCount?: number;
  attendeeLimit?: number;
  rating?: number;
}

const db: Firestore = getFirestore();

const FindSessions: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      const sessionsQuery = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(sessionsQuery);
      const sessionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setSessions(sessionsList);
      setLoading(false);
    };

    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          session.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          session.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || session.date === filter;
    return matchesSearch && matchesFilter;
  });

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      subject={item.subject + (item.subjectName ? ` ${item.subjectName}` : '')}
      location={item.locationName}
      time={`${item.date} at ${item.time}`}
      host={item.hostName || 'Anonymous'}
      description={item.description || ''}
      onPress={() => router.push({
        pathname: '/(tabs)/SessionDetails',
        params: { session: JSON.stringify(item) }
      })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Sessions</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search sessions..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filterChips}>
        <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'today' && styles.filterChipActive]} onPress={() => setFilter('today')}>
          <Text style={[styles.filterChipText, filter === 'today' && styles.filterChipTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'tomorrow' && styles.filterChipActive]} onPress={() => setFilter('tomorrow')}>
          <Text style={[styles.filterChipText, filter === 'tomorrow' && styles.filterChipTextActive]}>Tomorrow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'next' && styles.filterChipActive]} onPress={() => setFilter('next')}>
          <Text style={[styles.filterChipText, filter === 'next' && styles.filterChipTextActive]}>Next</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No study sessions found</Text>
          }
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  filterChips: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f1f1f4',
  },
  filterChipActive: {
    backgroundColor: '#18181b',
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
  },
  filterChipTextActive: {
    color: '#fff',
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
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    color: '#666',
    marginTop: 40,
    fontWeight: '500',
  },
});

export default FindSessions; 