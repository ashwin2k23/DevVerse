import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const eventInclude = {
  community: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      registrations: true,
    },
  },
};

export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(type && type !== 'All' && { type: String(type) }),
      },
      include: eventInclude,
      orderBy: { startAt: 'asc' },
    });

    let eventsWithAuth = events;
    if (req.clerkId) {
      const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (currentUser) {
        const eventIds = events.map((e: any) => e.id);
        const registrations = await prisma.eventRegistration.findMany({
          where: {
            userId: currentUser.id,
            eventId: { in: eventIds },
          },
          select: { eventId: true },
        });
        const registeredIds = new Set(registrations.map((r: any) => r.eventId));

        const bookmarks = await prisma.bookmark.findMany({
          where: {
            userId: currentUser.id,
            targetType: 'EVENT',
            eventId: { in: eventIds },
          },
          select: { eventId: true },
        });
        const bookmarkedIds = new Set(bookmarks.map((b: any) => b.eventId));

        eventsWithAuth = events.map((e: any) => ({
          ...e,
          isRegistered: registeredIds.has(e.id),
          isBookmarked: bookmarkedIds.has(e.id),
        })) as any;
      }
    }

    res.json({ success: true, data: eventsWithAuth });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, type, startAt, endAt, bannerUrl, location, isOnline, communityId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    // Only allow moderators/admin/creators to create events if communityId is supplied
    if (communityId) {
      const membership = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId: user.id } },
      });
      if (!membership || membership.role === 'MEMBER') {
        throw createError('Unauthorized to create community event', 403);
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: String(type),
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        bannerUrl,
        location,
        isOnline: !!isOnline,
        communityId: communityId || null,
      },
      include: eventInclude,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ...eventInclude,
        registrations: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!event) throw createError('Event not found', 404);

    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const registerForEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId, userId: user.id } },
      create: { eventId, userId: user.id },
      update: {},
    });

    res.json({ success: true, message: 'Registered for event successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const unregisterFromEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.eventRegistration.delete({
      where: { eventId_userId: { eventId, userId: user.id } },
    });

    res.json({ success: true, message: 'Unregistered from event successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const bookmarkEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.bookmark.create({
      data: {
        userId: user.id,
        targetType: 'EVENT',
        eventId,
      },
    });

    res.json({ success: true, message: 'Event bookmarked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bookmark event' });
  }
};

export const unbookmarkEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        targetType: 'EVENT',
        eventId,
      },
    });

    res.json({ success: true, message: 'Event unbookmarked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unbookmark event' });
  }
};
