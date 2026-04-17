// frontend/src/features/atlas/hooks/useAtlas.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const useAtlas = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب رسالة الترحيب عند التحميل
  useEffect(() => {
    const fetchWelcome = async () => {
      if (!user?.token) return;
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/atlas/welcome', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setMessages([{ text: data.reply, isUser: false, timestamp: new Date() }]);
      } catch (error) {
        setMessages([{ text: "عذرًا، حدث خطأ في تحميل الترحيب.", isUser: false, timestamp: new Date() }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcome();
  }, [user?.token]);

  const sendMessage = async (text) => {
    if (!user?.token || !text.trim()) return;

    const userMessage = { text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/atlas/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      const atlasReply = { text: data.reply, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, atlasReply]);
    } catch (error) {
      const errorMsg = { text: "عذرًا، فشل الاتصال بأطلس. حاول لاحقًا.", isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};

export default useAtlas;