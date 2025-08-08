import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

const PasswordResetRequest = () => {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const data = await apiService.requestPasswordReset(value);
      setMessage(data.detail || 'Reset link sent. Check your email.');
    } catch (err) {
      handleError(err, 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Request password reset</h2>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Email or Username"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          {message && <div className="sign-in-text">{message}</div>}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
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

export default PasswordResetRequest;
