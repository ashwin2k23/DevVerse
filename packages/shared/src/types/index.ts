// User types
export interface User {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  role: UserRole;
  level: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
  _count?: {
    followers: number;
    following: number;
    projects: number;
    posts: number;
  };
}

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface Profile {
  id: string;
  userId: string;
  headline?: string;
  location?: string;
  website?: string;
  resumeUrl?: string;
  completionPct: number;
  socialLinks?: SocialLink[];
  skills?: UserSkill[];
  experience?: Experience[];
  education?: Education[];
}

export interface SocialLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
}

export interface Experience {
  id: string;
  userId: string;
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

export interface Education {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skill: Skill;
  proficiency: ProficiencyLevel;
}

export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

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

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startAt: Date;
  endAt: Date;
  bannerUrl?: string;
  location?: string;
  isOnline: boolean;
  communityId?: string;
  _count?: { registrations: number };
  isRegistered?: boolean;
  isBookmarked?: boolean;
  createdAt: Date;
}

export type EventType = 'HACKATHON' | 'MEETUP' | 'WORKSHOP' | 'WEBINAR';

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
  | 'COMMUNITY_INVITE'
  | 'EVENT_REMINDER'
  | 'ACHIEVEMENT';

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
