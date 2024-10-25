import React, { useState, useEffect } from 'react';
import { User, Edit, Save } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import { useNavigate } from 'react-router-dom';
import './SharedStyles.css';

const UserProfile = ({ handleOwnerLogout }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile', {
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

      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile', {
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

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={handleOwnerLogout}
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">Loading profile...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={profile.profile_picture_url || '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover bg-gray-100"
                  />
                  {isEditing && (
                    <input
                      type="file"
                      name="profile_picture"
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        profile_picture: e.target.files[0]
                      })}
                      className="text-sm"
                      accept="image/*"
                    />
                  )}
                </div>

                {/* Read-only Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={profile.username || ''}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                      disabled
                    />
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editedProfile.full_name || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        full_name: e.target.value
                      })}
                      disabled={!isEditing}
                      className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={editedProfile.contact_number || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        contact_number: e.target.value
                      })}
                      disabled={!isEditing}
                      className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        bio: e.target.value
                      })}
                      disabled={!isEditing}
                      rows={4}
                      className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 ${
                        !isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;