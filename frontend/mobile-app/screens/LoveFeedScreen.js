import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { schedulerAPI } from '../api/api';
import Card from '../components/Card';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const LoveFeedScreen = () => {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const { user } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadLoveFeed();
  }, []);

  useEffect(() => {
    if (memory) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [memory]);

  const loadLoveFeed = async () => {
    setLoading(true);
    try {
      const response = await schedulerAPI.getLoveFeed();
      setMemory(response.data);
    } catch (error) {
      console.error('Error loading love feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Finding a special memory...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: '#fff' }]}>❤️ Daily Love Feed</Text>
        <Text style={[styles.subtitle, { color: '#fff' }]}>A memory from your happy moments</Text>

        {memory ? (
          <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
            <Card gradient style={styles.memoryCard}>
              <Text style={styles.heartIcon}>💖</Text>
              <Text style={[styles.memoryContent, { color: '#fff' }]}>{memory.content}</Text>
              <Text style={[styles.memorySummary, { color: '#fff' }]}>
                {memory.summary}
              </Text>
              <Text style={[styles.memoryDate, { color: '#fff' }]}>
                {new Date(memory.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Card>
          </Animated.View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No happy memories yet. Start creating beautiful moments together!
            </Text>
          </Card>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  cardContainer: {
    alignItems: 'center',
  },
  memoryCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  memoryContent: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  memorySummary: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  memoryDate: {
    ...Typography.caption,
    textAlign: 'center',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});

export default LoveFeedScreen;
