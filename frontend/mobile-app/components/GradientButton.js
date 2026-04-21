import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getTheme, Spacing, BorderRadius, Typography } from '../theme';

const GradientButton = ({ title, onPress, loading, disabled, style }) => {
  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.h4,
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default GradientButton;
