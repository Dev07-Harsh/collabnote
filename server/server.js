import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import Note from './models/Note.js';
import User from './models/user.js';
import jwt  from 'jsonwebtoken';

dotenv.config();
const app    = express();
app.set('trust proxy', true);
const server = http.createServer(app);

// Connect to MongoDB
connectDB();


// Rate‑limit: max 100 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',  authRoutes);
app.use('/api/notes', notesRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Socket.IO setup
import { Server as SocketServer } from 'socket.io';
const io = new SocketServer(server, { cors: { origin: '*' } });

// In‑memory map: noteId → Set of userIds
const roomMembers = {};

// Auth sockets
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', socket => {
  console.log('WS client connected:', socket.id);

  socket.on('joinNote', async noteId => {
    const note = await Note.findById(noteId);
    if (!note) return;
    // only owner or shared
    if (note.owner.toString() !== socket.userId && !note.isShared) {
      socket.emit('error', 'Not authorized to join this note');
      return;
    }
    socket.join(noteId);
    // add user to room
    roomMembers[noteId] = roomMembers[noteId] || new Set();
    roomMembers[noteId].add(socket.userId);
    // broadcast updated list
    const users = await User.find({ _id: [...roomMembers[noteId]] }).select('username');
    io.in(noteId).emit('activeUsers', users.map(u => ({ id: u._id, username: u.username })));
  });

  socket.on('leaveNote', noteId => {
    socket.leave(noteId);
    if (roomMembers[noteId]) {
      roomMembers[noteId].delete(socket.userId);
      (async () => {
        const users = await User.find({ _id: [...roomMembers[noteId]] }).select('username');
        io.in(noteId).emit('activeUsers', users.map(u => ({ id: u._id, username: u.username })));
      })();
    }
  });

  socket.on('editNote', async ({ noteId, content }) => {
    try {
      const updated = await Note.findByIdAndUpdate(
        noteId, { content }, { new: true }
      );
      socket.to(noteId).emit('noteUpdated', updated);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    // remove from all rooms
    for (const noteId in roomMembers) {
      if (roomMembers[noteId].has(socket.userId)) {
        roomMembers[noteId].delete(socket.userId);
        (async () => {
          const users = await User.find({ _id: [...roomMembers[noteId]] }).select('username');
          io.in(noteId).emit('activeUsers', users.map(u => ({ id: u._id, username: u.username })));
        })();
      }
    }
    console.log('WS client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));