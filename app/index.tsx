import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Group Finder</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/Profile')}>
            <Ionicons name="person-circle-outline" size={32} color="#18181b" />
          </TouchableOpacity>
        </View>
      </View>
      {/* 2x2 Grid of Buttons */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/CampusMap')}>
            <Ionicons name="location-outline" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Campus Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/CreateSession')}>
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Create Session</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/FindSessions')}>
            <Ionicons name="search" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>Find Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/MySessions')}>
            <MaterialIcons name="groups" size={32} color="#fff" />
            <Text style={styles.gridButtonText}>My Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#18181b',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  gridContainer: {
    marginTop: 8,
    paddingHorizontal: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridButton: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingVertical: 32,
    minWidth: 140,
    elevation: 2,
  },
  gridButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
});
