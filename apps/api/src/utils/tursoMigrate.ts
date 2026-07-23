import { createClient } from '@libsql/client';

export async function runTursoMigrations() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    return;
  }

  try {
    const client = createClient({ url: tursoUrl, authToken: tursoToken });

    // Table creations
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        clerkId TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatarUrl TEXT,
        coverUrl TEXT,
        bio TEXT,
        headline TEXT,
        location TEXT,
        website TEXT,
        resumeUrl TEXT,
        skills TEXT DEFAULT '',
        completionPct INTEGER DEFAULT 0,
        role TEXT DEFAULT 'USER',
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS social_links (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS followers (
        id TEXT PRIMARY KEY,
        followerId TEXT NOT NULL,
        followingId TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(followerId, followingId)
      );`,
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        techStack TEXT DEFAULT '',
        githubUrl TEXT,
        demoUrl TEXT,
        bannerUrl TEXT,
        tags TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS project_images (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        url TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'TEXT',
        imageUrls TEXT DEFAULT '',
        communityId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        postId TEXT,
        projectId TEXT,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        parentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        targetType TEXT NOT NULL,
        postId TEXT,
        projectId TEXT,
        commentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        targetType TEXT NOT NULL,
        postId TEXT,
        projectId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS communities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        avatarUrl TEXT,
        isPrivate BOOLEAN DEFAULT 0,
        creatorId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creatorId) REFERENCES users(id)
      );`,
      `CREATE TABLE IF NOT EXISTS community_members (
        id TEXT PRIMARY KEY,
        communityId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT DEFAULT 'MEMBER',
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(communityId, userId)
      );`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        isGroup BOOLEAN DEFAULT 0,
        name TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS conversation_participants (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        userId TEXT NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(conversationId, userId)
      );`,
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'TEXT',
        readAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        fromUserId TEXT,
        targetId TEXT,
        targetType TEXT,
        message TEXT NOT NULL,
        readAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`
    ];

    for (const stmt of tables) {
      await client.execute(stmt);
    }

    const columnAdditions = [
      "ALTER TABLE users ADD COLUMN coverUrl TEXT",
      "ALTER TABLE users ADD COLUMN headline TEXT",
      "ALTER TABLE users ADD COLUMN location TEXT",
      "ALTER TABLE users ADD COLUMN website TEXT",
      "ALTER TABLE users ADD COLUMN resumeUrl TEXT",
      "ALTER TABLE users ADD COLUMN skills TEXT DEFAULT ''",
      "ALTER TABLE users ADD COLUMN completionPct INTEGER DEFAULT 0",
      "ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1",
      "ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0",
      "ALTER TABLE followers ADD COLUMN status TEXT DEFAULT 'PENDING'"
    ];

    for (const sql of columnAdditions) {
      try {
        await client.execute(sql);
      } catch {
        // Ignore duplicate column errors if column already exists
      }
    }
  } catch (err: any) {
    console.error('Turso migration notice:', err.message || err);
  }
}
