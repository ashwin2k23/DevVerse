import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

const projectInclude = {
  user: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      level: true,
    },
  },
  images: {
    orderBy: {
      order: 'asc' as const,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
};

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, tech, sort = 'Trending', page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Sort order definition
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'Most Stars') {
      orderBy = { likes: { _count: 'desc' } };
    } else if (sort === 'Most Viewed') {
      orderBy = { createdAt: 'desc' }; // fallback for views
    }

    const queryStr = q ? String(q) : '';
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { title: { contains: queryStr } },
              { title: { contains: queryStr.toLowerCase() } },
              { title: { contains: queryStr.toUpperCase() } },
              { description: { contains: queryStr } },
              { description: { contains: queryStr.toLowerCase() } },
            ]
          } : {},
          tech ? {
            techStack: { contains: String(tech).split(',')[0] }
          } : {},
        ]
      },
      include: projectInclude,
      orderBy,
      skip,
      take: Number(limit),
    });

    const total = await prisma.project.count({
      where: {
        AND: [
          q ? {
            OR: [
              { title: { contains: queryStr } },
              { title: { contains: queryStr.toLowerCase() } },
              { title: { contains: queryStr.toUpperCase() } },
              { description: { contains: queryStr } },
              { description: { contains: queryStr.toLowerCase() } },
            ]
          } : {},
          tech ? {
            techStack: { contains: String(tech).split(',')[0] }
          } : {},
        ]
      }
    });

    let projectsWithAuth = projects;
    if (req.clerkId) {
      const currentUser = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
      if (currentUser) {
        const projectIds = projects.map((p: any) => p.id);
        const likes = await prisma.like.findMany({
          where: {
            userId: currentUser.id,
            targetType: 'PROJECT',
            projectId: { in: projectIds },
          },
          select: { projectId: true },
        });
        const likedIds = new Set(likes.map((l: any) => l.projectId));

        const bookmarks = await prisma.bookmark.findMany({
          where: {
            userId: currentUser.id,
            targetType: 'PROJECT',
            projectId: { in: projectIds },
          },
          select: { projectId: true },
        });
        const bookmarkedIds = new Set(bookmarks.map((b: any) => b.projectId));

        projectsWithAuth = projects.map((p: any) => ({
          ...p,
          isLiked: likedIds.has(p.id),
          isSaved: bookmarkedIds.has(p.id),
        })) as any;
      }
    }

    res.json({
      success: true,
      data: projectsWithAuth,
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: skip + projects.length < total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, techStack, githubUrl, demoUrl, bannerUrl, tags, imageUrls } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack: techStack || "",
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        bannerUrl: bannerUrl || null,
        tags: tags || "",
        userId: user.id,
        images: {
          create: (imageUrls || []).map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
      },
      include: projectInclude,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        ...projectInclude,
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

    if (!project) throw createError('Project not found', 404);

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { title, description, techStack, githubUrl, demoUrl, bannerUrl, tags } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw createError('Project not found', 404);
    if (project.userId !== user.id) throw createError('Forbidden', 403);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        techStack,
        githubUrl,
        demoUrl,
        bannerUrl,
        tags,
      },
      include: projectInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw createError('Project not found', 404);
    if (project.userId !== user.id && user.role !== 'ADMIN') throw createError('Forbidden', 403);

    await prisma.project.delete({ where: { id: projectId } });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const likeProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const existing = await prisma.like.findFirst({
      where: { userId: user.id, targetType: 'PROJECT', projectId },
    });
    if (!existing) {
      await prisma.like.create({
        data: {
          userId: user.id,
          targetType: 'PROJECT',
          projectId,
        },
      });
    }

    res.json({ success: true, message: 'Liked project' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like project' });
  }
};

export const unlikeProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.like.deleteMany({
      where: {
        userId: user.id,
        targetType: 'PROJECT',
        projectId,
      },
    });

    res.json({ success: true, message: 'Unliked project' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unlike project' });
  }
};

export const bookmarkProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    const existing = await prisma.bookmark.findFirst({
      where: { userId: user.id, targetType: 'PROJECT', projectId },
    });
    if (!existing) {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          targetType: 'PROJECT',
          projectId,
        },
      });
    }

    res.json({ success: true, message: 'Bookmarked project' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bookmark project' });
  }
};

export const unbookmarkProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId } });
    if (!user) throw createError('User not found', 404);

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        targetType: 'PROJECT',
        projectId,
      },
    });

    res.json({ success: true, message: 'Unbookmarked project' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unbookmark project' });
  }
};
