import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ChevronRight } from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(null);
  const [verificationPurpose, setVerificationPurpose] = useState(null);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
  });
  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
  });

  const handleVerification = () => {
    // Implement password verification logic here
    setModalVisible(verificationPurpose);
    setVerificationPassword('');
  };

  const handleLogout = () => {
    // Implement logout logic here
  };

  const handleSuccessfulUpdate = (modalType) => {
    alert(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} updated successfully. Please Login again.`);
    setModalVisible(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setEmailForm({ newEmail: '' });
    setUsernameForm({ newUsername: '' });
    handleLogout();
  };

  const handleChangePassword = () => {
    const { newPassword, confirmPassword } = passwordForm;
    if (!newPassword || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Implement change password logic here
    handleSuccessfulUpdate('password');
  };

  const handleChangeEmail = () => {
    const { newEmail } = emailForm;
    if (!newEmail) {
      alert('Please enter a new email');
      return;
    }
    // Implement change email logic here
    handleSuccessfulUpdate('email');
  };

  const handleChangeUsername = () => {
    const { newUsername } = usernameForm;
    if (!newUsername) {
      alert('Please enter a new username');
      return;
    }
    // Implement change username logic here
    handleSuccessfulUpdate('username');
  };

  const closeModal = () => {
    setModalVisible(null);
    setVerificationPurpose(null);
    setVerificationPassword('');
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setEmailForm({ newEmail: '' });
    setUsernameForm({ newUsername: '' });
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="header-title">Account Settings</h2>
        <div className="placeholder" />
      </div>

      <div className="section">
        <MenuItem
          icon={<Lock size={20} color="#a0522d" />}
          title="Change Password"
          onPress={() => setModalVisible('password')}
        />
        <hr className="separator" />
        <MenuItem
          icon={<Mail size={20} color="#a0522d" />}
          title="Change Email"
          onPress={() => setModalVisible('email')}
        />
        <hr className="separator" />
        <MenuItem
          icon={<User size={20} color="#a0522d" />}
          title="Change Username"
          onPress={() => setModalVisible('username')}
        />
      </div>

      {modalVisible === 'verification' && (
        <VerificationModal
          closeModal={closeModal}
          verificationPassword={verificationPassword}
          setVerificationPassword={setVerificationPassword}
          handleVerification={handleVerification}
          loading={loading}
          verificationPurpose={verificationPurpose}
        />
      )}

      {modalVisible === 'password' && (
        <PasswordModal
          closeModal={closeModal}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          handleChangePassword={handleChangePassword}
          loading={loading}
        />
      )}

      {modalVisible === 'email' && (
        <EmailModal
          closeModal={closeModal}
          emailForm={emailForm}
          setEmailForm={setEmailForm}
          handleChangeEmail={handleChangeEmail}
          loading={loading}
        />
      )}

      {modalVisible === 'username' && (
        <UsernameModal
          closeModal={closeModal}
          usernameForm={usernameForm}
          setUsernameForm={setUsernameForm}
          handleChangeUsername={handleChangeUsername}
          loading={loading}
        />
      )}
    </div>
  );
};

const MenuItem = ({ icon, title, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="menu-item" 
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}
    >
      <div className="menu-item-left" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="menu-item-icon" style={{ marginRight: '3px' }}>
          {React.cloneElement(icon, { color: isHovered ? "white" : "#a0522d" })}
        </span>
        <span className="menu-item-text">{title}</span>
      </div>
      <ChevronRight 
        size={20} 
        color={isHovered ? "white" : "#a0522d"}
        style={{ marginLeft: 'auto' }}
      />
    </div>
  );
};

const VerificationModal = ({
  closeModal,
  verificationPassword,
  setVerificationPassword,
  handleVerification,
  loading,
  verificationPurpose,
}) => (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Verify Password</h2>
        <span className="close-button" onClick={closeModal}>
          &times;
        </span>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label htmlFor="verification-password">Password</label>
          <input
            type="password"
            id="verification-password"
            value={verificationPassword}
            onChange={(e) => setVerificationPassword(e.target.value)}
          />
        </div>
        <button className="button primary" onClick={handleVerification}>
          {loading ? 'Loading...' : 'Verify'}
        </button>
      </div>
    </div>
  </div>
);

const PasswordModal = ({
  closeModal,
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  loading,
}) => (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Change Password</h2>
        <span className="close-button" onClick={closeModal}>
          &times;
        </span>
      </div>
      <div className="modal-body">
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="button primary">
            {loading ? 'Loading...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

const EmailModal = ({
  closeModal,
  emailForm,
  setEmailForm,
  handleChangeEmail,
  loading,
}) => (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Change Email</h2>
        <span className="close-button" onClick={closeModal}>
          &times;
        </span>
      </div>
      <div className="modal-body">
        <form onSubmit={handleChangeEmail}>
          <div className="form-group">
            <label htmlFor="new-email">New Email</label>
            <input
              type="email"
              id="new-email"
              value={emailForm.newEmail}
              onChange={(e) =>
                setEmailForm({ ...emailForm, newEmail: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="button primary">
            {loading ? 'Loading...' : 'Change Email'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

const UsernameModal = ({
  closeModal,
  usernameForm,
  setUsernameForm,
  handleChangeUsername,
  loading,
}) => (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Change Username</h2>
        <span className="close-button" onClick={closeModal}>
          &times;
        </span>
      </div>
      <div className="modal-body">
        <form onSubmit={handleChangeUsername}>
          <div className="form-group">
            <label htmlFor="new-username">New Username</label>
            <input
              type="text"
              id="new-username"
              value={usernameForm.newUsername}
              onChange={(e) =>
                setUsernameForm({ ...usernameForm, newUsername: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="button primary">
            {loading ? 'Loading...' : 'Change Username'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

export default AccountSettings;