import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { partnerAPI } from '../api/api';
import GradientButton from '../components/GradientButton';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const PartnerScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const { user, partner, isPaired, setPartner, setCouple, setPaired } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    if (isPaired) {
      navigation.replace('Main');
    }
    loadPendingRequests();
  }, [isPaired]);

  const loadPendingRequests = async () => {
    try {
      const response = await partnerAPI.getPendingRequests();
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setSearching(true);
    try {
      const response = await partnerAPI.search(searchTerm);
      setSearchResults(response.data);
    } catch (error) {
      Alert.alert('Search Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    setLoading(true);
    try {
      await partnerAPI.sendRequest(receiverId);
      Alert.alert('Success', 'Partner request sent!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      Alert.alert('Request Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await partnerAPI.acceptRequest(requestId, null);
      setPartner(response.data.partner);
      setCouple(response.data.couple);
      setPaired(true);
      Alert.alert('Success', 'You are now paired!');
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Accept Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await partnerAPI.rejectRequest(requestId);
      loadPendingRequests();
      Alert.alert('Success', 'Request rejected');
    } catch (error) {
      Alert.alert('Reject Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={[styles.requestItem, { backgroundColor: theme.card }]}>
      <Text style={[styles.requestText, { color: theme.text }]}>
        Request from: {item.sender_id}
      </Text>
      <View style={styles.requestActions}>
        <TouchableOpacity
          onPress={() => handleAcceptRequest(item.id)}
          style={[styles.actionButton, { backgroundColor: theme.success }]}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRejectRequest(item.id)}
          style={[styles.actionButton, { backgroundColor: theme.error }]}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <View style={[styles.searchResult, { backgroundColor: theme.card }]}>
      <Text style={[styles.resultName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.resultUsername, { color: theme.textLight }]}>@{item.username}</Text>
      <GradientButton
        title="Send Request"
        onPress={() => handleSendRequest(item.uid)}
        loading={loading}
        style={styles.requestButton}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={theme.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: '#fff' }]}>Find Your Partner</Text>
        <Text style={[styles.subtitle, { color: '#fff' }]}>
          Search by UID or username to connect
        </Text>

        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>Pending Requests</Text>
            <FlatList
              data={pendingRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
            />
          </View>
        )}

        <View style={styles.searchSection}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: '#fff' }]}
            placeholder="Enter UID or username"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />
          <GradientButton
            title="Search"
            onPress={handleSearch}
            loading={searching}
            style={styles.searchButton}
          />
        </View>

        {searching && (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        )}

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.uid}
            style={styles.list}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  searchSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    ...Typography.body,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  searchButton: {
    marginTop: Spacing.sm,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  list: {
    maxHeight: 300,
  },
  requestItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  requestText: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  searchResult: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  resultName: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  resultUsername: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  requestButton: {
    width: '100%',
  },
});

export default PartnerScreen;
