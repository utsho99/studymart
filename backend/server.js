require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const noteRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const pyqRoutes = require('./routes/pyq');
const seniorRoutes = require('./routes/seniors');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});
initSocket(io);

app.use(cors({
  origin: [
    'https://studymartbd.shop',
    'https://www.studymartbd.shop',
    'https://studymart-nine.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/seniors', seniorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'StudyMart API running' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studymart')
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

module.exports = { app, io };
