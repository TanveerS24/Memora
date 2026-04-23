import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../store/useStore';
import { authAPI, partnerAPI } from '../api/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, partner, isPaired, setPartner, setCouple, setPaired } = useStore();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [unpairLoading, setUnpairLoading] = useState(false);

  // Load partner info on mount if paired
  useEffect(() => {
    if (!isPaired && user) {
      loadPartnerInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPaired]);

  const loadPartnerInfo = async () => {
    try {
      const response = await partnerAPI.getPartnerInfo();
      if (response.data.is_paired) {
        setPartner(response.data.partner);
        setCouple(response.data.couple);
        setPaired(true);
      }
    } catch (error) {
      // Not paired
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed, but you have been signed out locally.', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      });
      // Still logout on frontend even if API call fails
      logout();
      navigate('/login');
    }
  };

  const performDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/login');
      toast.success('Your account has been successfully deleted.', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [logout, navigate]);

  const handleDeleteAccount = () => {
    // Custom confirmation toast with Confirm/Cancel buttons
    const ConfirmDialog = ({ closeToast }) => (
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <div style={{
          fontSize: '24px',
          color: '#e74c3c',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          ⚠️ Warning
        </div>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Delete Account?
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
          textAlign: 'center'
        }}>
          This action <strong>cannot be undone</strong>. All your data including memories, chat history, and partner connection will be permanently deleted.
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              closeToast();
            }}
            style={{
              padding: '10px 24px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#7f8c8d'}
            onMouseOut={(e) => e.target.style.background = '#95a5a6'}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              closeToast();
              performDelete();
            }}
            disabled={deleteLoading}
            style={{
              padding: '10px 24px',
              background: deleteLoading ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: deleteLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !deleteLoading && (e.target.style.background = '#c0392b')}
            onMouseOut={(e) => !deleteLoading && (e.target.style.background = '#e74c3c')}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </div>
    );

    toast.warning(<ConfirmDialog />, {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      theme: 'colored',
      style: {
        background: '#fff5f5',
        border: '2px solid #e74c3c',
        borderRadius: '16px',
        padding: '0'
      }
    });
  };

  const performUnpair = useCallback(async () => {
    setUnpairLoading(true);
    try {
      await partnerAPI.unpair();
      setPartner(null);
      setCouple(null);
      setPaired(false);
      toast.success('Successfully unpaired from partner', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored'
      });
    } catch (error) {
      console.error('Unpair error:', error);
      toast.error('Failed to unpair: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setUnpairLoading(false);
    }
  }, [setPartner, setCouple, setPaired]);

  const handleUnpair = () => {
    const ConfirmDialog = ({ closeToast }) => (
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <div style={{
          fontSize: '24px',
          color: '#FF6B9D',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          💔 Unpair?
        </div>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Unpair from {partner?.name}?
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
          textAlign: 'center'
        }}>
          This will delete all your chat history and couple data. <strong>This cannot be undone.</strong>
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => closeToast()}
            style={{
              padding: '10px 24px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#7f8c8d'}
            onMouseOut={(e) => e.target.style.background = '#95a5a6'}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              closeToast();
              performUnpair();
            }}
            disabled={unpairLoading}
            style={{
              padding: '10px 24px',
              background: unpairLoading ? '#ccc' : '#FF6B9D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: unpairLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !unpairLoading && (e.target.style.background = '#ff5277')}
            onMouseOut={(e) => !unpairLoading && (e.target.style.background = '#FF6B9D')}
          >
            {unpairLoading ? 'Unpairing...' : 'Unpair'}
          </button>
        </div>
      </div>
    );

    toast.warning(<ConfirmDialog />, {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      theme: 'colored',
      style: {
        background: '#fff5f5',
        border: '2px solid #FF6B9D',
        borderRadius: '16px',
        padding: '0'
      }
    });
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ marginBottom: '30px', color: '#333' }}>Profile</h1>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              User ID (UID)
            </label>
            <div
              onClick={() => {
                navigator.clipboard.writeText(user.uid);
                toast.info('UID copied to clipboard!', {
                  position: 'top-center',
                  autoClose: 2000,
                  theme: 'colored'
                });
              }}
              style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseOver={(e) => e.target.style.background = '#e0e0e0'}
              onMouseOut={(e) => e.target.style.background = '#f5f5f5'}
              title="Click to copy UID"
            >
              {user.uid}
              <span style={{ fontSize: '12px', color: '#666' }}>📋 Copy</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Username
            </label>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {user.username}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Full Name
            </label>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {user.name}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Email
            </label>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {user.email}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Gender
            </label>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '16px',
              textTransform: 'capitalize'
            }}>
              {user.gender}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Date of Birth
            </label>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              {user.dob}
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Account Status
            </label>
            <div style={{
              padding: '12px',
              background: user.is_active ? '#e8f5e9' : '#ffebee',
              borderRadius: '8px',
              fontSize: '16px',
              color: user.is_active ? '#2e7d32' : '#c62828',
              fontWeight: 'bold'
            }}>
              {user.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Partner Section */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Partner Status
            </label>
            {isPaired && partner ? (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #fff5f7 0%, #ffeef0 100%)',
                borderRadius: '12px',
                border: '2px solid #FF6B9D'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #feca57 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    marginRight: '15px'
                  }}>
                    💑
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                      {partner.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      @{partner.username}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {partner.email}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '20px' }}>💕</span>
                  <span style={{ color: '#FF6B9D', fontWeight: '500' }}>
                    You are paired!
                  </span>
                </div>
                <button
                  onClick={handleUnpair}
                  disabled={unpairLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: unpairLoading ? '#ccc' : 'white',
                    color: unpairLoading ? '#666' : '#FF6B9D',
                    border: '2px solid #FF6B9D',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: unpairLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !unpairLoading && (e.target.style.background = '#FF6B9D', e.target.style.color = 'white')}
                  onMouseOut={(e) => !unpairLoading && (e.target.style.background = 'white', e.target.style.color = '#FF6B9D')}
                >
                  {unpairLoading ? 'Unpairing...' : '💔 Unpair'}
                </button>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                background: '#f5f5f5',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💔</div>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                  You don't have a partner yet
                </p>
                <button
                  onClick={() => navigate('/partner')}
                  style={{
                    padding: '10px 20px',
                    background: '#FF6B9D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#ff5277'}
                  onMouseOut={(e) => e.target.style.background = '#FF6B9D'}
                >
                  Find a Partner →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '15px'
            }}
            onMouseOver={(e) => e.target.style.background = '#d32f2f'}
            onMouseOut={(e) => e.target.style.background = '#f44336'}
          >
            Logout
          </button>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
            <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Danger Zone</h3>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: deleteLoading ? '#ccc' : '#c62828',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => !deleteLoading && (e.target.style.background = '#b71c1c')}
              onMouseOut={(e) => !deleteLoading && (e.target.style.background = '#c62828')}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
              This will permanently delete your account and all associated data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
