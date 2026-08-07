import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Get user suggestions based on various criteria
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Get current user's profile for matching
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Get users the current user is already following
    const followingIds = (
      await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      })
    ).map((f) => f.followingId);

    // Get users who follow the current user (for follow-back suggestions)
    const followersIds = (
      await prisma.follow.findMany({
        where: { followingId: currentUserId },
        select: { followerId: true },
      })
    ).map((f) => f.followerId);

    // Get mutual connections (users followed by people you follow)
    const mutualConnectionsMap = new Map<string, number>();
    if (followingIds.length > 0) {
      const followsOfFollows = await prisma.follow.findMany({
        where: {
          followerId: { in: followingIds },
          followingId: { not: currentUserId, notIn: followingIds },
        },
        select: { followingId: true },
      });

      followsOfFollows.forEach((follow) => {
        mutualConnectionsMap.set(
          follow.followingId,
          (mutualConnectionsMap.get(follow.followingId) || 0) + 1
        );
      });
    }

    // Get all users except current user and those already followed
    const potentialUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUserId, notIn: followingIds },
        // Only suggest users with complete profiles
        profile: {
          isNot: null
        }
      },
      include: { 
        profile: true,
        _count: {
          select: {
            images: true,
            followers: true
          }
        }
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Score each user based on various criteria
    const scoredUsers = potentialUsers.map((user) => {
      let score = 0;
      const reasons: string[] = [];

      // HIGH PRIORITY: Follow-back detection
      if (followersIds.includes(user.id)) {
        score += 25;
        reasons.push("Vous suit déjà");
      }

      // HIGH PRIORITY: Mutual connections
      const mutualCount = mutualConnectionsMap.get(user.id) || 0;
      if (mutualCount > 0) {
        score += mutualCount * 12;
        if (mutualCount === 1) {
          reasons.push("1 connexion en commun");
        } else {
          reasons.push(`${mutualCount} connexions en commun`);
        }
      }

      // Parse preferences with better error handling
      const currentUserProfile = currentUser.profile;
      const userProfile = user.profile;

      if (currentUserProfile && userProfile) {
        // Check matching favorite styles
        try {
          const currentStyles = JSON.parse(currentUserProfile.favoriteStyles || "[]");
          const userStyles = JSON.parse(userProfile.favoriteStyles || "[]");
          if (Array.isArray(currentStyles) && Array.isArray(userStyles)) {
            const styleMatches = currentStyles.filter((style: string) =>
              userStyles.includes(style)
            ).length;
            if (styleMatches > 0) {
              score += styleMatches * 10;
              reasons.push("Goûts artistiques similaires");
            }
          }
        } catch (e) {
          console.warn("Invalid favoriteStyles JSON for user:", user.id);
        }

        // Check matching favorite moods
        try {
          const currentMoods = JSON.parse(currentUserProfile.favoriteMoods || "[]");
          const userMoods = JSON.parse(userProfile.favoriteMoods || "[]");
          if (Array.isArray(currentMoods) && Array.isArray(userMoods)) {
            const moodMatches = currentMoods.filter((mood: string) =>
              userMoods.includes(mood)
            ).length;
            if (moodMatches > 0) {
              score += moodMatches * 8;
              reasons.push("Ambiances préférées communes");
            }
          }
        } catch (e) {
          console.warn("Invalid favoriteMoods JSON for user:", user.id);
        }

        // Check matching location
        if (
          currentUserProfile.location &&
          userProfile.location &&
          currentUserProfile.location.trim() === userProfile.location.trim()
        ) {
          score += 15;
          reasons.push("Même région");
        }

        // Check matching languages
        try {
          const currentLanguages = JSON.parse(currentUserProfile.languages || "[]");
          const userLanguages = JSON.parse(userProfile.languages || "[]");
          if (Array.isArray(currentLanguages) && Array.isArray(userLanguages)) {
            const languageMatches = currentLanguages.filter((lang: string) =>
              userLanguages.includes(lang)
            ).length;
            if (languageMatches > 0) {
              score += languageMatches * 5;
              reasons.push("Langues communes");
            }
          }
        } catch (e) {
          console.warn("Invalid languages JSON for user:", user.id);
        }
      }

      // Boost score for verified and pro users
      if (user.isVerified) {
        score += 10;
        reasons.push("Créateur vérifié");
      }
      if (user.isPro) {
        score += 5;
        reasons.push("Membre Pro");
      }

      // Boost score for users with more followers (active creators)
      const userFollowersCount = user.followersCount || 0;
      if (userFollowersCount > 100) {
        score += 15;
        reasons.push("Créateur tendance");
      } else if (userFollowersCount > 50) {
        score += 8;
        reasons.push("Créateur populaire");
      } else if (userFollowersCount > 10) {
        score += 5;
        reasons.push("Créateur actif");
      }

      // Boost for active content creators
      const imageCount = user._count?.images || 0;
      if (imageCount > 20) {
        score += 8;
        reasons.push("Productif");
      } else if (imageCount > 5) {
        score += 4;
        reasons.push("Actif");
      }

      // Boost for recently active users (based on creation date if available)
      if (user.createdAt) {
        const daysSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 7) {
          score += 7;
          reasons.push("Nouveau membre");
        } else if (daysSinceCreation < 30) {
          score += 3;
          reasons.push("Récent");
        }
      }

      // Add some randomness for variety
      score += Math.random() * 5;

      // Ensure minimum score for users with no matches
      if (reasons.length === 0) {
        score += Math.random() * 3;
        reasons.push("Découvrir");
      }

      return {
        user,
        score,
        reasons: [...new Set(reasons)], // Remove duplicates
        mutualCount,
        isFollowBack: followersIds.includes(user.id),
      };
    });

    // Sort by score and take top suggestions
    const topSuggestions = scoredUsers
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => ({
        id: item.user.id,
        name: item.user.name,
        image: item.user.image,
        bio: item.user.bio,
        followersCount: item.user.followersCount,
        isVerified: item.user.isVerified,
        isPro: item.user.isPro,
        reasons: item.reasons.slice(0, 3), // Top 3 reasons
        mutualCount: item.mutualCount,
        isFollowBack: item.isFollowBack,
        imageCount: item.user._count?.images || 0,
      }));

    return NextResponse.json({ suggestions: topSuggestions });
  } catch (error) {
    console.error("Suggestions fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
