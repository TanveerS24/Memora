import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { authAPI } from '../../api/api';
import GradientButton from '../../components/GradientButton';
import { getTheme, Spacing, Typography, BorderRadius } from '../../theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const themeKey = 'shared';
  const theme = getTheme(null, false)[themeKey];

  const handleRegister = async () => {
    if (!name || !email || !password || !gender || !dob) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        gender,
        dob: new Date(dob).toISOString().split('T')[0],
      });
      
      setUser(response.data);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.detail || 'An error occurred');
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: '#fff' }]}>💖 Memora</Text>
          <Text style={[styles.subtitle, { color: '#fff' }]}>Create Your Account</Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff' }]}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            
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
              placeholder="Password (min 8 characters)"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: '#fff' }]}
              placeholder="Gender (male/female/other)"
              placeholderTextColor="#999"
              value={gender}
              onChangeText={setGender}
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: '#fff' }]}
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={dob}
              onChangeText={setDob}
            />

            <GradientButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: '#fff' }]}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexGrow: 1,
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

export default RegisterScreen;
