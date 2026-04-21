import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { memoryAPI } from '../api/api';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const TimeCapsuleScreen = ({ route }) => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(null);
  
  const { user } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadCapsules();
  }, []);

  const loadCapsules = async () => {
    setLoading(true);
    try {
      const response = await memoryAPI.getTimeCapsules();
      setCapsules(response.data);
    } catch (error) {
      console.error('Error loading capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (capsuleId) => {
    setUnlocking(capsuleId);
    try {
      const response = await memoryAPI.getTimeCapsule(capsuleId);
      Alert.alert('🎉 Time Capsule Unlocked!', response.data.content);
      loadCapsules();
    } catch (error) {
      Alert.alert('Unlock Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setUnlocking(null);
    }
  };

  const getDaysUntilUnlock = (unlockDate) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderCapsule = (capsule) => {
    const daysUntil = getDaysUntilUnlock(capsule.unlock_date);
    const isUnlocked = capsule.is_unlocked || daysUntil <= 0;

    return (
      <Card key={capsule.capsule_id} style={styles.capsuleCard}>
        <View style={styles.capsuleHeader}>
          <Text style={[styles.capsuleTitle, { color: theme.text }]}>
            {isUnlocked ? '🎉 Unlocked' : '🔒 Locked'}
          </Text>
          <Text style={[styles.capsuleDate, { color: theme.textLight }]}>
            Unlock: {new Date(capsule.unlock_date).toLocaleDateString()}
          </Text>
        </View>

        {!isUnlocked ? (
          <View style={styles.countdownSection}>
            <LinearGradient
              colors={theme.gradient}
              style={styles.countdownBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.countdownText}>{daysUntil} days</Text>
            </LinearGradient>
            <Text style={[styles.countdownLabel, { color: theme.textLight }]}>
              until unlock
            </Text>
          </View>
        ) : (
          <View style={styles.unlockedSection}>
            <Text style={[styles.unlockedText, { color: theme.success }]}>
              Ready to reveal!
            </Text>
            <GradientButton
              title="Open Capsule"
              onPress={() => handleUnlock(capsule.capsule_id)}
              loading={unlocking === capsule.capsule_id}
              style={styles.unlockButton}
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>⏳ Time Capsules</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          Hidden memories for the future
        </Text>

        {capsules.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No time capsules yet. Create one from your memories!
            </Text>
          </Card>
        ) : (
          capsules.map(renderCapsule)
        )}
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    marginBottom: Spacing.xl,
  },
  capsuleCard: {
    marginBottom: Spacing.lg,
  },
  capsuleHeader: {
    marginBottom: Spacing.md,
  },
  capsuleTitle: {
    ...Typography.h4,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  capsuleDate: {
    ...Typography.caption,
  },
  countdownSection: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  countdownBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  countdownText: {
    ...Typography.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  countdownLabel: {
    ...Typography.caption,
  },
  unlockedSection: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  unlockedText: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  unlockButton: {
    width: '100%',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});

export default TimeCapsuleScreen;
