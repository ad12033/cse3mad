import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';

const WELCOME_KEY = 'hasSeenWelcome';
const APP_OPENS_KEY = 'appOpenCount';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Auth redirect logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(auth)";
      if (!user && !inAuthGroup) {
        router.replace("/Login");
      } else if (user && inAuthGroup) {
        router.replace("/(tabs)");
      }
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, [segments]);

  // In-app messaging logic
  useEffect(() => {
    if (!userId) return;
    let didShow = false;
    async function checkWelcomeAndTips() {
      // 1. Welcome message (Firestore, cross-device)
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists() || !userSnap.data()?.hasSeenWelcome) {
        setModalMessage("Welcome to StudyGroup Finder! Start by joining or creating a session!");
        setShowModal(true);
        await setDoc(userDoc, { hasSeenWelcome: true }, { merge: true });
        didShow = true;
        return;
      }
      // 2. Tips after a few app opens (AsyncStorage, local)
      let openCount = 0;
      try {
        const countStr = await AsyncStorage.getItem(APP_OPENS_KEY);
        openCount = countStr ? parseInt(countStr, 10) : 0;
      } catch {}
      openCount += 1;
      await AsyncStorage.setItem(APP_OPENS_KEY, openCount.toString());
      if (openCount === 3) {
        setModalMessage("Don't forget to check the map for live study sessions!");
        setShowModal(true);
        didShow = true;
        return;
      }
      // 3. (Optional) Add more tips/updates here
      // Example: Feature highlight after 5 opens
      if (openCount === 5) {
        setModalMessage("New: You can now message session hosts directly!");
        setShowModal(true);
        didShow = true;
        return;
      }
    }
    checkWelcomeAndTips();
  }, [userId]);

  return (
    <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ title: "Login" }} />
      <Stack.Screen name="Signup" options={{ title: "Sign Up" }} />
      <Stack.Screen name="CampusMap" options={{ title: "Campus Map" }} />
    </Stack>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    minWidth: 280,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalText: {
    fontSize: 18,
    color: '#18181b',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
