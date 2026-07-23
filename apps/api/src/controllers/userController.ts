import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';
import { computeUserStats } from '../utils/progression';

const userSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  headline: true,
  location: true,
  website: true,
  resumeUrl: true,
  skills: true,
  completionPct: true,
  role: true,
  level: true,
  streak: true,
  createdAt: true,
  _count: {
    select: {
      followers: { where: { status: 'ACCEPTED' } },
      following: { where: { status: 'ACCEPTED' } },
      projects: true,
      posts: true,
    },
  },
};

// Helper: get follow status between two users
async function getFollowStatus(fromId: string | undefined, toId: string): Promise<'NONE' | 'PENDING' | 'ACCEPTED'> {
  if (!fromId) return 'NONE';
  const record = await prisma.follower.findUnique({
    where: { followerId_followingId: { followerId: fromId, followingId: toId } },
    select: { status: true },
  });
  if (!record) return 'NONE';
  return record.status as 'PENDING' | 'ACCEPTED';
}

export const syncUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clerkId, username, email, avatarUrl } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { avatarUrl: true },
    });

    const isNew = !existingUser;

    const user = await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, username, email, avatarUrl },
      update: {
        avatarUrl: existingUser?.avatarUrl ? existingUser.avatarUrl : avatarUrl,
      },
      select: userSelect,
    });

    res.json({ success: true, data: user, isNew });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        socialLinks: true,
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { _count: { select: { likes: true, comments: true } } },
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                level: true,
              },
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
        },
        _count: {
          select: {
            followers: { where: { status: 'ACCEPTED' } },
            following: { where: { status: 'ACCEPTED' } },
            projects: true,
            posts: true,
          },
        },
      },
    });

    if (!user) throw createError('User not found', 404);

    const stats = await computeUserStats(user.id, user.level, user.streak);
    user.level = stats.level;
    user.streak = stats.streak;
    (user as any).totalExp = stats.totalExp;

    let isFollowing = false;
    let followStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';
    let incomingFollowStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';
    if (req.clerkId) {
      const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (currentUser) {
        followStatus = await getFollowStatus(currentUser.id, user.id);
        isFollowing = followStatus === 'ACCEPTED';
        incomingFollowStatus = await getFollowStatus(user.id, currentUser.id);
      }
    }

    res.json({ success: true, data: { ...user, isFollowing, followStatus, incomingFollowStatus } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId },
      include: {
        socialLinks: true,
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { _count: { select: { likes: true, comments: true } } },
        },
        _count: {
          select: {
            followers: { where: { status: 'ACCEPTED' } },
            following: { where: { status: 'ACCEPTED' } },
            projects: true,
            posts: true,
          },
        },
      },
    });

    if (!user) throw createError('User not found', 404);

    const stats = await computeUserStats(user.id, user.level, user.streak);
    user.level = stats.level;
    user.streak = stats.streak;
    (user as any).totalExp = stats.totalExp;
    res.json({ success: true, data: { ...user, isFollowing: false } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, bio, avatarUrl, coverUrl, headline, location, website, resumeUrl, socialLinks, skills } = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    let skillsString: string | undefined = undefined;
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        skillsString = skills.filter((s: any) => typeof s === 'string' && s.trim()).join(', ');
      } else if (typeof skills === 'string') {
        skillsString = skills.trim();
      }
    }

    if (socialLinks) {
      let linksArray: { platform: string; url: string }[] = [];
      if (Array.isArray(socialLinks)) {
        linksArray = socialLinks.filter((l: any) => l?.platform && l?.url);
      } else if (typeof socialLinks === 'object') {
        linksArray = Object.entries(socialLinks)
          .filter(([, url]) => url)
          .map(([platform, url]) => ({ platform, url: url as string }));
      }

      await prisma.socialLink.deleteMany({ where: { userId: user.id } });

      for (const link of linksArray) {
        const urlTrimmed = link.url?.trim();
        if (!urlTrimmed) continue;
        const platformKey = link.platform.toLowerCase().replace(/\s+/g, '_');
        await prisma.socialLink.create({
          data: {
            userId: user.id,
            platform: platformKey,
            url: urlTrimmed,
          }
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(coverUrl && { coverUrl }),
        ...(headline !== undefined && { headline }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(skillsString !== undefined && { skills: skillsString }),
      },
      include: { socialLinks: true },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let currentUser: any = null;
    if (req.clerkId) {
      currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId }, select: { id: true } });
    }

    const queryStr = q ? String(q) : undefined;
    const users = await prisma.user.findMany({
      where: {
        ...(currentUser && { id: { not: currentUser.id } }),
        ...(queryStr && {
          OR: [
            { username: { contains: queryStr } },
            { username: { contains: queryStr.toLowerCase() } },
            { bio: { contains: queryStr } },
            { bio: { contains: queryStr.toLowerCase() } },
          ],
        }),
      },
      select: {
        ...userSelect,
        socialLinks: { select: { platform: true, url: true } },
        ...(currentUser && {
          followers: { where: { followerId: currentUser.id }, select: { status: true } },
        }),
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: currentUser ? { id: { not: currentUser.id } } : {},
    });

    const usersWithStatus = users.map((u: any) => {
      const followRecord = u.followers?.[0];
      const followStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = followRecord?.status ?? 'NONE';
      const { followers: _, ...rest } = u;
      return { ...rest, followStatus, isFollowing: followStatus === 'ACCEPTED' };
    });

    res.json({
      success: true,
      data: usersWithStatus,
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: skip + users.length < total,
    });
  } catch (error: any) {
    console.error('Search failed:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

export const getFollowers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError('User not found', 404);

    const followers = await prisma.follower.findMany({
      where: { followingId: user.id, status: 'ACCEPTED' },
      include: { follower: { select: userSelect } },
    });

    res.json({ success: true, data: followers.map((f: any) => f.follower) });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getFollowing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError('User not found', 404);

    const following = await prisma.follower.findMany({
      where: { followerId: user.id, status: 'ACCEPTED' },
      include: { following: { select: userSelect } },
    });

    res.json({ success: true, data: following.map((f: any) => f.following) });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);
    if (currentUser.id === userId) throw createError('Cannot follow yourself', 400);

    const existing = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: userId } },
    });
    if (existing) {
      return res.json({ success: true, message: 'Follow status unchanged', followStatus: existing.status });
    }

    await prisma.follower.create({
      data: { followerId: currentUser.id, followingId: userId, status: 'PENDING' },
    });

    const notif = await prisma.notification.create({
      data: {
        userId,
        type: 'FOLLOW_REQUEST',
        fromUserId: currentUser.id,
        targetId: currentUser.id,
        targetType: 'USER',
        message: 'sent you a follow request',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    try {
      const { io } = require('../server');
      const { emitNotification } = require('../services/socketService');
      emitNotification(io, userId, notif);
    } catch (err) {
      console.error('Failed to emit follow request socket notification:', err);
    }

    res.json({ success: true, message: 'Follow request sent', followStatus: 'PENDING' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    await prisma.follower.deleteMany({
      where: { followerId: currentUser.id, followingId: userId },
    });

    await prisma.notification.deleteMany({
      where: {
        userId: userId,
        fromUserId: currentUser.id,
        type: { in: ['FOLLOW_REQUEST', 'FOLLOW'] },
      },
    });

    res.json({ success: true, message: 'Unfollowed / request cancelled' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const acceptFollowRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.params.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    const record = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId: requesterId, followingId: currentUser.id } },
    });
    if (!record) throw createError('Follow request not found', 404);
    if (record.status !== 'PENDING') throw createError('Request already processed', 400);

    await prisma.follower.update({
      where: { followerId_followingId: { followerId: requesterId, followingId: currentUser.id } },
      data: { status: 'ACCEPTED' },
    });

    const notif = await prisma.notification.create({
      data: {
        userId: requesterId,
        type: 'FOLLOW',
        fromUserId: currentUser.id,
        targetId: currentUser.id,
        targetType: 'USER',
        message: 'accepted your follow request',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    try {
      const { io } = require('../server');
      const { emitNotification } = require('../services/socketService');
      emitNotification(io, requesterId, notif);
    } catch (err) {
      console.error('Failed to emit follow acceptance socket notification:', err);
    }

    await prisma.notification.updateMany({
      where: { userId: currentUser.id, fromUserId: requesterId, type: 'FOLLOW_REQUEST' },
      data: {
        readAt: new Date(),
        type: 'FOLLOW',
        message: 'followed you',
      },
    });

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const declineFollowRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.params.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    await prisma.follower.deleteMany({
      where: { followerId: requesterId, followingId: currentUser.id },
    });

    await prisma.notification.deleteMany({
      where: { userId: currentUser.id, fromUserId: requesterId, type: 'FOLLOW_REQUEST' },
    });

    res.json({ success: true, message: 'Follow request declined' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getTrendingDevelopers = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { followers: { _count: 'desc' } },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Failed to get trending developers:', error);
    res.status(500).json({ success: false, message: 'Failed to get trending developers' });
  }
};

export const getSuggestedDevelopers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    const following = await prisma.follower.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });
    const followingIds = following.map((f: any) => f.followingId);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: [...followingIds, currentUser.id] },
      },
      select: userSelect,
      take: 5,
      orderBy: { followers: { _count: 'desc' } },
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getPendingFollowRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    const requests = await prisma.follower.findMany({
      where: { followingId: currentUser.id, status: 'PENDING' },
      include: { follower: { select: userSelect } },
    });

    res.json({ success: true, data: requests.map((r: any) => r.follower) });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getBookmarks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } }
          }
        },
        project: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: bookmarks });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getUserContributions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError('User not found', 404);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [projects, posts, comments, likes] = await Promise.all([
      prisma.project.findMany({
        where: { userId: user.id, createdAt: { gte: oneYearAgo } },
        select: { createdAt: true },
      }),
      prisma.post.findMany({
        where: { userId: user.id, createdAt: { gte: oneYearAgo } },
        select: { createdAt: true },
      }),
      prisma.comment.findMany({
        where: { userId: user.id, createdAt: { gte: oneYearAgo } },
        select: { createdAt: true },
      }),
      prisma.like.findMany({
        where: { userId: user.id, createdAt: { gte: oneYearAgo } },
        select: { createdAt: true },
      }),
    ]);

    const dates = [
      ...projects.map((p) => p.createdAt),
      ...posts.map((p) => p.createdAt),
      ...comments.map((c) => c.createdAt),
      ...likes.map((l) => l.createdAt),
    ];

    res.json({ success: true, data: dates });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
