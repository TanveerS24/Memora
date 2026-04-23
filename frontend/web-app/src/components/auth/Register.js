import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../../store/useStore';
import { authAPI } from '../../api/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const setUser = useStore((state) => state.setUser);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.gender || !formData.dob) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        ...formData,
        dob: new Date(formData.dob).toISOString().split('T')[0]
      });
      setUser(response.data);
      toast.success('Welcome to Memora! Your account has been created. 💕', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored'
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration Failed: ' + (error.response?.data?.detail || 'An error occurred'), {
        position: 'top-center',
        theme: 'colored'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app female-theme">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>💖 Memora</h1>
          <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>Create Your Account</p>
          
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Your Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Create Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a secure password (minimum 8 characters)"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Gender Identity
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: formData.gender === 'male' ? '2px solid #f5576c' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.gender === 'male' ? '#fff5f7' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: formData.gender === 'female' ? '2px solid #f5576c' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.gender === 'female' ? '#fff5f7' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Female
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                placeholder="Select your date of birth"
                value={formData.dob}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Loading...' : 'Register'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Already have an account? <a href="/login" style={{ color: '#f5576c' }}>Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
