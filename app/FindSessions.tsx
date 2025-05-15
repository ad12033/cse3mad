import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

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
}

const FindSessions: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsCol = collection(db, 'sessions');
        const sessionsQuery = query(sessionsCol, orderBy('createdAt', 'desc'));
        const sessionSnapshot = await getDocs(sessionsQuery);
        const sessionList = sessionSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        }) as Session[];
        setSessions(sessionList);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCardBox}>
      <View style={styles.sessionCardTopRow}>
        {/* Avatar and Host */}
        <View style={styles.sessionAvatarCol}>
          <View style={styles.sessionAvatar} />
        </View>
        <View style={styles.sessionHostCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.sessionHostName}>{item.hostName || 'Alex K.'}</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Sessions</Text>
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