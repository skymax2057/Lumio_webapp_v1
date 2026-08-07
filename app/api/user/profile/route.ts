import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Retrieve user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      location,
      website,
      occupation,
      company,
      favoriteStyles,
      favoriteMoods,
      favoriteColors,
      theme,
      layout,
      cardSize,
      animationsEnabled,
      softGlowEnabled,
      isProfilePublic,
      showEmail,
      showLocation,
      showStats,
    } = body;

    // Update user basic info
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update user bio
    if (bio !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { bio },
      });
    }

    // Update or create user profile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          location: location ?? existingProfile.location,
          website: website ?? existingProfile.website,
          occupation: occupation ?? existingProfile.occupation,
          company: company ?? existingProfile.company,
          favoriteStyles: favoriteStyles ? JSON.stringify(favoriteStyles) : existingProfile.favoriteStyles,
          favoriteMoods: favoriteMoods ? JSON.stringify(favoriteMoods) : existingProfile.favoriteMoods,
          favoriteColors: favoriteColors ? JSON.stringify(favoriteColors) : existingProfile.favoriteColors,
          theme: theme ?? existingProfile.theme,
          layout: layout ?? existingProfile.layout,
          cardSize: cardSize ?? existingProfile.cardSize,
          animationsEnabled: animationsEnabled ?? existingProfile.animationsEnabled,
          softGlowEnabled: softGlowEnabled ?? existingProfile.softGlowEnabled,
          isProfilePublic: isProfilePublic ?? existingProfile.isProfilePublic,
          showEmail: showEmail ?? existingProfile.showEmail,
          showLocation: showLocation ?? existingProfile.showLocation,
          showStats: showStats ?? existingProfile.showStats,
        },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          location,
          website,
          occupation,
          company,
          favoriteStyles: favoriteStyles ? JSON.stringify(favoriteStyles) : null,
          favoriteMoods: favoriteMoods ? JSON.stringify(favoriteMoods) : null,
          favoriteColors: favoriteColors ? JSON.stringify(favoriteColors) : null,
          theme: theme || "system",
          layout: layout || "grid",
          cardSize: cardSize || "medium",
          animationsEnabled: animationsEnabled ?? true,
          softGlowEnabled: softGlowEnabled ?? true,
          isProfilePublic: isProfilePublic ?? true,
          showEmail: showEmail ?? false,
          showLocation: showLocation ?? true,
          showStats: showStats ?? true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}