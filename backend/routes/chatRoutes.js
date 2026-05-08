// server/routes/chatRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const uploadMiddleware = require('../utils/upload');
// استيراد المتحكم والميدل وير
let chatController, auth;

try {
  chatController = require('../controllers/ChatController');
  console.log('✅ ChatController loaded successfully');
} catch (error) {
  console.error('❌ Error loading ChatController:', error.message);
}

try {
  auth = require('../middleware/auth');
  console.log('✅ Auth middleware loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth middleware:', error.message);
}

// إذا فشل التحميل، نوقف التنفيذ
if (!chatController || !auth) {
  console.error('❌ Required modules not loaded. Exiting...');
  process.exit(1);
}

// جميع مسارات المحادثة تحتاج مصادقة
router.use(authenticate);

// مسارات المحادثات
router.post('/start', chatController.startConversation);
router.post('/send', chatController.sendMessage);
router.get('/conversations', chatController.getUserConversations);
router.post('/send-image',authenticate, uploadMiddleware, chatController.sendImage);
router.get('/messages/:conversationId', chatController.getConversationMessages);
router.delete('/message/:messageId', chatController.deleteMessage);
router.delete('/conversation/:conversationId', authenticate, chatController.deleteConversation);
router.put('/read/:conversationId', chatController.markAsRead);

module.exports = router;