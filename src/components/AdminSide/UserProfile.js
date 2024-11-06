import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Save } from 'lucide-react'
import SidebarMenu from './SideBarMenu'
import './SharedStyles.css'
import AccountSettings from './AccountSettings'
import { CoffeeLoader } from '../ui/CoffeeLoader'

const UserProfile = ({ handleOwnerLogout }) => {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState(null)
  const [editedProfile, setEditedProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeMenuItem, setActiveMenuItem] = useState('Profile')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data)
      setEditedProfile(data)
      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
      handleOwnerLogout()
      navigate('/admin-login')
    }
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== profile[key]) {
          formData.append(key, editedProfile[key])
        }
      })

      const response = await fetch('https://khlcle.pythonanywhere.com/api/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to update profile')

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name)
    navigate(item.path)
  }

  if (isLoading) {
    return <div className="loading-container">Loading profile...</div>
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    )
  }

  const buttonStyle = {
    backgroundColor: '#a0522d',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px', // This adds 2px space between the icon and the text
  };

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={handleOwnerLogout}
      />
      <main className="main-content">
      {isLoading ? (
            <div className="loader-container">
              <CoffeeLoader size={80} color="#8B4513" />
            </div>
          ) : (
            <div>
        <div className="card-dom">
          <div className="card-header">
            <h2 className="card-title">Profile Information</h2>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="button primary"
              style={buttonStyle}
            >
              {isEditing ? <Save className="mr-2 h-4 w-4" size={15}/> : <Edit className="mr-2 h-4 w-4" size={15}/>}
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={profile.profile_picture_url || '/placeholder.svg?height=128&width=128'}
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
                    className="form-input text-sm"
                    accept="image/*"
                  />
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input id="username" className="form-input" value={profile.username || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" className="form-input" type="email" value={profile.email || ''} disabled />
                  </div>
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
          </div><AccountSettings/>
        </div>
        )}
      </main>
    </div>
  )
}

export default UserProfile