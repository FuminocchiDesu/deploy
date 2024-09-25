// src/components/AdminSide/IssueReporting.js
import React, { useState } from 'react';
import axios from 'axios';

const IssueReporting = ({ coffeeShopId, onClose }) => {
  const [issueDescription, setIssueDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/issues/`, {
        coffeeShopId,
        description: issueDescription,
      });
      alert('Issue reported successfully!');
      onClose();
    } catch (error) {
      console.error('Error reporting issue:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={issueDescription} 
        onChange={(e) => setIssueDescription(e.target.value)} 
        placeholder="Describe the issue..." 
        required 
      />
      <button type="submit">Report Issue</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default IssueReporting;
