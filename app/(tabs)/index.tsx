import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebase';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';

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

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return; // Don't fetch if user is not authenticated
      setSessionsLoading(true);
      try {
        // Fetch all active sessions
        const sessionsCol = collection(db, 'sessions');
        const sessionsQuery = query(sessionsCol, orderBy('createdAt', 'desc'), limit(3));
        const sessionSnapshot = await getDocs(sessionsQuery);
        const sessionList = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
        setSessions(sessionList);

        // Fetch user's sessions if user is logged in
        const userSessionsQuery = query(sessionsCol, where('createdBy', '==', user.uid));
        const userSessionSnapshot = await getDocs(userSessionsQuery);
        const userSessionList = userSessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
        setUserSessions(userSessionList);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/Login');
    }
  }, [loading, user, router]);

  if (loading || (!user && !loading)) {
    // Show a loading spinner while checking auth or redirecting
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only render the home page if the user is signed in
  return (
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.title}>Study Group Finder</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/Profile')}>
            <View style={styles.avatarCircle} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/CampusMap')}>
            <Ionicons name="location-outline" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Campus Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(tabs)/CreateSession')}>
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Create Session</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(tabs)/FindSessions')}>
            <Ionicons name="search" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Find Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(tabs)/MySessions')}>
            <MaterialIcons name="groups" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>My Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Sessions</Text>
          <Text style={styles.statValue}>{sessions.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Your Sessions</Text>
          <Text style={styles.statValue}>{userSessions.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#888',
    marginBottom: 2,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 0,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f1f4',
  },
  gridContainer: {
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 16,
    marginHorizontal: 8,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 18,
    marginHorizontal: 12,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181b',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181b',
    marginLeft: 24,
    marginBottom: 10,
    marginTop: 8,
  },
  snippetContainer: {
    marginHorizontal: 12,
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  snippetCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  snippetSubject: {
    fontWeight: '700',
    fontSize: 17,
    color: '#18181b',
    marginBottom: 2,
  },
  snippetName: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
    fontWeight: '500',
  },
  snippetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  snippetInfo: {
    fontSize: 15,
    color: '#555',
  },
  snippetButtonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  snippetViewButton: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  snippetViewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  snippetJoinButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#18181b',
    paddingVertical: 12,
    alignItems: 'center',
  },
  snippetJoinButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 15,
  },
  snippetAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  snippetAllButtonText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 15,
  },
  snippetEmpty: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 18,
  },
  // --- Session Card Redesign ---
  sessionCardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ececf0',
    marginBottom: 18,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  sessionCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    paddingBottom: 10,
  },
  sessionAvatarCol: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f1f4',
    marginTop: 2,
  },
  sessionHostCol: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionHostName: {
    fontWeight: '700',
    fontSize: 17,
    color: '#18181b',
    marginRight: 4,
  },
  sessionHostLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  sessionSubjectCode: {
    fontWeight: '700',
    fontSize: 16,
    color: '#18181b',
  },
  sessionSubjectName: {
    fontSize: 16,
    color: '#18181b',
    fontWeight: '400',
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sessionInfo: {
    fontSize: 15,
    color: '#555',
  },
  sessionInfoLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionAttendeeCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 48,
  },
  sessionAttendeePill: {
    backgroundColor: '#f6f6f8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  sessionAttendeePillText: {
    fontWeight: '700',
    color: '#18181b',
    fontSize: 15,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: '#ececf0',
    marginHorizontal: 0,
  },
  sessionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  sessionButtonLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionButtonRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionButtonText: {
    color: '#18181b',
    fontWeight: '500',
    fontSize: 16,
  },
  sessionButtonTextBold: {
    color: '#18181b',
    fontWeight: '700',
    fontSize: 16,
  },
  sessionButtonDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#ececf0',
  },
});
