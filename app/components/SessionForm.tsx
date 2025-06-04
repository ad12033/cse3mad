import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Modal, ScrollView } from 'react-native';

const LOCATIONS = [
  { label: 'Agora', value: 'Agora' },
  { label: 'Borchardt Library', value: 'Borchardt Library' },
  { label: 'Donald Whitehead Building', value: 'Donald Whitehead Building' },
  { label: 'Online Learning Zone', value: 'Online Learning Zone' },
  { label: 'The Learning Commons (TLC)', value: 'The Learning Commons (TLC)' },
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
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const times = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const validateAndFormatDate = (input: string) => {
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += '/' + digits.slice(2, 4);
    if (digits.length > 4) formatted += '/' + digits.slice(4, 8);
    
    return formatted;
  };

  const validateAndFormatTime = (input: string) => {
    // Remove any non-digit and non-AM/PM characters
    const clean = input.replace(/[^0-9APM]/gi, '');
    
    // Format as HH:MM AM/PM
    let formatted = '';
    if (clean.length > 0) formatted += clean.slice(0, 2);
    if (clean.length > 2) formatted += ':' + clean.slice(2, 4);
    if (clean.length > 4) formatted += ' ' + clean.slice(4, 6).toUpperCase();
    
    return formatted;
  };

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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={values.date}
            onChangeText={(text) => {
              const formatted = validateAndFormatDate(text);
              onChange({ date: formatted });
            }}
            keyboardType="numeric"
            maxLength={10}
            editable={!submitting}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="HH:MM AM/PM"
            value={values.time}
            onChangeText={(text) => {
              const formatted = validateAndFormatTime(text);
              onChange({ time: formatted });
            }}
            maxLength={8}
            editable={!submitting}
          />
        </View>
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

export default SessionForm;

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f8f8fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#18181b',
    flex: 1,
    marginBottom: 16,
    marginRight: 0,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 16,
    paddingVertical: 18,
    fontWeight: '500',
    backgroundColor: '#f8f8fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 16,
    marginBottom: 8,
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
    marginTop: 8,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateTimeButton: {
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
  },
  modalClose: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalScroll: {
    padding: 16,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#f1f1f4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#18181b',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },
}); 