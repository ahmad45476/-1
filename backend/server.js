require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const artworkRoutes = require('./routes/artwork.routes');
const artistRoutes=require('./routes/artist.routes')
const userRoutes=require('./routes/user.routes')
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

// اتصال MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🎯 MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('🚀 ArtsGateway API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/artist',artistRoutes)
app.use('/api/user',userRoutes)
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/financial', require('./routes/financial.routes'));
app.use('/api/reports', require('./routes/report.routes'));
// Error handling middleware
app.use('/api/admin/artworks', require('./routes/admin.artworks'));
app.use('/api/admin/users', require('./routes/admin.users'));
app.use('/api/admin/financial', require('./routes/admin.financial'));
app.use('/api/admin/reports', require('./routes/admin.reports'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});