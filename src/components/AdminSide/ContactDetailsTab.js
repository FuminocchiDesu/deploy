import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SharedStyles.css';

const ContactDetailsTab = ({ coffeeShopId, isEditMode }) => {
  const [contactInfo, setContactInfo] = useState({
    contact_name: '',
    primary_phone: '',
    secondary_phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  useEffect(() => {
    fetchContactInfo();
  }, [coffeeShopId]);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(
        `https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/contact/`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }
      );
      setContactInfo(response.data);
      setIsExisting(true);
    } catch (error) {
      console.error('Error fetching contact information:', error);
      // Only set error if it's not a 404, since 404 is expected for new shops
      if (error.response?.status !== 404) {
        setError('Failed to fetch contact information');
      }
      setIsExisting(false);
    }
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const method = isExisting ? 'put' : 'post';
      const response = await axios({
        method,
        url: `https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/contact/`,
        data: contactInfo,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'application/json'
        }
      });

      setContactInfo(response.data);
      setIsExisting(true);
      setSuccess('Contact information updated successfully');

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating contact information:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        'Failed to update contact information'
      );
    }
  };

  return (
    <div className="contact-details-tab">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="contact_name">Contact Name</label>
            <input
              type="text"
              name="contact_name"
              id="contact_name"
              value={contactInfo.contact_name || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="Contact Person's Name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="primary_phone">Primary Phone</label>
            <input
              type="tel"
              name="primary_phone"
              id="primary_phone"
              value={contactInfo.primary_phone || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="+1234567890"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="secondary_phone">Secondary Phone</label>
            <input
              type="tel"
              name="secondary_phone"
              id="secondary_phone"
              value={contactInfo.secondary_phone || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="+1234567890"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={contactInfo.email || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="contact@example.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              name="website"
              id="website"
              value={contactInfo.website || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="facebook">Facebook</label>
            <input
              type="url"
              name="facebook"
              id="facebook"
              value={contactInfo.facebook || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="https://facebook.com/your-page"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="instagram">Instagram</label>
            <input
              type="url"
              name="instagram"
              id="instagram"
              value={contactInfo.instagram || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="https://instagram.com/your-handle"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="twitter">Twitter</label>
            <input
              type="url"
              name="twitter"
              id="twitter"
              value={contactInfo.twitter || ''}
              onChange={handleContactInfoChange}
              disabled={!isEditMode}
              className="form-input"
              placeholder="https://twitter.com/your-handle"
            />
          </div>
        </div>

        {error && <div className="error-message mt-4">{error}</div>}
        {success && <div className="success-message mt-4">{success}</div>}

        {isEditMode && (
          <div className="flex justify-end mt-4">
            <button type="submit" className="button primary">
              Save Contact Information
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactDetailsTab;