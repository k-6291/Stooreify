import React, { useState, useEffect, useRef } from 'react';
import useAtlas from '../hooks/useAtlas';
import AtlasMessage from './AtlasMessage';
import '../styles/AtlasChatModal.css';

const AtlasChatModal = ({ onClose, darkMode = false }) => {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading } = useAtlas();
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // التمرير التلقائي إلى آخر الرسائل
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`atlas-modal-overlay ${darkMode ? 'dark-mode' : ''}`}>
      <div className="atlas-modal">
        <div className="atlas-modal-header">
          <h3>أطلس — مساعدك الذكي 🧠</h3>
          <button className="atlas-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="atlas-chat-body">
          {messages.map((msg, index) => (
            <AtlasMessage
              key={index}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          {isLoading && (
            <div className="atlas-message atlas">
              <div className="atlas-avatar">🧠</div>
              <div className="message-content">
                <div className="message-text">أكتب...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="atlas-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="اسأل أطلس أي شيء عن متجرك..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default AtlasChatModal;