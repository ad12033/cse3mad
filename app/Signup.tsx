import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth as rawAuthUntyped } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const rawAuth: any = rawAuthUntyped;
const auth: any = rawAuth;

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      if (!username.trim() || !email.trim() || !password.trim()) {
        Alert.alert('Missing Fields', 'Please fill in all fields.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: `@${username.replace(/^@?/, '')}` });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f6f8fc' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-add" size={40} color="#fff" />
        </View>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#a3a3a3"
              accessibilityLabel="Username"
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#a3a3a3"
              accessibilityLabel="Email"
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#a3a3a3"
              accessibilityLabel="Password"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
            accessibilityLabel="Register"
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Register'}</Text>
          </TouchableOpacity>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/Login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Login Now</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f6f8fc',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ececec',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#18181b',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default Signup; 