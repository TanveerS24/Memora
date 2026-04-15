import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { chatAPI } from '../api/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user, partner } = useStore();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          background: 'white'
        }}>
          <h2 style={{ margin: 0 }}>💬 Chat with {partner?.name || 'Partner'}</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Use @memora for AI assistance</p>
        </div>

        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: '#f5f7fa'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading messages...</div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user.uid;
              const isAI = message.is_ai_response;

              return (
                <div
                  key={message.message_id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '15px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isOwn ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: isOwn ? 'white' : '#333',
                    boxShadow: isAI ? '0 0 0 2px #FF6B9D' : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
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
          background: 'white'
        }}>
          <input
            type="text"
            placeholder="Type a message... (@memora for AI)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '16px'
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
