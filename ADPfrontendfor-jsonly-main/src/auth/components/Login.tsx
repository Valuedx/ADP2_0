import React, { useState } from 'react';
import './Login.css';
import { useDispatch } from 'react-redux';
import { setAuthData, updateUsageStats } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import useBranding from '@/shared/hooks/useBranding';
import { apiService, LoginResponse } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Changed from popupMessage to errorMessage
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const branding = useBranding();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear previous error message

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

        navigate('/uploaddoc');
      } else {
        const data: any = await apiService.createUser(name, email, contact, password);
        const message = data.message || 'User created successfully!';
        const respUsername = data.username || name;

        // Show success message below form
        setErrorMessage(message);

        dispatch(
          setAuthData({
            accessToken: data.token?.access,
            refreshToken: data.token?.refresh,
            userId: null,
            username: respUsername,
            userType: 'default',
          })
        );

        // Clear form and switch to sign in after success
        setTimeout(() => {
          setName('');
          setEmail('');
          setContact('');
          setPassword('');
          setErrorMessage('');
          setIsSignIn(true);
        }, 2000);
      }
    } catch (error) {
      // Handle specific error cases for user creation
      if (!isSignIn) {
        // Check if it's a known error response from our API
        if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
          let errorMsg = 'Failed to create account. Please check your information and try again.';
          
          // Try to extract specific error messages from the response
          if ('data' in error && error.data && typeof error.data === 'object') {
            const errorData = error.data as { message?: string | Record<string, string[]> };
            
            // Handle serializer validation errors
            if (errorData.message) {
              if (typeof errorData.message === 'object') {
                // Extract specific field errors
                if (errorData.message.username && Array.isArray(errorData.message.username)) {
                  errorMsg = errorData.message.username[0];
                } else if (errorData.message.email && Array.isArray(errorData.message.email)) {
                  errorMsg = errorData.message.email[0];
                } else {
                  // Generic error message from serializer
                  errorMsg = Object.values(errorData.message)[0]?.[0] || errorMsg;
                }
              } else if (typeof errorData.message === 'string') {
                // Direct error message
                errorMsg = errorData.message;
              }
            }
          }
          
          setErrorMessage(errorMsg);
          // Keep fields editable so user can correct and resubmit
          setIsLoading(false);
          return;
        }
      }
      
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
    setErrorMessage(''); // Clear error message when switching modes
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

        {/* Show error or success message at the bottom of the form */}
        {errorMessage && (
          <div className="error-message" style={{ 
            color: errorMessage.includes('successfully') ? 'green' : 'red', 
            textAlign: 'center', 
            marginTop: '10px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: errorMessage.includes('successfully') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${errorMessage.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {errorMessage}
          </div>
        )}

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
    </div>
  );
};

export default Login;