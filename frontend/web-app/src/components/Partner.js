import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../store/useStore';
import { partnerAPI } from '../api/api';
import { Link } from 'react-router-dom';

const Partner = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConnectionAnimation, setShowConnectionAnimation] = useState(false);
  const [connectedPartner, setConnectedPartner] = useState(null);
  const navigate = useNavigate();
  
  const { setPartner, setCouple, setPaired } = useStore();

  useEffect(() => {
    // Check for existing partner on mount
    const checkPartnerStatus = async () => {
      try {
        const response = await partnerAPI.getPartnerInfo();
        if (response.data.is_paired) {
          setPartner(response.data.partner);
          setCouple(response.data.couple);
          setPaired(true);
          navigate('/dashboard');
        }
      } catch (error) {
        // User doesn't have a partner yet, which is expected
        console.log('No partner found');
      }
    };

    checkPartnerStatus();
    loadPendingRequests();
  }, [navigate, setPartner, setCouple, setPaired]);

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
      toast.error('Search Failed: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    setLoading(true);
    try {
      await partnerAPI.sendRequest(receiverId);
      toast.success('Partner request sent! 💕', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored'
      });
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      toast.error('Request Failed: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await partnerAPI.acceptRequest(requestId, null);
      const partner = response.data.partner;
      setPartner(partner);
      setCouple(response.data.couple);
      setPaired(true);
      
      // Show lovely connection animation
      setConnectedPartner(partner);
      setShowConnectionAnimation(true);
      
      // Navigate to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      toast.error('Accept Failed: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await partnerAPI.rejectRequest(requestId);
      loadPendingRequests();
      toast.info('Request rejected', {
        position: 'top-center',
        autoClose: 2000,
        theme: 'colored'
      });
    } catch (error) {
      toast.error('Reject Failed: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setLoading(false);
    }
  };

  // Love Connection Animation Component
  const ConnectionAnimation = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #FF6B9D 0%, #feca57 50%, #667eea 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
      
      {/* Floating hearts background */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '40px',
        animation: 'float 3s ease-in-out infinite',
        opacity: 0.6
      }}>💕</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        fontSize: '50px',
        animation: 'float 4s ease-in-out infinite 0.5s',
        opacity: 0.5
      }}>💖</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        fontSize: '35px',
        animation: 'float 3.5s ease-in-out infinite 1s',
        opacity: 0.7
      }}>💗</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        fontSize: '45px',
        animation: 'float 4.5s ease-in-out infinite 1.5s',
        opacity: 0.5
      }}>💝</div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '5%',
        fontSize: '30px',
        animation: 'float 3s ease-in-out infinite 0.3s',
        opacity: 0.4
      }}>✨</div>
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '8%',
        fontSize: '35px',
        animation: 'float 3.8s ease-in-out infinite 0.8s',
        opacity: 0.5
      }}>✨</div>
      
      {/* Main heart */}
      <div style={{
        fontSize: '120px',
        animation: 'heartBeat 1.5s ease-in-out infinite',
        marginBottom: '30px'
      }}>
        💑
      </div>
      
      {/* Connected message */}
      <h1 style={{
        color: 'white',
        fontSize: '42px',
        fontWeight: 'bold',
        marginBottom: '15px',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        You're Connected! 💕
      </h1>
      
      {/* Partner info */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '25px 40px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        marginBottom: '20px',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '5px' }}>
          You and
        </p>
        <p style={{ 
          color: '#FF6B9D', 
          fontSize: '28px', 
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          {connectedPartner?.name}
        </p>
        <p style={{ color: '#667eea', fontSize: '16px' }}>
          @{connectedPartner?.username}
        </p>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '15px' }}>
          are now partners! 💕
        </p>
      </div>
      
      {/* Sparkles */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '10px'
      }}>
        <span style={{ fontSize: '30px', animation: 'sparkle 1.5s ease-in-out infinite' }}>✨</span>
        <span style={{ fontSize: '40px', animation: 'sparkle 1.5s ease-in-out infinite 0.3s' }}>🌟</span>
        <span style={{ fontSize: '30px', animation: 'sparkle 1.5s ease-in-out infinite 0.6s' }}>✨</span>
      </div>
      
      {/* Redirect message */}
      <p style={{
        color: 'white',
        fontSize: '16px',
        marginTop: '30px',
        opacity: 0.9
      }}>
        Taking you to your shared space in 3 seconds...
      </p>
    </div>
  );

  if (showConnectionAnimation) {
    return <ConnectionAnimation />;
  }

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'white', margin: 0 }}>Find Your Partner</h1>
          <Link to="/profile" style={{
            padding: '10px 20px',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            View My UID
          </Link>
        </div>
        <p style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>
          Search by UID or username to connect
        </p>

        {pendingRequests.length > 0 && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Pending Requests</h3>
            {pendingRequests.map((request) => (
              <div key={request.id} style={{
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{request.sender_name}</div>
                  <div style={{ color: '#666' }}>@{request.sender_username}</div>
                </div>
                <div>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      background: '#2ECC71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      marginRight: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      background: '#E74C3C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter UID or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: searching ? 'not-allowed' : 'pointer'
              }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div>
              {searchResults.map((user) => (
                <div key={user.uid} style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ color: '#666' }}>@{user.username}</div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.uid)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Send Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Partner;
