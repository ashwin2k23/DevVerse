import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

// SQLite: enums are plain strings
const TARGET_POST = 'POST';


const postInclude = {
  user: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      level: true,
    },
  },
  community: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
};

export const getFeed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { communityId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get current user if available to flag liked/bookmarked posts
    let currentUser = null;
    if (req.clerkId) {
      currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    }

    const posts = await prisma.post.findMany({
      where: {
        ...(communityId && { communityId: String(communityId) }),
      },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    });

    const total = await prisma.post.count({
      where: {
        ...(communityId && { communityId: String(communityId) }),
      },
    });

    // If logged in, check which posts are liked/bookmarked by the user
    let postsWithAuth = posts;
    if (currentUser) {
      const postIds = posts.map((p: any) => p.id);
      const likes = await prisma.like.findMany({
        where: {
          userId: currentUser.id,
          targetType: TARGET_POST,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      const likedPostIds = new Set(likes.map((l: any) => l.postId));

      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId: currentUser.id,
          targetType: TARGET_POST,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      const bookmarkedPostIds = new Set(bookmarks.map((b: any) => b.postId));

      postsWithAuth = posts.map((post: any) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isBookmarked: bookmarkedPostIds.has(post.id),
      })) as any;
    }

    res.json({
      success: true,
      data: postsWithAuth,
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch feed', error: error.message, stack: error.stack });
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, type = 'TEXT', imageUrls, communityId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const post = await prisma.post.create({
      data: {
        content,
        type: String(type || 'TEXT'),
        imageUrls: Array.isArray(imageUrls) ? imageUrls.join(',') : (imageUrls || ''),
        userId: user.id,
        communityId: communityId || null,
      },
      include: postInclude,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        ...postInclude,
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            replies: {
              include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!post) throw createError('Post not found', 404);

    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw createError('Post not found', 404);
    if (post.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw createError('Forbidden', 403);
    }

    await prisma.post.delete({ where: { id: postId } });
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    // Use createMany with skipDuplicates pattern for SQLite
    const existing = await prisma.like.findFirst({
      where: { userId: user.id, targetType: TARGET_POST, postId },
    });
    if (!existing) {
      await prisma.like.create({
        data: { userId: user.id, targetType: TARGET_POST, postId },
      });
    }

    res.json({ success: true, message: 'Liked post' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.like.deleteMany({
      where: {
        userId: user.id,
        targetType: TARGET_POST,
        postId,
      },
    });

    res.json({ success: true, message: 'Unliked post' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to unlike post' });
  }
};

export const bookmarkPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const existingBm = await prisma.bookmark.findFirst({
      where: { userId: user.id, targetType: TARGET_POST, postId },
    });
    if (!existingBm) {
      await prisma.bookmark.create({
        data: { userId: user.id, targetType: TARGET_POST, postId },
      });
    }

    res.json({ success: true, message: 'Bookmarked post' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to bookmark post' });
  }
};

export const unbookmarkPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        targetType: TARGET_POST,
        postId,
      },
    });

    res.json({ success: true, message: 'Unbookmarked post' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to unbookmark post' });
  }
};

export const getComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const { content, parentId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: user.id,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = req.params.commentId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw createError('Comment not found', 404);

    if (comment.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw createError('Forbidden', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
