import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to sync user', error: error.message, stack: error.stack });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    console.log('[DEBUG] getProfile called with username:', username);

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
          select: { followers: true, following: true, projects: true, posts: true },
        },
      },
    });

    console.log('[DEBUG] getProfile user query result:', user ? 'FOUND' : 'NOT FOUND');
    if (!user) throw createError('User not found', 404);

    // Check follow status between current user and this profile
    let isFollowing = false;
    let followStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';
    if (req.clerkId) {
      const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (currentUser) {
        followStatus = await getFollowStatus(currentUser.id, user.id);
        isFollowing = followStatus === 'ACCEPTED';
      }
    }

    res.json({ success: true, data: { ...user, isFollowing, followStatus } });
  } catch (error: any) {
    console.error('[ERROR] getProfile caught exception:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId },
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

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // 1. Delete existing user skills
      await prisma.userSkill.deleteMany({
        where: { userId: user.id },
      });

      // 2. Add new user skills
      for (const skillName of skills) {
        if (!skillName || !skillName.trim()) continue;
        let skill = await prisma.skill.findUnique({
          where: { name: skillName.trim() },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: { name: skillName.trim(), category: 'General' },
          });
        }

        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: skill.id,
            proficiency: 'INTERMEDIATE',
          },
        });
      }
    }
    // Update social links if provided
    if (socialLinks) {
      // Normalize to array of {platform, url} regardless of incoming format
      let linksArray: { platform: string; url: string }[] = [];

      if (Array.isArray(socialLinks)) {
        // New format: [{platform: "Instagram", url: "https://..."}]
        linksArray = socialLinks.filter((l: any) => l?.platform && l?.url);
      } else if (typeof socialLinks === 'object') {
        // Legacy format: {Instagram: "https://..."}
        linksArray = Object.entries(socialLinks)
          .filter(([, url]) => url)
          .map(([platform, url]) => ({ platform, url: url as string }));
      }

      // Delete ALL existing social links, then recreate (clean slate)
      await prisma.socialLink.deleteMany({ where: { userId: user.id } });

      for (const link of linksArray) {
        const urlTrimmed = link.url?.trim();
        if (!urlTrimmed) continue;
        const platformKey = link.platform.toLowerCase().replace(/\s+/g, '_');
        await prisma.socialLink.create({
          data: {
            userId: user.id,
            platform: platformKey,       // normalized key for DB unique constraint
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

    // Get current user to exclude self and compute follow statuses
    let currentUser: any = null;
    if (req.clerkId) {
      currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId }, select: { id: true } });
    }

    const queryStr = q ? String(q) : undefined;
    const users = await prisma.user.findMany({
      where: {
        ...(currentUser && { id: { not: currentUser.id } }), // exclude self
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
        profile: true,
        socialLinks: { select: { platform: true, url: true } },
        followers: currentUser
          ? { where: { followerId: currentUser.id }, select: { status: true } }
          : false,
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: currentUser ? { id: { not: currentUser.id } } : {},
    });

    // Attach followStatus per user
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
    res.status(500).json({ success: false, message: 'Search failed', error: error.message, stack: error.stack });
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

    // Create follow request as PENDING
    await prisma.follower.create({
      data: { followerId: currentUser.id, followingId: userId, status: 'PENDING' },
    });

    // Notify target user
    await prisma.notification.create({
      data: {
        userId,
        type: 'FOLLOW_REQUEST',
        fromUserId: currentUser.id,
        targetId: currentUser.id,
        targetType: 'USER',
        message: 'sent you a follow request',
      },
    });

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

    res.json({ success: true, message: 'Unfollowed / request cancelled' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const acceptFollowRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.params.userId as string; // the person who sent the request
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

    // Notify requester that their request was accepted
    await prisma.notification.create({
      data: {
        userId: requesterId,
        type: 'FOLLOW',
        fromUserId: currentUser.id,
        targetId: currentUser.id,
        targetType: 'USER',
        message: 'accepted your follow request',
      },
    });

    // Mark the FOLLOW_REQUEST notification as read
    await prisma.notification.updateMany({
      where: { userId: currentUser.id, fromUserId: requesterId, type: 'FOLLOW_REQUEST' },
      data: { readAt: new Date() },
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

    // Delete the FOLLOW_REQUEST notification
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
      select: { ...userSelect, profile: true },
      orderBy: { followers: { _count: 'desc' } },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get trending developers', error: error.message, stack: error.stack });
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

export const getUserContributions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError('User not found', 404);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Fetch dates of all projects, posts, comments, likes created by the user in the last year
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

    // Combine all contribution dates
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

