import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { authAPI } from '../../api/api';
import GradientButton from '../../components/GradientButton';
import { getTheme, Spacing, Typography, BorderRadius } from '../../theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const themeKey = 'shared';
  const theme = getTheme(null, false)[themeKey];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;
      
      setToken(access_token);
      
      // Get user info
      const userResponse = await authAPI.getMe();
      setUser(userResponse.data);
      
      navigation.replace('Partner');
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={theme.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: '#fff' }]}>💖 Memora</Text>
          <Text style={[styles.subtitle, { color: '#fff' }]}>Your Love Archive</Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff' }]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: '#fff' }]}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <GradientButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: '#fff' }]}>
                Don't have an account? Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  form: {
    gap: Spacing.md,
  },
  input: {
    ...Typography.body,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  button: {
    marginTop: Spacing.md,
  },
  link: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default LoginScreen;
