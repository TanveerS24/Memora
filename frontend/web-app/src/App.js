import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from './store/useStore';
import { authAPI } from './api/api';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Partner from './components/Partner';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Memories from './components/Memories';
import LoveFeed from './components/LoveFeed';
import Insights from './components/Insights';
import Profile from './components/Profile';

const App = () => {
  const { isAuthenticated, setUser, logout } = useStore();

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        // Session not valid, user is not authenticated
        logout();
      }
    };
    checkSession();
  }, [setUser, logout]);

  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
      />
      <Routes>
        {!isAuthenticated ? (
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
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
