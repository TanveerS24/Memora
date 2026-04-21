import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { memoryAPI } from '../api/api';
import Card from '../components/Card';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const TimelineScreen = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const response = await memoryAPI.getTimeline();
      setTimeline(response.data.timeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMemory = ({ item }) => (
    <Card style={styles.memoryCard}>
      <Text style={[styles.memoryType, { color: theme.primary }]}>{item.memory_type}</Text>
      <Text style={[styles.memorySummary, { color: theme.text }]}>{item.summary}</Text>
      <View style={styles.memoryMeta}>
        <Text style={[styles.emotionTag, { color: theme.accent }]}>#{item.emotion_tag}</Text>
        <Text style={[styles.memoryDate, { color: theme.textLight }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  const renderMonth = ({ item }) => (
    <View style={styles.monthSection}>
      <Text style={[styles.monthTitle, { color: theme.text }]}>
        {item.month} {item.year}
      </Text>
      <FlatList
        data={item.memories}
        renderItem={renderMemory}
        keyExtractor={(memory) => memory.memory_id}
        scrollEnabled={false}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Your Timeline</Text>
      </View>
      
      {timeline.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textLight }]}>
            No memories yet. Start adding your special moments!
          </Text>
        </View>
      ) : (
        <FlatList
          data={timeline}
          renderItem={renderMonth}
          keyExtractor={(month) => `${month.year}-${month.month}`}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
  },
  listContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  monthSection: {
    marginBottom: Spacing.xl,
  },
  monthTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    fontWeight: 'bold',
  },
  memoryCard: {
    marginBottom: Spacing.md,
  },
  memoryType: {
    ...Typography.small,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  memorySummary: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  memoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emotionTag: {
    ...Typography.small,
    fontWeight: '600',
  },
  memoryDate: {
    ...Typography.small,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});

export default TimelineScreen;
