import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { AlertCircle, Mail, Loader2, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react'

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleRequestCode = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/password-reset/', { email_or_username: emailOrUsername })
      if (response.data.success) {
        setStep(2)
      } else {
        setError(response.data.error)
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/password-reset/verify/', {
        email_or_username: emailOrUsername,
        reset_code: resetCode,
      })
      if (response.data.success) {
        setStep(3)
      } else {
        setError(response.data.error)
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/password-reset/confirm/', {
        email_or_username: emailOrUsername,
        new_password: newPassword,
        code: resetCode,
      })
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/admin-login'
        }, 2000)
      } else {
        setError(response.data.error)
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      
      <div className="login-card">
      <Link 
        to="/admin-login" 
        className="absolute left-4 top-4 flex items-center text-brown-600 hover:text-brown-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Login
      </Link>
        <div className="login-header">
          
          <h2 className="login-title">Forgot Password</h2>
          <p className="login-description">
            {step === 1 && "Enter your email or username to get a reset code"}
            {step === 2 && "Enter the reset code sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>
        <div className="login-form">
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
                    <Loader2 className="submit-button-icon animate-spin" />
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
                    <Loader2 className="submit-button-icon animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    <Check className="submit-button-icon" />
                    Verify Code
                  </>
                )}
              </button>
              <button
                className="button outline full-width"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2" />
                Back
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <div className="password-input-container">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input password-input"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`password-toggle-button ${showPassword ? 'visible' : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="password-toggle-icon" />
                  ) : (
                    <Eye className="password-toggle-icon" />
                  )}
                </button>
              </div>
              <button
                className="submit-button"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="submit-button-icon animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Check className="submit-button-icon" />
                    Reset Password
                  </>
                )}
              </button>
              <button
                className="button outline full-width"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-2" />
                Back
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
            <div className="alert success">
              <Check className="mr-2" />
              <div>
                <div className="font-bold">Success</div>
                <div>Password reset successful. You can now log in with your new password.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword