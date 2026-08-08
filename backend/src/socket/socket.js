import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const setupSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name}`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.user._id}`);

    // Join a project room
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`${socket.user.name} joined project:${projectId}`);
    });

    // Leave a project room
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Join a task room (for live comments)
    socket.on('join:task', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('leave:task', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('typing:start', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on('typing:stop', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('typing:stop', { userId: socket.user._id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });
};
