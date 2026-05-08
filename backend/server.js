require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth.routes');
const artworkRoutes = require('./routes/artwork.routes');
const artistRoutes = require('./routes/artist.routes');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require("./routes/Event.routes");
const bookingRoutes = require("./routes/Booking.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------------
// MongoDB Connection
// -----------------------------
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('🎯 MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// -----------------------------
// Create HTTP Server + Socket.IO
// -----------------------------
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

global.io = io;

// -----------------------------
// Socket.IO Authentication Middleware
// -----------------------------
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("Token required"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
});

// -----------------------------
// Socket.IO Events (Merged)
// -----------------------------
io.on('connection', (socket) => {
    console.log("🟢 مستخدم متصل:", socket.userId || socket.id);

    // ✅ انضمام لغرفة خاصة بالمستخدم
    socket.join(`user:${socket.userId}`);
    
    // ✅ انضمام لغرف الأدمن (إذا كان المستخدم أدمن)
    const userRole = socket.handshake.auth.role; // 'super_admin', 'users_admin', 'artwork_admin'
    if (userRole && ['super_admin', 'users_admin', 'artwork_admin'].includes(userRole)) {
        socket.join(`admin-role:${userRole}`);
        console.log(`👑 أدمن متصل: ${socket.userId} (${userRole})`);
    }

    // -------------------------
    // 💬 Private Chat System
    // -------------------------
    socket.on('private-message', (data) => {
        const { recipientId, content, conversationId } = data;

        io.to(`user:${recipientId}`).emit('new-message', {
            from: socket.userId,
            fromUsername: socket.username,
            content,
            conversationId,
            timestamp: new Date()
        });
        
            socket.on('join-user', (userId) => {
        if (userId === socket.userId) {
            socket.join(`user:${userId}`);
            console.log(`📌 (حدث) المستخدم ${userId} انضم للغرفة user:${userId}`);
            socket.emit('join-confirm', { userId, success: true });
        }
    });

        socket.emit('message-sent', {
            success: true,
            content,
            conversationId,
            timestamp: new Date()
        });
    });

    socket.on('typing', ({ recipientId, isTyping, conversationId }) => {
        io.to(`user:${recipientId}`).emit('user-typing', {
            userId: socket.userId,
            username: socket.username,
            isTyping,
            conversationId
        });
    });

    socket.on('mark-read', ({ conversationId, messageIds }) => {
        io.to(`user:${socket.userId}`).emit('messages-read', {
            conversationId,
            messageIds
        });
    });
    

    // -------------------------
    // 🎭 Event Rooms System
    // -------------------------
    socket.on('join-event', (eventId) => {
        socket.join(`event:${eventId}`);
        console.log(`📌 مستخدم انضم لغرفة الفعالية ${eventId}`);
    });

    socket.on('leave-event', (eventId) => {
        socket.leave(`event:${eventId}`);
        console.log(`📌 مستخدم غادر غرفة الفعالية ${eventId}`);
    });

    // -------------------------
    // Disconnect
    // -------------------------
    socket.on('disconnect', () => {
        console.log("🔴 مستخدم قطع الاتصال:", socket.id);
    });
});

// Make io available in controllers
app.set('io', io);

// -----------------------------
// Routes
// -----------------------------
app.get('/', (req, res) => {
    res.send('🚀 ArtsGateway API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/user', userRoutes);

app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/report', require('./routes/reports.routes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin/artworks', require('./routes/admin.artworks'));
app.use('/api/admin/users', require('./routes/admin.users'));

app.use("/api/booking", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/notifications', notificationRoutes);

// -----------------------------
// Start Server
// -----------------------------
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log("📡 Socket.IO ready for connections");
});
