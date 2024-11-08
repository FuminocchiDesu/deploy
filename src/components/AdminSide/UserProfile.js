import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, X, Camera } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import AccountSettings from './AccountSettings';
import { CoffeeLoader } from '../ui/CoffeeLoader';
import './UserProfile.css';

const ProfileImage = ({ profile, isEditing, handleImageChange }) => {
  return (
    <div className="profile-image-container">
      <label htmlFor="profile-picture" className="profile-image-wrapper">
        <img
          src={profile.profile_picture_url || '/placeholder.svg?height=128&width=128'}
          alt="Profile"
          className="profile-image"
        />
        {isEditing && (
          <div className="profile-image-overlay">
            <Camera className="edit-icon" />
          </div>
        )}
      </label>
      <input
        type="file"
        id="profile-picture"
        className="image-input"
        onChange={handleImageChange}
        accept="image/*"
      />
    </div>
  );
};

const ProfileTab = ({ profile, editedProfile, isEditing, setIsEditing, handleSave, handleCancel, handleImageChange, setEditedProfile }) => (
  <div className="profile-card">
    <div className="card-header">
      <h2 className="card-title">Profile Information</h2>
      <div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="button button-edit"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        ) : (
          <div>
            <button
              onClick={handleSave}
              className="button button-save"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="button button-cancel"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    <ProfileImage
      profile={profile}
      isEditing={isEditing}
      handleImageChange={handleImageChange}
    />

    <div className="user-info">
      <h3 className="user-name">{profile.username}</h3>
      <p className="user-email">{profile.email}</p>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          className="form-input"
          value={editedProfile.full_name || ''}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            full_name: e.target.value
          })}
          disabled={!isEditing}
          placeholder="Enter your full name"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Contact Number</label>
        <input
          className="form-input"
          value={editedProfile.contact_number || ''}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            contact_number: e.target.value
          })}
          disabled={!isEditing}
          placeholder="Enter your contact number"
        />
      </div>
    </div>

    <div className="form-group">
      <label className="form-label">Bio</label>
      <textarea
        className="form-textarea"
        value={editedProfile.bio || ''}
        onChange={(e) => setEditedProfile({
          ...editedProfile,
          bio: e.target.value
        })}
        disabled={!isEditing}
        placeholder="Tell us about yourself"
        rows={4}
      />
    </div>
  </div>
);

const UserProfile = ({ handleOwnerLogout }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const token = localStorage.getItem('ownerToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
        // Keep showing loader for remaining time
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    } catch (err) {
      setError(err.message);
      handleOwnerLogout();
      navigate('/admin-login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Only append changed fields
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== profile[key]) {
          formData.append(key, editedProfile[key]);
        }
      });

      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProfile({
          ...editedProfile,
          profile_picture: file
        });
        setProfile({
          ...profile,
          profile_picture_url: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem="Profile"
        handleMenuItemClick={(item) => navigate(item.path)}
        onLogout={handleOwnerLogout}
      />
      <main className="profile-container">
      {isLoading ? (
          <div className="loader-container">
            <CoffeeLoader size={80} color="#8B4513" />
          </div>
        ) : (
          <div>
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'account-settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('account-settings')}
          >
            Account Settings
          </button>
        </div>

        {activeTab === 'profile' ? (
          <ProfileTab
            profile={profile}
            editedProfile={editedProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleImageChange={handleImageChange}
            setEditedProfile={setEditedProfile}
          />
        ) : (
          <div className="profile-card">
            <AccountSettings />
          </div>
        )}
        </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;