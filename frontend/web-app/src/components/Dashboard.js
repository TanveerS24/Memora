import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
              <h3 style={{ marginBottom: '10px' }}>Chat</h3>
              <p style={{ color: '#666' }}>Message your partner with AI assistance</p>
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
