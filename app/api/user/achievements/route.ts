import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  { id: "first_login", name: "Premier Pas", description: "Première connexion sur Lumio", icon: "🎯", category: "onboarding", points: 10 },
  { id: "first_upload", name: "Créateur", description: "Première publication", icon: "🎨", category: "upload", points: 50 },
  { id: "100_likes", name: "Populaire", description: "100 likes reçus", icon: "❤️", category: "like", points: 100 },
  { id: "50_followers", name: "Social", description: "50 followers", icon: "👥", category: "social", points: 150 },
  { id: "7_day_streak", name: "Série", description: "7 jours consécutifs", icon: "🔥", category: "streak", points: 75 },
  { id: "featured_image", name: "Étoile", description: "Image featured", icon: "🌟", category: "upload", points: 200 },
  { id: "10_collections", name: "Collectionneur", description: "10 collections créées", icon: "💎", category: "collection", points: 100 },
  { id: "100_comments", name: "Critique", description: "100 commentaires", icon: "🏅", category: "comment", points: 150 },
];

// XP thresholds for levels
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: "Novice" },
  { level: 2, xp: 100, name: "Explorateur" },
  { level: 3, xp: 500, name: "Créateur" },
  { level: 4, xp: 2000, name: "Artiste" },
  { level: 5, xp: 5000, name: "Maître" },
];

// GET - Get user achievements and level
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get user profile with achievements
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        level: true,
        xp: true,
        streakDays: true,
        achievements: true,
        totalTimeSpent: true,
      },
    });

    // Get user stats
    const userImages = await prisma.image.count({
      where: { userId: session.user.id, isDeleted: false },
    });
    
    const totalLikes = await prisma.like.count({
      where: { image: { userId: session.user.id } },
    });

    const totalViews = await prisma.activity.count({
      where: { userId: session.user.id, type: "view" },
    });

    const followersCount = await prisma.follow.count({
      where: { followingId: session.user.id },
    });

    const collectionsCount = await prisma.collection.count({
      where: { userId: session.user.id },
    });

    const commentsCount = await prisma.comment.count({
      where: { userId: session.user.id },
    });

    // Parse achievements
    const userAchievements = profile?.achievements ? JSON.parse(profile.achievements) : [];
    
    // Calculate level name
    const currentLevel = LEVEL_THRESHOLDS.slice().reverse().find(l => (profile?.xp || 0) >= l.xp) || LEVEL_THRESHOLDS[0];
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.xp > (profile?.xp || 0));
    const xpToNextLevel = nextLevel ? nextLevel.xp - (profile?.xp || 0) : 0;

    // Get available achievements (not yet earned)
    const availableAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => !userAchievements.includes(a.id));

    return NextResponse.json({
      profile: {
        level: profile?.level || 1,
        levelName: currentLevel.name,
        xp: profile?.xp || 0,
        xpToNextLevel,
        nextLevelName: nextLevel?.name || "Max",
        streakDays: profile?.streakDays || 0,
        totalTimeSpent: profile?.totalTimeSpent || 0,
      },
      stats: {
        images: userImages,
        likes: totalLikes,
        views: totalViews,
        followers: followersCount,
        collections: collectionsCount,
        comments: commentsCount,
      },
      achievements: userAchievements.map((id: string) => 
        ACHIEVEMENT_DEFINITIONS.find(a => a.id === id)
      ).filter(Boolean),
      availableAchievements,
      allDefinitions: ACHIEVEMENT_DEFINITIONS,
    });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Check and award achievements
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { action, metadata } = await req.json();

    // Get user profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: session.user.id },
      });
    }

    const userAchievements = profile.achievements ? JSON.parse(profile.achievements) : [];
    let newXp = profile.xp;
    let newAchievements = [...userAchievements];
    let earnedAchievements: string[] = [];

    // Check achievement conditions
    switch (action) {
      case "login":
        if (!userAchievements.includes("first_login")) {
          newAchievements.push("first_login");
          newXp += 10;
          earnedAchievements.push("first_login");
        }
        // Update streak
        const today = new Date().toDateString();
        const lastStreakDate = profile.lastStreakDate ? new Date(profile.lastStreakDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let newStreakDays = profile.streakDays;
        if (lastStreakDate === today) {
          // Already logged in today
        } else if (lastStreakDate === yesterday) {
          newStreakDays += 1;
        } else {
          newStreakDays = 1;
        }

        // Check 7 day streak achievement
        if (newStreakDays >= 7 && !newAchievements.includes("7_day_streak")) {
          newAchievements.push("7_day_streak");
          newXp += 75;
          earnedAchievements.push("7_day_streak");
        }

        await prisma.userProfile.update({
          where: { userId: session.user.id },
          data: {
            xp: newXp,
            achievements: JSON.stringify(newAchievements),
            streakDays: newStreakDays,
            lastStreakDate: new Date(),
            totalTimeSpent: profile.totalTimeSpent + 60, // Add 1 minute
          },
        });
        break;

      case "upload":
        if (!userAchievements.includes("first_upload")) {
          newAchievements.push("first_upload");
          newXp += 50;
          earnedAchievements.push("first_upload");
        }
        break;

      case "featured":
        if (!userAchievements.includes("featured_image")) {
          newAchievements.push("featured_image");
          newXp += 200;
          earnedAchievements.push("featured_image");
        }
        break;

      default:
        break;
    }

    // Update profile if achievements changed
    if (earnedAchievements.length > 0) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          xp: newXp,
          achievements: JSON.stringify(newAchievements),
        },
      });
    }

    return NextResponse.json({
      success: true,
      earnedAchievements: earnedAchievements.map(id => 
        ACHIEVEMENT_DEFINITIONS.find(a => a.id === id)
      ).filter(Boolean),
      newXp,
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}