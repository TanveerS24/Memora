import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { partnerAPI } from '../api/api';
import { Link } from 'react-router-dom';

const Partner = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  
  const { user, partner, isPaired, setPartner, setCouple, setPaired } = useStore();

  useEffect(() => {
    if (isPaired) {
      navigate('/dashboard');
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
      alert('Search Failed: ' + (error.response?.data?.detail || 'An error occurred'));
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    setLoading(true);
    try {
      await partnerAPI.sendRequest(receiverId);
      alert('Partner request sent!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      alert('Request Failed: ' + (error.response?.data?.detail || 'An error occurred'));
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
      alert('You are now paired!');
      navigate('/dashboard');
    } catch (error) {
      alert('Accept Failed: ' + (error.response?.data?.detail || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await partnerAPI.rejectRequest(requestId);
      loadPendingRequests();
      alert('Request rejected');
    } catch (error) {
      alert('Reject Failed: ' + (error.response?.data?.detail || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

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
                <span>Request from: {request.sender_id}</span>
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
