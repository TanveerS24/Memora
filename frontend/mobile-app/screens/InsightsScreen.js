import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { insightAPI } from '../api/api';
import Card from '../components/Card';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const InsightsScreen = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await insightAPI.getDashboard();
      setInsights(response.data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderEmotionBar = (emotion, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View key={emotion} style={styles.emotionRow}>
        <Text style={[styles.emotionLabel, { color: theme.text, width: 80 }]}>{emotion}</Text>
        <View style={[styles.emotionBarBackground, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.emotionBarFill,
              { backgroundColor: theme.primary, width: `${percentage}%` }
            ]}
          />
        </View>
        <Text style={[styles.emotionPercentage, { color: theme.text }]}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Relationship Insights</Text>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Communication Trends</Text>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Total Messages</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {insights?.communication_trends?.total_messages || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Avg per Day</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {insights?.communication_trends?.average_per_day || 0}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Emotion Distribution</Text>
          {insights?.emotion_trends?.emotions ? (
            <View style={styles.emotionSection}>
              {Object.entries(insights.emotion_trends.emotions).map(([emotion, count]) =>
                renderEmotionBar(emotion, count, insights.communication_trends.total_messages)
              )}
            </View>
          ) : (
            <Text style={[styles.noData, { color: theme.textLight }]}>No emotion data yet</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Activity Frequency</Text>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Total Memories</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {insights?.activity_frequency?.total_memories || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Most Active Month</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {insights?.activity_frequency?.most_active_month || 'N/A'}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Peak Happy Days</Text>
          {insights?.peak_happy_days && insights.peak_happy_days.length > 0 ? (
            <View style={styles.happyDays}>
              {insights.peak_happy_days.map((date, index) => (
                <Text key={index} style={[styles.happyDay, { color: theme.text }]}>
                  {new Date(date).toLocaleDateString()}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.noData, { color: theme.textLight }]}>No data yet</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    ...Typography.body,
  },
  statValue: {
    ...Typography.body,
    fontWeight: 'bold',
  },
  emotionSection: {
    gap: Spacing.sm,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emotionLabel: {
    ...Typography.caption,
  },
  emotionBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  emotionBarFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  emotionPercentage: {
    ...Typography.caption,
    width: 50,
    textAlign: 'right',
  },
  happyDays: {
    gap: Spacing.sm,
  },
  happyDay: {
    ...Typography.caption,
  },
  noData: {
    ...Typography.caption,
    fontStyle: 'italic',
  },
});

export default InsightsScreen;
