import { prisma } from '../lib/prisma';

export async function computeUserStats(userId: string, currentLevel?: number, currentStreak?: number) {
  const [projects, posts, comments, likes] = await Promise.all([
    prisma.project.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.post.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.comment.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.like.findMany({ where: { userId }, select: { createdAt: true } }),
  ]);

  const dates = [
    ...projects.map((p) => p.createdAt),
    ...posts.map((p) => p.createdAt),
    ...comments.map((c) => c.createdAt),
    ...likes.map((l) => l.createdAt),
  ];

  const dateStrings = new Set(dates.map((d) => d.toISOString().split("T")[0]));

  let streak = 0;
  const today = new Date();

  const formatLocalDate = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  const todayStr = formatLocalDate(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let startFrom: string | null = null;
  if (dateStrings.has(todayStr)) {
    startFrom = todayStr;
  } else if (dateStrings.has(yesterdayStr)) {
    startFrom = yesterdayStr;
  }

  if (startFrom) {
    const currentCheck = new Date(startFrom === todayStr ? today : yesterday);
    while (true) {
      const checkStr = formatLocalDate(currentCheck);
      if (dateStrings.has(checkStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const totalExp =
    projects.length * 50 +
    posts.length * 20 +
    comments.length * 10 +
    likes.length * 5 +
    streak * 10;

  let level = 1;
  let expAccumulated = totalExp;

  while (true) {
    const expNeededForNext = 100 + (level - 1) * 50;
    if (expAccumulated >= expNeededForNext) {
      expAccumulated -= expNeededForNext;
      level++;
    } else {
      break;
    }
  }

  // Only write to database if the values actually changed, preventing heavy DB write locks on GET requests
  if (currentLevel === undefined || currentStreak === undefined || level !== currentLevel || streak !== currentStreak) {
    await prisma.user.update({
      where: { id: userId },
      data: { level, streak },
    });
  }

  return { level, streak, totalExp };
}
