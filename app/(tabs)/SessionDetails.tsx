import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, getDoc, getFirestore, deleteDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
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
  attendees?: string[];
}

interface Attendee {
  id: string;
  name: string;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const SessionDetails: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const user = getAuth().currentUser;

  const db: Firestore = getFirestore();

  // Always fetch latest session data when focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchSession() {
        try {
          const parsed = JSON.parse(params.session as string) as Session;
          const docRef = doc(db, 'sessions', parsed.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Session;
            if (!isActive) return;
            setSession({ ...parsed, ...data });
            // Check if user has joined
            if (user && data.attendees && data.attendees.includes(user.uid)) {
              setHasJoined(true);
            } else {
              setHasJoined(false);
            }
            // Check if session is full
            if (data.attendeeLimit && data.attendees && data.attendees.length >= data.attendeeLimit) {
              setIsFull(true);
            } else {
              setIsFull(false);
            }
          } else {
            setSession(parsed);
          }
        } catch (e) {
          setSession(JSON.parse(params.session as string) as Session);
        }
      }
      fetchSession();
      return () => { isActive = false; };
    }, [params.session, user])
  );

  const handleJoin = async () => {
    if (!session) return;
    setJoining(true);
    try {
      if (isFull) {
        Alert.alert('Session Full', 'This session has reached its attendee limit.');
        setJoining(false);
        return;
      }
      if (!user) {
        Alert.alert('Not signed in', 'You must be signed in to join a session.');
        setJoining(false);
        return;
      }
      const docRef = doc(db, 'sessions', session.id);
      await updateDoc(docRef, {
        attendees: arrayUnion(user.uid),
      });
      setHasJoined(true);
      setSession({ ...session, attendees: [...(session.attendees || []), user.uid] });
      Alert.alert('Joined', 'You have joined this session!');
    } catch (e) {
      Alert.alert('Error', 'Could not join session.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!session || !session.attendees) return;
    setJoining(true);
    try {
      if (!user) {
        Alert.alert('Not signed in', 'You must be signed in to leave a session.');
        setJoining(false);
        return;
      }
      const docRef = doc(db, 'sessions', session.id);
      await updateDoc(docRef, {
        attendees: session.attendees.filter(uid => uid !== user.uid),
      });
      setHasJoined(false);
      setSession({ ...session, attendees: session.attendees.filter(uid => uid !== user.uid) });
      Alert.alert('Left', 'You have left this session.');
    } catch (e) {
      Alert.alert('Error', 'Could not leave session.');
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'sessions', session.id);
              await deleteDoc(docRef);
              Alert.alert('Success', 'Session deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Placeholder data for attendees and rating
  const hostRating = 4.8;
  const sessionsHosted = 15;

  if (!session) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Session Info Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>{session.subject}{session.subjectName ? ` ${session.subjectName}` : ''}</Text>
              <Text style={styles.sessionLocation}>{session.locationName}</Text>
              <Text style={styles.sessionDateTime}>{session.date}</Text>
              <Text style={styles.sessionDateTime}>{session.time}</Text>
            </View>
          </View>
        </View>

        {/* Host Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Host</Text>
          <View style={styles.hostRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>{getInitials(session.hostName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostName}>{session.hostName || 'Anonymous'}</Text>
            </View>
          </View>
        </View>

        {/* About this session */}
        {session.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About this session</Text>
            <Text style={styles.descriptionText}>{session.description}</Text>
          </View>
        )}

        {/* Attendees */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attendees ({session.attendees ? session.attendees.length : 0}{session.attendeeLimit ? `/${session.attendeeLimit}` : ''})</Text>
          <View style={styles.attendeeRow}>
            {(session.attendees || []).map((uid, idx) => (
              <View key={uid} style={styles.avatarSmall}>
                <Text style={styles.avatarInitialsSmall}>{`U${idx + 1}`}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {user?.uid === session.createdBy && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Session</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.joinButton, (hasJoined || isFull) && { backgroundColor: '#ccc' }]}
            onPress={hasJoined ? handleLeave : handleJoin}
            disabled={joining || isFull}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : isFull ? (
              <Text style={styles.joinButtonText}>Session Full</Text>
            ) : hasJoined ? (
              <Text style={styles.joinButtonText}>Leave Session</Text>
            ) : (
              <Text style={styles.joinButtonText}>Join Session</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f4',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#18181b',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  sessionLocation: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  sessionDateTime: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 12,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181b',
  },
  hostName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 2,
  },
  viewProfileButton: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewProfileText: {
    color: '#18181b',
    fontWeight: '600',
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 15,
    color: '#18181b',
    lineHeight: 22,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  joinButton: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  secondaryButtonText: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '600',
  },
  badgeHost: {
    backgroundColor: '#2979ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'center',
  },
  badgeHostText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  badgeAttending: {
    backgroundColor: '#ececec',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'center',
  },
  badgeAttendingText: {
    color: '#18181b',
    fontWeight: '700',
    fontSize: 11,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2231b',
  },
  deleteButtonText: {
    color: '#e2231b',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SessionDetails; 