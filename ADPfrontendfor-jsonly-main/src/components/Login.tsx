import React, { useState } from 'react';
import './Login.css';
import { useDispatch } from 'react-redux';
import { setAuthData, updateUsageStats } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import useBranding from '@/hooks/useBranding';
import { apiService, LoginResponse } from '@/services/apiService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const branding = useBranding();
  const { handleError } = useErrorHandler();

  const Popup = ({ message }) => {
    if (!message) return null;

    return (
      <div style={popupStyles.backdrop}>
        <div style={popupStyles.popup}>
          <p>{message}</p>
        </div>
      </div>
    );
  };

  const popupStyles: {
    backdrop: React.CSSProperties;
    popup: React.CSSProperties;
  } = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    popup: {
      backgroundColor: '#fff',
      padding: '20px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignIn) {
        const data = (await apiService.login(
          username,
          password
        )) as LoginResponse;
        const {
          access,
          refresh,
          username: respUsername,
          userType,
          id,
        } = data;
        setPopupMessage(`Login successful! Welcome ${respUsername}`);

        dispatch(
          setAuthData({
            accessToken: access,
            refreshToken: refresh,
            userId: id.toString(),
            username: respUsername,
            userType,
          })
        );
        const usageStats = await apiService.getUsageStats();
        dispatch(updateUsageStats(usageStats));

        setTimeout(() => {
          setPopupMessage('');
          navigate('/uploaddoc');
        }, 2000);
      } else {
        const data = await apiService.createUser(name, email, contact, password);
        const { message, username: respUsername } = data;
        setPopupMessage(message || 'User created successfully!');

        dispatch(
          setAuthData({
            accessToken: data.token.access,
            refreshToken: data.token.refresh,
            userId: null,
            username: respUsername ?? name,
            userType: 'default',
          })
        );

        setTimeout(() => {
          setPopupMessage('');
          setIsSignIn(true);
        }, 2000);
      }
    } catch (error) {
      handleError(
        error as { status?: number; message?: string },
        'Failed to process your request'
      );
    } finally {
      setIsLoading(false);
    }
  };




  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setContact('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="12" height="12" fill="#A9A9A9" />
              <rect x="4" y="18" width="12" height="18" fill="#3B82F6" />
              <rect x="18" y="18" width="18" height="18" fill="#FFA500" opacity="0.8" />
              <rect x="18" y="4" width="18" height="12" fill="#2563EB" />
            </svg>
            <h1>ADP AI</h1>
          </div>
          <h2>{isSignIn ? 'Sign in to your account' : 'Create your account'}</h2>
        </div>

        {/* ✅ Wrapped this in a form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {isSignIn && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>


          <button
            type="submit" // ✅ Changed to submit type
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignIn ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="login-options">
          <p className="sign-in-text">
            {isSignIn ? "Don't have an account? " : "Already had an account? "}
            <a href="#" onClick={toggleMode}>
              {isSignIn ? 'Create account' : 'Sign in'}
            </a>
          </p>
          {isSignIn && (
            <p className="forgot-password-text">
              <a href="/password-reset">Forgot password?</a>
            </p>
          )}
        </div>

        <div className="terms-policy">
          <p>{branding?.copyright}</p>
        </div>
      </div>
      {popupMessage && <Popup message={popupMessage} />}
    </div>
  );
};

export default Login;
