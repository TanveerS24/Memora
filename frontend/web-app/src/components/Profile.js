import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authAPI } from '../api/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout on frontend even if API call fails
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/login');
      alert('Your account has been successfully deleted.');
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
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
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all'
            }}>
              {user.uid}
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
