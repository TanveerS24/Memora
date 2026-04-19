import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../api/api';

const Dashboard = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: 'white', marginBottom: '40px' }}>💖 Memora Dashboard</h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative'
            }}>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#FF6B9D',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
              <h3 style={{ marginBottom: '10px' }}>Chat</h3>
              <p style={{ color: '#666' }}>Message your partner with AI assistance</p>
              {unreadCount > 0 && (
                <p style={{ color: '#FF6B9D', fontSize: '14px', marginTop: '10px', fontWeight: '500' }}>
                  {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Link>

          <Link to="/memories" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📸</div>
              <h3 style={{ marginBottom: '10px' }}>Memories</h3>
              <p style={{ color: '#666' }}>View and manage your shared memories</p>
            </div>
          </Link>

          <Link to="/lovefeed" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>❤️</div>
              <h3 style={{ marginBottom: '10px' }}>Love Feed</h3>
              <p style={{ color: '#666' }}>Daily dose of happy memories</p>
            </div>
          </Link>

          <Link to="/insights" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
              <h3 style={{ marginBottom: '10px' }}>Insights</h3>
              <p style={{ color: '#666' }}>Relationship analytics and trends</p>
            </div>
          </Link>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
              <h3 style={{ marginBottom: '10px' }}>Profile</h3>
              <p style={{ color: '#666' }}>View your profile and logout</p>
            </div>
          </Link>
        </div>

        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Quick Tips</h2>
          <ul style={{ color: '#666', lineHeight: '1.8' }}>
            <li>Use @memora in chat to get AI-powered responses</li>
            <li>Add memories with photos and text to build your archive</li>
            <li>Check the Love Feed daily for a special memory</li>
            <li>View insights to understand your relationship patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
