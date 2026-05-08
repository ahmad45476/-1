// client/src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ جلب المحادثات عند تسجيل الدخول
  useEffect(() => {
    if (currentUser && token) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [currentUser, token]);

  // ✅ دالة جلب المحادثات
  const fetchConversations = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/chat/conversations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(response.data.data);
    } catch (error) {
      console.error('❌ خطأ في جلب المحادثات:', error);
    } finally {
      setLoading(false);
    }
  };
  // في ChatContext.jsx - أضف هذه الدالة
const deleteMessage = async (messageId, conversationId) => {
  if (!token) return false;
  
  try {
    await axios.delete(
      `${API_BASE}/api/chat/message/${messageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // حذف الرسالة من الحالة المحلية
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.filter(msg => msg._id !== messageId)
    }));
    
    return true;
  } catch (error) {
    console.error("خطأ في حذف الرسالة:", error);
    return false;
  }
};

// وأضفها في الـ Provider value


  // ✅ دالة بدء محادثة جديدة
  const startConversation = async (recipientId) => {
    if (!token) return null;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat/start',
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // تحديث قائمة المحادثات
      await fetchConversations();
      
      return response.data.data;
    } catch (error) {
      console.error('❌ خطأ في بدء المحادثة:', error);
      return null;
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      loading,
       deleteMessage,
      fetchConversations,
      startConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
};