import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { chatAPI } from '../api/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const aiTimeoutRef = useRef(null);
  
  const { user, partner } = useStore();

  const connectWebSocket = useCallback(() => {
    if (!user?.uid) return;

    const wsUrl = `ws://localhost:8003/ws?user_id=${user.uid}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages((prevMessages) => {
          // Check if message already exists by ID to prevent duplicates
          const exists = prevMessages.some(m => m.message_id === data.data.message_id);
          if (exists) return prevMessages;
          
          // If AI response received, clear loading state
          if (data.data.is_ai_response) {
            setAiLoading(false);
            if (aiTimeoutRef.current) {
              clearTimeout(aiTimeoutRef.current);
            }
          }
          
          return [...prevMessages, data.data];
        });
      } else if (data.type === 'typing') {
        // Handle typing indicator if needed
        console.log('User typing:', data.data.user_id);
      } else if (data.type === 'read_receipt') {
        // Handle read receipt if needed
        console.log('Message read:', data.data.message_id);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
  }, [user?.uid]);

  useEffect(() => {
    loadMessages();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFirstUnread = useCallback(() => {
    const firstUnread = messages.find(m => 
      m.sender_id !== user?.uid && !m.is_read
    );
    
    if (firstUnread) {
      const element = document.getElementById(`message-${firstUnread.message_id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      scrollToBottom();
    }
  }, [messages, user?.uid]);

  useEffect(() => {
    if (!loading) {
      scrollToFirstUnread();
    }
  }, [messages, loading, scrollToFirstUnread]);

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

  // Mark messages as read after scrolling to first unread
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const hasUnread = messages.some(m => m.sender_id !== user?.uid && !m.is_read);
      if (hasUnread) {
        // Delay marking as read to allow scroll to complete
        setTimeout(() => {
          chatAPI.markAllAsRead();
        }, 1000);
      } else {
        chatAPI.markAllAsRead();
      }
    }
  }, [loading, messages, user?.uid]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !wsRef.current) return;

    const content = inputText;
    const isAiQuery = content.toLowerCase().includes('@memora');
    setInputText('');

    // If AI query, show loading state with 45s timeout
    if (isAiQuery) {
      setAiLoading(true);
      // Clear any existing timeout
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
      // Set 45 second timeout to clear loading state
      aiTimeoutRef.current = setTimeout(() => {
        setAiLoading(false);
      }, 45000);
    }

    // Send via websocket - the server will broadcast it back to all connected clients
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: content
    }));
  };

  return (
    <div className="app shared-theme">
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ margin: 0 }}>💬 Chat with {partner?.name || 'Partner'}</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Use @memora for AI assistance</p>
        </div>

        <div 
          ref={messagesContainerRef}
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#f5f7fa'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading messages...</div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user.uid;
              const isAI = message.is_ai_response;
              const isUnread = !isOwn && !message.is_read;

              return (
                <div
                  key={message.message_id}
                  id={`message-${message.message_id}`}
                  style={{
                    display: 'flex',
                    justifyContent: isAI ? 'center' : (isOwn ? 'flex-end' : 'flex-start'),
                    marginBottom: '15px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isOwn ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: isOwn ? 'white' : '#333',
                    boxShadow: isAI ? '0 0 0 2px #FF6B9D' : '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    {isUnread && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '16px',
                        height: '16px',
                        background: '#FF6B9D',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }} />
                    )}
                    {isAI && <div style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>💖 Memora</div>}
                    <div>{message.content}</div>
                    <div style={{
                      fontSize: '11px',
                      marginTop: '5px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '10px',
          background: 'white',
          position: 'relative',
          zIndex: 10
        }}>
          {aiLoading && (
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '20px',
              right: '20px',
              padding: '10px 15px',
              background: 'linear-gradient(135deg, #FF6B9D 0%, #feca57 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              animation: 'pulse 2s infinite'
            }}>
              💖 Memora is thinking...
            </div>
          )}
          <input
            type="text"
            placeholder="Type a message... (@memora for AI)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={aiLoading}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '16px',
              opacity: aiLoading ? 0.6 : 1
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={aiLoading}
            style={{
              padding: '12px 24px',
              background: aiLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1
            }}
          >
            {aiLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
