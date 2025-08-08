import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

const PasswordResetConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const uid = query.get('uid') || '';
  const token = query.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Decode the URL parameters
    const urlQuery = new URLSearchParams(location.search);
    const uidParam = urlQuery.get('uid');
    const tokenParam = urlQuery.get('token');

    if (!uidParam || !tokenParam) {
      handleError({ message: 'Invalid reset link. Please request a new password reset.' });
      return;
    }

    // More permissive check for uid and token format
    if (
      typeof uidParam !== 'string' ||
      typeof tokenParam !== 'string' ||
      uidParam.trim() === '' ||
      tokenParam.trim() === ''
    ) {
      handleError({ message: 'Invalid reset link format. Please request a new password reset.' });
      return;
    }
  }, [location.search, handleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uid || !token) {
      handleError({ message: 'Invalid reset link. Please request a new password reset.' });
      return;
    }

    if (password !== confirmPassword) {
      handleError({ message: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      handleError({ message: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await apiService.confirmPasswordReset(
        uid.trim(),
        token.trim(),
        password
      );
      setMessage('Password has been reset successfully');

      // Auto-navigate after a short delay
      setTimeout(() => {
        const shouldRedirect = window.confirm('Password reset successful! Go to login page?');
        if (shouldRedirect) {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      if (errorMessage.includes('invalid token') || errorMessage.includes('invalid uid')) {
        handleError({ message: 'Invalid or expired reset link. Please request a new password reset.' });
      } else {
        handleError({ message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Set new password</h2>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {message && <div className="sign-in-text">{message}</div>}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Reset password'}
          </button>
        </form>
        <div className="login-options">
          <p className="sign-in-text">
            <a href="#" onClick={() => navigate('/')}>Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
