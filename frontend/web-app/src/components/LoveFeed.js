import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { schedulerAPI } from '../api/api';

const LoveFeed = () => {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // const { user } = useStore(); // Unused for now

  useEffect(() => {
    loadLoveFeed();
  }, []);

  const loadLoveFeed = async () => {
    setLoading(true);
    try {
      const response = await schedulerAPI.getLoveFeed();
      setMemory(response.data);
    } catch (error) {
      console.error('Error loading love feed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'white', marginBottom: '10px' }}>❤️ Daily Love Feed</h1>
          <p style={{ color: 'white', marginBottom: '40px' }}>A memory from your happy moments</p>

          {loading ? (
            <div style={{ color: 'white' }}>Finding a special memory...</div>
          ) : memory ? (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>💖</div>
              <p style={{
                fontSize: '24px',
                lineHeight: '1.8',
                marginBottom: '20px',
                color: '#333'
              }}>
                {memory.content}
              </p>
              <p style={{
                fontSize: '16px',
                fontStyle: 'italic',
                color: '#666',
                marginBottom: '20px'
              }}>
                {memory.summary}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#999'
              }}>
                {new Date(memory.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px'
            }}>
              <p style={{ color: '#666' }}>
                No happy memories yet. Start creating beautiful moments together!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoveFeed;
