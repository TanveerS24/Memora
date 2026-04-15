import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore } from '../store/useStore';
import { chatAPI } from '../api/api';
import { getTheme, Spacing, Typography, BorderRadius } from '../theme';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  
  const { user, partner } = useStore();

  const themeKey = useStore.getState().getTheme();
  const theme = getTheme(null, false)[themeKey];

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getHistory(50, 0);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const tempMessage = {
      message_id: Date.now().toString(),
      sender_id: user.uid,
      content: inputText,
      is_ai_response: false,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, tempMessage]);
    setInputText('');

    try {
      await chatAPI.sendMessage(inputText);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender_id === user.uid;
    const isAI = item.is_ai_response;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownMessage : styles.otherMessage,
          isAI && styles.aiMessage,
          isOwn ? { backgroundColor: theme.primary } : { backgroundColor: theme.card },
        ]}
      >
        {isAI && (
          <Text style={[styles.aiLabel, { color: theme.accent }]}>💖 Memora</Text>
        )}
        <Text style={[styles.messageText, { color: isOwn ? '#fff' : theme.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, { color: isOwn ? '#fff' : theme.textLight }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {partner?.name || 'Chat'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Type a message... (@memora for AI)"
          placeholderTextColor={theme.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  aiMessage: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  aiLabel: {
    ...Typography.small,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  messageText: {
    ...Typography.body,
  },
  timestamp: {
    ...Typography.small,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    maxHeight: 100,
  },
  sendButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
