import React, { useState } from 'react';
import { Lock, Mail, User, X } from 'lucide-react';
import './temp.css';

const AccountSettings = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);

  const handleVerifyPassword = async () => {
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/verify-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword }),
      });
      const data = await response.json();
      if (data.isValid) {
        setPasswordVerified(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert(`Error verifying password: ${error.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await response.json();
      alert(data.message);
      handleCloseModal();
    } catch (error) {
      alert(`Error changing password: ${error.message}`);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/update-email/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_email: newEmail }),
      });
      const data = await response.json();
      alert(data.message);
      handleCloseModal();
    } catch (error) {
      alert(`Error changing email: ${error.message}`);
    }
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/update-username/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_username: newUsername }),
      });
      const data = await response.json();
      alert(data.message);
      handleCloseModal();
    } catch (error) {
      alert(`Error changing username: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewEmail('');
    setNewUsername('');
    setPasswordVerified(false);
  };

  return (
    <div className="settings-container">
      <div className="settings-grid">
        <div className="settings-card" onClick={() => setActiveModal('password')}>
          <div className="icon-wrapper">
            <Lock size={24} />
          </div>
          <span>Change Password</span>
        </div>

        <div className="settings-card" onClick={() => setActiveModal('email')}>
          <div className="icon-wrapper">
            <Mail size={24} />
          </div>
          <span>Change Email</span>
        </div>

        <div className="settings-card" onClick={() => setActiveModal('username')}>
          <div className="icon-wrapper">
            <User size={24} />
          </div>
          <span>Change Username</span>
        </div>
      </div>

      {/* Password Modal */}
      <div className={`modal ${activeModal === 'password' ? 'show' : ''}`}>
        <div className="modal-content">
          <button className="close-button" onClick={handleCloseModal}>
            <X size={24} />
          </button>
          
          <div className="modal-header">
            <h2 className="modal-title">Change Password</h2>
          </div>

          {!passwordVerified ? (
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <button className="button" onClick={handleVerifyPassword}>
                Verify Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="form-container">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="button">
                Change Password
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <div className={`modal ${activeModal === 'email' ? 'show' : ''}`}>
        <div className="modal-content">
          <button className="close-button" onClick={handleCloseModal}>
            <X size={24} />
          </button>
          
          <div className="modal-header">
            <h2 className="modal-title">Change Email</h2>
          </div>

          <form onSubmit={handleChangeEmail} className="form-container">
            <div className="form-group">
              <label className="form-label">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="button">
              Change Email
            </button>
          </form>
        </div>
      </div>

      {/* Username Modal */}
      <div className={`modal ${activeModal === 'username' ? 'show' : ''}`}>
        <div className="modal-content">
          <button className="close-button" onClick={handleCloseModal}>
            <X size={24} />
          </button>
          
          <div className="modal-header">
            <h2 className="modal-title">Change Username</h2>
          </div>

          <form onSubmit={handleChangeUsername} className="form-container">
            <div className="form-group">
              <label className="form-label">New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="button">
              Change Username
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;