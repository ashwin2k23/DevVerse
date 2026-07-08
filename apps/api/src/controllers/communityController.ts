import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { slugify } from '../utils/slugify';
import { prisma } from '../lib/prisma';

const communityInclude = {
  creator: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: {
      members: true,
      posts: true,
    },
  },
};

export const getCommunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query;
    const queryStr = q ? String(q) : '';
    const communities = await prisma.community.findMany({
      where: {
        ...(q && {
          OR: [
            { name: { contains: queryStr } },
            { name: { contains: queryStr.toLowerCase() } },
            { name: { contains: queryStr.toUpperCase() } },
            { description: { contains: queryStr } },
            { description: { contains: queryStr.toLowerCase() } },
          ],
        }),
      },
      include: communityInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
};

export const createCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, avatarUrl, isPrivate } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const slug = slugify(name);
    const existing = await prisma.community.findUnique({ where: { slug } });
    if (existing) throw createError('Community name/slug already exists', 400);

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        avatarUrl,
        isPrivate: !!isPrivate,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN',
          },
        },
      },
      include: communityInclude,
    });

    res.status(201).json({ success: true, data: community });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const community = await prisma.community.findUnique({
      where: { slug },
      include: communityInclude,
    });

    if (!community) throw createError('Community not found', 404);

    let isMember = false;
    let userRole = null;

    if (req.clerkId) {
      const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (user) {
        const membership = await prisma.communityMember.findUnique({
          where: { communityId_userId: { communityId: community.id, userId: user.id } },
        });
        isMember = !!membership;
        userRole = membership ? membership.role : null;
      }
    }

    res.json({ success: true, data: { ...community, isMember, userRole } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const communityId = req.params.communityId as string;
    const { name, description, avatarUrl, isPrivate } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: user.id } },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR')) {
      throw createError('Unauthorized', 403);
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        name,
        description,
        avatarUrl,
        isPrivate,
      },
      include: communityInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const joinCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const communityId = req.params.communityId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw createError('Community not found', 404);

    await prisma.communityMember.upsert({
      where: { communityId_userId: { communityId, userId: user.id } },
      create: { communityId, userId: user.id, role: 'MEMBER' },
      update: {},
    });

    res.json({ success: true, message: 'Joined community successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const leaveCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const communityId = req.params.communityId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw createError('Community not found', 404);
    if (community.creatorId === user.id) {
      throw createError('Creator cannot leave the community. Delete it instead.', 400);
    }

    await prisma.communityMember.delete({
      where: { communityId_userId: { communityId, userId: user.id } },
    });

    res.json({ success: true, message: 'Left community successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getCommunityPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) throw createError('Community not found', 404);

    const posts = await prisma.post.findMany({
      where: { communityId: community.id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, level: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: posts });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getCommunityMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) throw createError('Community not found', 404);

    const members = await prisma.communityMember.findMany({
      where: { communityId: community.id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, level: true, bio: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
