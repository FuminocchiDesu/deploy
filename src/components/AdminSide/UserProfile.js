import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, Pencil } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import AccountSettings from './AccountSettings';
import { CoffeeLoader } from '../ui/CoffeeLoader';

const UserProfile = ({ handleOwnerLogout }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Profile');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      handleOwnerLogout();
      navigate('/admin-login');
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
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

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <CoffeeLoader size={80} color="#8B4513" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={handleOwnerLogout}
      />
      <main className="main-content">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'account-settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('account-settings')}
          >
            Account Settings
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="card-dom">
              <div className="card-header">
                <h2 className="card-title">Profile Information</h2>
                {/* Removed old edit button */}
              </div>
              <div className="card-content">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32">
                    <img
                      src={profile.profile_picture_url || '/placeholder.svg?height=128&width=128'}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover bg-gray-100 absolute inset-0"
                    />
                  </div>
                  <input
                    type="file"
                    id="profile-picture-input"
                    className="mt-4"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditedProfile({
                          ...editedProfile,
                          profile_picture: file
                        });
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setProfile({
                            ...profile,
                            profile_picture_url: e.target.result
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    accept="image/*"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-lg">{profile.username}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="full_name" className="form-label">Full Name</label>
                      <input
                        id="full_name"
                        className="form-input"
                        value={editedProfile.full_name || ''}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          full_name: e.target.value
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact_number" className="form-label">Contact Number</label>
                      <input
                        id="contact_number"
                        className="form-input"
                        value={editedProfile.contact_number || ''}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          contact_number: e.target.value
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      id="bio"
                      className="form-textarea"
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        bio: e.target.value
                      })}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'account-settings' && (
            <div className="card-dom">
              <AccountSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;