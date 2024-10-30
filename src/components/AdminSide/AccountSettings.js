import React, { useState } from 'react';
import { Edit, Save } from 'lucide-react';
import './temp.css';

const AccountSettings = () => {
  const [activeModal, setActiveModal] = useState(null); // null, 'password', 'email', 'username'
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
      setActiveModal(null);
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
      setActiveModal(null);
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
      setActiveModal(null);
    } catch (error) {
      alert(`Error changing username: ${error.message}`);
    }
  };


  return (
    <div className="card-content">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <button className="button primary" onClick={() => setActiveModal('password')}>Change Password</button>
        </div>
        <div className="form-group">
          <button className="button primary" onClick={() => setActiveModal('email')}>Change Email</button>
        </div>
        <div className="form-group">
          <button className="button primary" onClick={() => setActiveModal('username')}>Change Username</button>
        </div>
      </div>

      {activeModal === 'password' && (
        <div className="modal" style={{ display: activeModal === 'password' ? 'block' : 'none' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Change Password</h2>
              <span className="close-button" onClick={() => setActiveModal(null)}>&times;</span>
            </div>
            <div className="modal-body">
              {!passwordVerified && (
                <div className="form-group">
                  <label htmlFor="old-password">Old Password</label>
                  <input
                    type="password"
                    id="old-password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button className="button primary" onClick={handleVerifyPassword}>
                    Verify Password
                  </button>
                </div>
              )}
              {passwordVerified && (
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="button primary">Change Password</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'email' && (
        <div className="modal" style={{ display: activeModal === 'email' ? 'block' : 'none' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Change Email</h2>
              <span className="close-button" onClick={() => setActiveModal(null)}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleChangeEmail}>
                <div className="form-group">
                  <label htmlFor="new-email">New Email</label>
                  <input
                    type="email"
                    id="new-email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="button primary">Change Email</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'username' && (
        <div className="modal" style={{ display: activeModal === 'username' ? 'block' : 'none' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Change Username</h2>
              <span className="close-button" onClick={() => setActiveModal(null)}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleChangeUsername}>
                <div className="form-group">
                  <label htmlFor="new-username">New Username</label>
                  <input
                    type="text"
                    id="new-username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="button primary">Change Username</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;