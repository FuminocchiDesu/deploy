import React from 'react';
import './Switch.css'; // We'll create this CSS file next

const Switch = ({ id, checked, onChange, disabled }) => {
  return (
    <div className="switch">
      <input
        type="checkbox"
        id={id}
        className="switch-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id} className="switch-label">
        <span className="switch-button" />
      </label>
    </div>
  );
};

export default Switch;