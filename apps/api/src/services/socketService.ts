import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

// Track online users: { clerkId -> socketId }
const onlineUsers = new Map<string, string>();

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Auth ───────────────────────────────────────────────────────────────
    socket.on('authenticate', async (clerkId: string) => {
      try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (user) {
          onlineUsers.set(user.id, socket.id);
          socket.data.userId = user.id;
          socket.data.clerkId = clerkId;
          io.emit('user:online', { clerkId: user.id, online: true });
          console.log(`User ${user.id} (clerk: ${clerkId}) authenticated on socket ${socket.id}`);
        } else {
          // Fallback if user is not in DB yet
          onlineUsers.set(clerkId, socket.id);
          socket.data.clerkId = clerkId;
          io.emit('user:online', { clerkId, online: true });
          console.log(`User ${clerkId} (un-synced) authenticated on socket ${socket.id}`);
        }
      } catch (err) {
        console.error('Socket auth lookup error:', err);
      }
    });

    // ─── Join conversation room ──────────────────────────────────────────────
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ─── Typing indicator ────────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId, clerkId }: { conversationId: string; clerkId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { clerkId });
    });

    socket.on('typing:stop', ({ conversationId, clerkId }: { conversationId: string; clerkId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { clerkId });
    });

    // ─── New message (real-time push) ────────────────────────────────────────
    socket.on('message:send', async ({ conversationId, message }: { conversationId: string; message: object }) => {
      io.to(`conversation:${conversationId}`).emit('message:new', message);
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const clerkId = socket.data.clerkId;
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user:online', { clerkId: userId, online: false });
      } else if (clerkId) {
        onlineUsers.delete(clerkId);
        io.emit('user:online', { clerkId, online: false });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const emitNotification = (io: Server, userId: string, notification: object) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification:new', notification);
  }
};

export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};
