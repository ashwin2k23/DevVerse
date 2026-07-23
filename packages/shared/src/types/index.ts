// User types
export interface User {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  headline?: string;
  location?: string;
  website?: string;
  resumeUrl?: string;
  skills?: string[];
  completionPct?: number;
  role: UserRole;
  level: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
  socialLinks?: SocialLink[];
  _count?: {
    followers: number;
    following: number;
    projects: number;
    posts: number;
  };
}

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface SocialLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  bannerUrl?: string;
  tags: string[];
  images?: ProjectImage[];
  user?: User;
  _count?: { likes: number; comments: number };
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  order: number;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  content: string;
  type: PostType;
  imageUrls?: string[];
  communityId?: string;
  user?: User;
  community?: Community;
  comments?: Comment[];
  _count?: { likes: number; comments: number };
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CODE' | 'MARKDOWN';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  user?: User;
  replies?: Comment[];
  _count?: { likes: number };
  createdAt: Date;
}

// Community types
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  isPrivate: boolean;
  creatorId: string;
  creator?: User;
  _count?: { members: number; posts: number };
  isMember?: boolean;
  createdAt: Date;
}

export type CommunityRole = 'MEMBER' | 'MODERATOR' | 'ADMIN';

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  readAt?: Date;
  sender?: User;
  createdAt: Date;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  participants?: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  fromUserId?: string;
  fromUser?: User;
  targetId?: string;
  targetType?: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'PROJECT_APPRECIATION'
  | 'COMMUNITY_INVITE';

// API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

