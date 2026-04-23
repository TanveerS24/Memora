import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { chatAPI, partnerAPI } from '../api/api';
import { useStore } from '../store/useStore';

const Dashboard = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { isPaired, setPartner, setCouple, setPaired } = useStore();

  useEffect(() => {
    // Check partner status on mount
    checkPartnerStatus();
  }, []);

  useEffect(() => {
    // Fetch unread count only if paired
    if (isPaired) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isPaired]);

  const checkPartnerStatus = async () => {
    try {
      const response = await partnerAPI.getPartnerInfo();
      if (response.data.is_paired) {
        setPartner(response.data.partner);
        setCouple(response.data.couple);
        setPaired(true);
      }
    } catch (error) {
      // No partner yet
      console.log('No partner found');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleFeatureClick = (featureName, path) => {
    if (!isPaired) {
      toast.warning(
        <div>
          <strong>Connect with a partner first!</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            You need to connect with a partner to use {featureName}.
          </p>
        </div>,
        {
          position: 'bottom-right',
          autoClose: 5000,
          theme: 'colored',
          onClick: () => navigate('/partner')
        }
      );
      return;
    }
    navigate(path);
  };

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px' }}>💖 Memora Dashboard</h1>
        
        {/* Partner Connection Banner */}
        {!isPaired && (
          <div style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #feca57 100%)',
            padding: '25px',
            borderRadius: '16px',
            marginBottom: '30px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💕</div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Welcome to Memora!</h2>
            <p style={{ color: 'white', marginBottom: '15px', fontSize: '16px' }}>
              Connect with your partner to start building your love archive together.
            </p>
            <button
              onClick={() => navigate('/partner')}
              style={{
                padding: '12px 30px',
                background: 'white',
                color: '#FF6B9D',
                border: 'none',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Connect with Partner →
            </button>
          </div>
        )}
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div 
            onClick={() => handleFeatureClick('Chat', '/chat')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative',
              textDecoration: 'none',
              opacity: isPaired ? 1 : 0.6
            }}
          >
            {isPaired && unreadCount > 0 && (
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
            {!isPaired && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#999',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                🔒 Partner Required
              </div>
            )}
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
            <h3 style={{ marginBottom: '10px' }}>Chat</h3>
            <p style={{ color: '#666' }}>Message your partner with AI assistance</p>
            {isPaired && unreadCount > 0 && (
              <p style={{ color: '#FF6B9D', fontSize: '14px', marginTop: '10px', fontWeight: '500' }}>
                {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div 
            onClick={() => handleFeatureClick('Memories', '/memories')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative',
              opacity: isPaired ? 1 : 0.6
            }}
          >
            {!isPaired && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#999',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                🔒 Partner Required
              </div>
            )}
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📸</div>
            <h3 style={{ marginBottom: '10px' }}>Memories</h3>
            <p style={{ color: '#666' }}>View and manage your shared memories</p>
          </div>

          <div 
            onClick={() => handleFeatureClick('Love Feed', '/lovefeed')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative',
              opacity: isPaired ? 1 : 0.6
            }}
          >
            {!isPaired && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#999',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                🔒 Partner Required
              </div>
            )}
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>❤️</div>
            <h3 style={{ marginBottom: '10px' }}>Love Feed</h3>
            <p style={{ color: '#666' }}>Daily dose of happy memories</p>
          </div>

          <div 
            onClick={() => handleFeatureClick('Insights', '/insights')}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative',
              opacity: isPaired ? 1 : 0.6
            }}
          >
            {!isPaired && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#999',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                🔒 Partner Required
              </div>
            )}
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ marginBottom: '10px' }}>Insights</h3>
            <p style={{ color: '#666' }}>Relationship analytics and trends</p>
          </div>

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
