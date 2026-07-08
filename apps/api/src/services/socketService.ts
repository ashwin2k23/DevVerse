import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

// Track online users: { clerkId -> socketId }
const onlineUsers = new Map<string, string>();

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Auth ───────────────────────────────────────────────────────────────
    socket.on('authenticate', (clerkId: string) => {
      onlineUsers.set(clerkId, socket.id);
      socket.data.clerkId = clerkId;
      io.emit('user:online', { clerkId, online: true });
      console.log(`User ${clerkId} authenticated on socket ${socket.id}`);
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
      if (clerkId) {
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
