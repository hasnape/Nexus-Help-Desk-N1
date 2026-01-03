import React from 'react';
import './ai-button.css';

export const AIButton: React.FC<{ onClick?: ()=>void }> = ({ onClick }) => {
  return (
    <button className="nexus-ai-btn" onClick={onClick} aria-label="AI Assistant">
      ✨
    </button>
  );
};

export default AIButton;
