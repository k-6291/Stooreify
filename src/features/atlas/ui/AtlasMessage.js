// frontend/src/features/atlas/ui/AtlasMessage.js
import React from 'react';
import '../styles/AtlasChatModal.css';

const AtlasMessage = ({ message, isUser, timestamp }) => {
  return (
    <div className={`atlas-message ${isUser ? 'user' : 'atlas'}`}>
      {!isUser && (
        <div className="atlas-avatar">
          🧠
        </div>
      )}
      <div className="message-content">
        <div className="message-text">{message}</div>
        <div className="message-time">
          {timestamp ? new Date(timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
      {isUser && <div className="user-avatar">👤</div>}
    </div>
  );
};

export default AtlasMessage;