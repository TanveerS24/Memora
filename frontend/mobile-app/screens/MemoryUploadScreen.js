import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { memoryAPI, mediaAPI } from '../api/api';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const MemoryUploadScreen = () => {
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState('text');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { user } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
      setPreview(result.assets[0].uri);
      setMediaType('image');
    }
  };

  const handleIngest = async () => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert('Error', 'Please add content or media');
      return;
    }

    setLoading(true);
    try {
      let mediaUrls = [];
      
      if (selectedMedia) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', {
          uri: selectedMedia.uri,
          type: selectedMedia.type || 'image/jpeg',
          name: selectedMedia.fileName || 'upload.jpg',
        });
        
        const mediaResponse = await mediaAPI.upload(formData);
        mediaUrls.push(mediaResponse.data.file_url);
        setUploading(false);
      }

      const response = await memoryAPI.ingest({
        memory_type: mediaType,
        content: content || 'Media memory',
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      });

      setPreview({
        memory_id: response.data.memory_id,
        summary: response.data.summary,
        emotion_tag: response.data.emotion_tag,
        chunks: response.data.chunks,
      });
    } catch (error) {
      Alert.alert('Ingest Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      await memoryAPI.confirm(preview.memory_id);
      Alert.alert('Success', 'Memory saved!', [
        { text: 'OK', onPress: () => {
          setContent('');
          setSelectedMedia(null);
          setPreview(null);
        }}
      ]);
    } catch (error) {
      Alert.alert('Confirm Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setSelectedMedia(null);
    setPreview(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Add Memory</Text>

        <Card style={styles.card}>
          <TouchableOpacity
            style={[styles.mediaButton, { backgroundColor: theme.background }]}
            onPress={handlePickImage}
          >
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              {selectedMedia ? 'Change Media' : 'Add Photo/Video'}
            </Text>
          </TouchableOpacity>

          {preview && (
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Preview</Text>
              <View style={[styles.previewCard, { backgroundColor: theme.background }]}>
                <Text style={[styles.previewText, { color: theme.text }]}>
                  Summary: {preview.summary}
                </Text>
                <Text style={[styles.previewText, { color: theme.text }]}>
                  Emotion: {preview.emotion_tag}
                </Text>
                <Text style={[styles.previewText, { color: theme.text }]}>
                  Chunks: {preview.chunks.length}
                </Text>
              </View>

              <View style={styles.previewActions}>
                <GradientButton
                  title="Confirm & Save"
                  onPress={handleConfirm}
                  loading={loading}
                  style={styles.confirmButton}
                />
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.error }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!preview && (
            <>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Write your memory..."
                placeholderTextColor={theme.textLight}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
              />

              <GradientButton
                title="Preview"
                onPress={handleIngest}
                loading={loading || uploading}
                style={styles.previewButton}
              />
            </>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  mediaButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mediaButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: Spacing.md,
  },
  previewButton: {
    marginTop: Spacing.sm,
  },
  previewSection: {
    marginTop: Spacing.md,
  },
  previewLabel: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  previewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  previewText: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  previewActions: {
    gap: Spacing.md,
  },
  confirmButton: {
    width: '100%',
  },
  cancelButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MemoryUploadScreen;
