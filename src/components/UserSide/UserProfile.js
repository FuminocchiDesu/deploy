// frontend/src/components/UserSide/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('profile/');
      console.log('Profile data:', response.data);
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response && error.response.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('An error occurred while fetching your profile. Please try again.');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append only the fields that are changed
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== profile[key]) {
          formData.append(key, editedProfile[key]);
        }
      });
  
      const response = await axiosInstance.put('profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleResetPassword = async () => {
    try {
      await axiosInstance.post('reset-password/');
      setError('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to send password reset email');
    }
  };
  
  if (!profile) return <div>Loading...</div>;

  console.log('Rendered profile:', profile);

  return (
    <div className="user-profile">
      <div className="navigation">
        <Link to="/coffee-shops" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Coffee Shops
        </Link>
      </div>
      <h2>User Profile</h2>
      {error && <p className="error">{error}</p>}
      <div className="read-only-info">
        <p><strong>Username:</strong> {profile.username || 'N/A'}</p>
        <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
        <button onClick={handleResetPassword}>Reset Password</button>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              name="full_name"
              value={editedProfile.full_name || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Bio:</label>
            <textarea
              name="bio"
              value={editedProfile.bio || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Contact Number:</label>
            <input
              type="text"
              name="contact_number"
              value={editedProfile.contact_number || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Profile Picture:</label>
            <input
              type="file"
              name="profile_picture"
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, profile_picture: e.target.files[0] })
              }
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </form>
      ) : (
        <div>
          <p><strong>Full Name:</strong> {profile.full_name || 'N/A'}</p>
          <p><strong>Bio:</strong> {profile.bio || 'N/A'}</p>
          <p><strong>Contact Number:</strong> {profile.contact_number || 'N/A'}</p>
          {profile.profile_picture_url && (
            <img 
              src={profile.profile_picture_url} 
              alt="Profile" 
              className="profile-picture" 
              onError={(e) => {
                e.target.onerror = null; 
                
              }}
            />
          )}
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;