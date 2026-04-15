import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Partner from './components/Partner';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Memories from './components/Memories';
import LoveFeed from './components/LoveFeed';
import Insights from './components/Insights';

const App = () => {
  const { token } = useStore();

  return (
    <Router>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/partner" element={<Partner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/lovefeed" element={<LoveFeed />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="*" element={<Navigate to="/partner" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
