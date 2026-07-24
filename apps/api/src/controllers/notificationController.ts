import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';


export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.clerkId) {
      return res.json({ success: true, data: [] });
    }
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) return res.json({ success: true, data: [] });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.clerkId) {
      return res.json({ success: true, data: { count: 0 } });
    }
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) return res.json({ success: true, data: { count: 0 } });

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
      },
    });

    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.notificationId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw createError('Notification not found', 404);
    if (notification.userId !== user.id) throw createError('Forbidden', 403);

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.notificationId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw createError('Notification not found', 404);
    if (notification.userId !== user.id) throw createError('Forbidden', 403);

    await prisma.notification.delete({ where: { id: notificationId } });
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
