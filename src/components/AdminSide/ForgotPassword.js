import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Mail, Loader2, Check } from 'lucide-react';
import PasswordInput from './PasswordInput';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/password-reset/', { email_or_username: emailOrUsername });
      if (response.data.success) {
        setStep(2);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/password-reset/verify/', {
        email_or_username: emailOrUsername,
        reset_code: resetCode,
      });
      if (response.data.success) {
        setStep(3);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/password-reset/confirm/', {
        email_or_username: emailOrUsername,
        new_password: newPassword,
        code: resetCode,
      });
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Forgot Password</h2>
          <p className="forgot-password-description">
            Enter your email or username to get a reset code
          </p>
        </div>
        <div className="forgot-password-form">
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email-or-username" className="form-label">
                Email or Username
              </label>
              <input
                id="email-or-username"
                type="text"
                className="form-input"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
              <button
                className="submit-button"
                onClick={handleRequestCode}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="submit-button-icon" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="submit-button-icon" />
                    Send Reset Code
                  </>
                )}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="form-group">
              <label htmlFor="reset-code" className="form-label">
                Reset Code
              </label>
              <input
                id="reset-code"
                type="text"
                className="form-input"
                placeholder="Enter the reset code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
              <button
                className="submit-button"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="submit-button-icon" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    <Check className="submit-button-icon" />
                    Verify Code
                  </>
                )}
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
              <button
                className="submit-button"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="submit-button-icon" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Check className="submit-button-icon" />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          )}
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-alert-icon" />
              <div className="error-alert-title">Error</div>
              <div className="error-alert-description">{error}</div>
            </div>
          )}
          {success && (
            <div className="success-alert">
              <Check className="success-alert-icon" />
              <div className="success-alert-title">Success</div>
              <div className="success-alert-description">
                Password reset successful. You can now log in with your new password.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;