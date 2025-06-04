import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionCardProps {
  subject: string;
  location: string;
  time: string;
  host: string;
  description: string;
  onPress: () => void;
}

export function SessionCard({
  subject,
  location,
  time,
  host,
  description,
  onPress,
}: SessionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessible accessibilityLabel={`Session: ${subject}`}>
      <View style={styles.headerRow}>
        <Text style={styles.subject}>{subject}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={16} color="#888" />
        <Text style={styles.metaText}>{location}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="person-outline" size={16} color="#888" />
        <Text style={styles.metaText}>Hosted by {host}</Text>
      </View>
      <Text style={styles.dateText}>{time}</Text>
      <Text style={styles.descriptionSubheading}>Description</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subject: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
    marginLeft: 20,
  },
  descriptionSubheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#18181b',
    marginVertical: 8,
  },
});

export default SessionCard; 