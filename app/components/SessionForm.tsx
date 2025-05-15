import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const LOCATIONS = [
  { label: 'Borchardt Library', value: 'Borchardt Library' },
  { label: 'Donald Whitehead Building', value: 'Donald Whitehead Building' },
  { label: 'Online Learning Zone', value: 'Online Learning Zone' },
  { label: 'The Learning Commons (TLC)', value: 'The Learning Commons (TLC)' },
  { label: 'The Agora', value: 'The Agora' },
];

export interface SessionFormValues {
  subject: string;
  subjectName: string;
  locationName: string;
  date: string;
  time: string;
  description: string;
}

interface SessionFormProps {
  values: SessionFormValues;
  onChange: (fields: Partial<SessionFormValues>) => void;
  submitting?: boolean;
}

export function SessionForm({ values, onChange, submitting }: SessionFormProps) {
  return (
    <View>
      <Text style={styles.editSectionTitle}>Subject Details</Text>
      <Text style={styles.label}>Subject Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Subject Code (e.g. CSE3MAD)"
        value={values.subject}
        onChangeText={v => onChange({ subject: v })}
        autoCapitalize="characters"
        editable={!submitting}
      />
      <Text style={styles.label}>Subject Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Subject Name"
        value={values.subjectName}
        onChangeText={v => onChange({ subjectName: v })}
        editable={!submitting}
      />

      <Text style={styles.editSectionTitle}>Location</Text>
      {LOCATIONS.map(loc => (
        <TouchableOpacity
          key={loc.value}
          style={styles.radioRow}
          activeOpacity={0.7}
          onPress={() => onChange({ locationName: loc.value })}
          accessibilityRole="radio"
          accessibilityState={{ selected: values.locationName === loc.value }}
          disabled={submitting}
        >
          <View style={[styles.radioOuter, values.locationName === loc.value && styles.radioOuterSelected]}>
            {values.locationName === loc.value ? <View style={styles.radioInner} /> : null}
          </View>
          <Text style={styles.radioLabel}>{loc.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.editSectionTitle}>Date & Time</Text>
      <View style={styles.row2colEdit}>
        <TextInput
          style={[styles.input, { marginRight: 8 }]}
          placeholder="Date (e.g. 12/12/2025)"
          value={values.date}
          onChangeText={v => onChange({ date: v })}
          editable={!submitting}
        />
        <TextInput
          style={styles.input}
          placeholder="Time (e.g. 5pm)"
          value={values.time}
          onChangeText={v => onChange({ time: v })}
          editable={!submitting}
        />
      </View>

      <Text style={styles.editSectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what you'll be studying or working on..."
        value={values.description}
        onChangeText={v => onChange({ description: v })}
        multiline
        numberOfLines={3}
        editable={!submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  editSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 2,
    borderRadius: 10,
    backgroundColor: '#f8f8fa',
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#18181b',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#18181b',
  },
  radioLabel: {
    fontSize: 17,
    color: '#18181b',
    fontWeight: '500',
  },
  row2colEdit: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
    marginTop: 8,
  },
}); 