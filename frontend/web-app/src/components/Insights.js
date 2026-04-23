import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { insightAPI } from '../api/api';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // const { user } = useStore(); // Unused for now

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await insightAPI.getDashboard();
      setInsights(response.data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmotionBar = (emotion, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={emotion} style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ width: '80px' }}>{emotion}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        <div style={{
          height: '8px',
          background: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: `${percentage}%`,
            borderRadius: '4px'
          }} />
        </div>
      </div>
    );
  };

  return (
    <div className="app shared-theme">
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: 'white', marginBottom: '40px' }}>📊 Relationship Insights</h1>
        
        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading insights...</div>
        ) : insights ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Communication Trends</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#666' }}>Total Messages</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  {insights.communication_trends?.total_messages || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Avg per Day</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  {insights.communication_trends?.average_per_day || 0}
                </span>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Emotion Distribution</h3>
              {insights.emotion_trends?.emotions ? (
                <div>
                  {Object.entries(insights.emotion_trends.emotions).map(([emotion, count]) =>
                    renderEmotionBar(emotion, count, insights.communication_trends.total_messages)
                  )}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No emotion data yet</p>
              )}
            </div>

            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Activity Frequency</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#666' }}>Total Memories</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  {insights.activity_frequency?.total_memories || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Most Active Month</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  {insights.activity_frequency?.most_active_month || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Peak Happy Days</h3>
              {insights.peak_happy_days && insights.peak_happy_days.length > 0 ? (
                <div>
                  {insights.peak_happy_days.map((date, index) => (
                    <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      {new Date(date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No data yet</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666' }}>No insights available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
