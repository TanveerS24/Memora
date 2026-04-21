import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const SharedNotesScreen = () => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { user, partner } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = () => {
    // In a real implementation, this would fetch from an API
    setNote('Start writing your shared notes here...');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Note saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>📝 Shared Notes</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          Write together with {partner?.name || 'your partner'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.noteContainer, { backgroundColor: theme.card }]}>
          <TextInput
            style={[styles.noteInput, { color: theme.text }]}
            placeholder="Start writing..."
            placeholderTextColor={theme.textLight}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Note'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Features</Text>
          <Text style={[styles.infoText, { color: theme.textLight }]}>
            • Real-time collaboration
          </Text>
          <Text style={[styles.infoText, { color: theme.textLight }]}>
            • Auto-save
          </Text>
          <Text style={[styles.infoText, { color: theme.textLight }]}>
            • Version history
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  noteContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 300,
    marginBottom: Spacing.lg,
  },
  noteInput: {
    ...Typography.body,
    flex: 1,
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  saveButtonText: {
    ...Typography.h4,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  infoTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    fontWeight: 'bold',
  },
  infoText: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
});

export default SharedNotesScreen;
