import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './SharedStyles.css';

const PasswordInput = ({ value, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="password-input-container">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="form-input password-input"
        {...props}
      />
      <button
        type="button"
        className={`password-toggle-button ${showPassword ? 'visible' : ''}`}
        onClick={togglePasswordVisibility}
      >
        {showPassword ? <Eye className="password-toggle-icon" /> : <EyeOff className="password-toggle-icon" />}
      </button>
    </div>
  );
};

export default PasswordInput;