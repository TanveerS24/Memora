import { LinearGradient } from 'expo-linear-gradient';

export const Theme = {
  male: {
    primary: '#4A90E2',
    secondary: '#50E3C2',
    accent: '#7B68EE',
    background: '#F5F7FA',
    gradient: ['#4A90E2', '#50E3C2'],
    card: '#FFFFFF',
    text: '#2C3E50',
    textLight: '#7F8C8D',
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
  },
  female: {
    primary: '#FF6B9D',
    secondary: '#FFB6D9',
    accent: '#FF8E53',
    background: '#FFF0F5',
    gradient: ['#FF6B9D', '#FFB6D9'],
    card: '#FFFFFF',
    text: '#2C3E50',
    textLight: '#7F8C8D',
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
  },
  shared: {
    primary: '#9B59B6',
    secondary: '#BB8FCE',
    accent: '#E74C3C',
    background: '#F4F0F7',
    gradient: ['#9B59B6', '#BB8FCE'],
    card: '#FFFFFF',
    text: '#2C3E50',
    textLight: '#7F8C8D',
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
  },
};

export const getTheme = (gender, isPaired) => {
  if (isPaired) {
    return Theme.shared;
  }
  if (gender === 'male') {
    return Theme.male;
  }
  if (gender === 'female') {
    return Theme.female;
  }
  return Theme.shared;
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
