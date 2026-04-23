import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { memoryAPI } from '../api/api';

const Memories = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // const { user } = useStore(); // Unused for now

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const response = await memoryAPI.getTimeline();
      setTimeline(response.data.timeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
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
        <h1 style={{ color: 'white', marginBottom: '40px' }}>📸 Your Timeline</h1>
        
        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading memories...</div>
        ) : timeline.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666' }}>No memories yet. Start adding your special moments!</p>
          </div>
        ) : (
          timeline.map((month) => (
            <div key={`${month.year}-${month.month}`} style={{ marginBottom: '40px' }}>
              <h2 style={{
                color: 'white',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '2px solid rgba(255,255,255,0.3)'
              }}>
                {month.month} {month.year}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {month.memories.map((memory) => (
                  <div key={memory.memory_id} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#f0f0f0',
                      borderRadius: '20px',
                      fontSize: '12px',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {memory.memory_type}
                    </div>
                    <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>{memory.summary}</p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <span style={{ color: '#f5576c', fontWeight: 'bold' }}>#{memory.emotion_tag}</span>
                      <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Memories;
