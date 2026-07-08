import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  role: true,
  level: true,
  streak: true,
  createdAt: true,
  _count: {
    select: {
      followers: true,
      following: true,
      projects: true,
      posts: true,
    },
  },
};

export const syncUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clerkId, username, email, avatarUrl } = req.body;

    const user = await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, username, email, avatarUrl },
      update: { avatarUrl },
      select: userSelect,
    });

    // Create profile if not exists
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        socialLinks: true,
        userSkills: { include: { skill: true } },
        experience: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startYear: 'desc' } },
        achievements: { orderBy: { earnedAt: 'desc' } },
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { _count: { select: { likes: true, comments: true } } },
        },
        _count: {
          select: { followers: true, following: true, projects: true, posts: true },
        },
      },
    });

    if (!user) throw createError('User not found', 404);

    // Check if current user follows this profile
    let isFollowing = false;
    if (req.clerkId) {
      const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (currentUser) {
        const follow = await prisma.follower.findUnique({
          where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } },
        });
        isFollowing = !!follow;
      }
    }

    res.json({ success: true, data: { ...user, isFollowing } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, bio, avatarUrl, coverUrl, headline, location, website, resumeUrl, socialLinks, skills } = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(coverUrl && { coverUrl }),
        profile: {
          upsert: {
            create: { headline, location, website, resumeUrl },
            update: { headline, location, website, resumeUrl },
          },
        },
      },
      include: { profile: true, socialLinks: true, userSkills: { include: { skill: true } } },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, skills, country, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queryStr = String(q);
    const users = await prisma.user.findMany({
      where: {
        ...(q && {
          OR: [
            { username: { contains: queryStr } },
            { username: { contains: queryStr.toLowerCase() } },
            { username: { contains: queryStr.toUpperCase() } },
            { bio: { contains: queryStr } },
            { bio: { contains: queryStr.toLowerCase() } },
          ],
        }),
      },
      select: { ...userSelect, profile: true },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count();

    res.json({
      success: true,
      data: users,
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: skip + users.length < total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

export const getFollowers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError('User not found', 404);

    const followers = await prisma.follower.findMany({
      where: { followingId: user.id },
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
      where: { followerId: user.id },
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

    await prisma.follower.create({
      data: { followerId: currentUser.id, followingId: userId },
    });

    res.json({ success: true, message: 'Followed successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!currentUser) throw createError('User not found', 404);

    await prisma.follower.delete({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: userId } },
    });

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getTrendingDevelopers = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { ...userSelect, profile: true },
      orderBy: { followers: { _count: 'desc' } },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (error) {
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
      select: { ...userSelect, profile: true },
      take: 5,
      orderBy: { followers: { _count: 'desc' } },
    });

    res.json({ success: true, data: users });
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
        },
        event: {
          include: {
            community: { select: { id: true, name: true, slug: true } }
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

