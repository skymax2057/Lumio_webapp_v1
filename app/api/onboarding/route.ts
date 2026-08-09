import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { bio, interests, moods } = await req.json();

    // Update user bio
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: bio || "Créateur passionné sur Lumio Sanctuary.",
        isOnboarded: true,
      },
    });

    // Update user profile with preferences
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        favoriteStyles: interests ? JSON.stringify(interests) : undefined,
        favoriteMoods: moods ? JSON.stringify(moods) : undefined,
      },
      create: {
        userId: session.user.id,
        favoriteStyles: interests ? JSON.stringify(interests) : null,
        favoriteMoods: moods ? JSON.stringify(moods) : null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Onboarding error:", error);

    // Handle connection errors gracefully
    if (error.code === 'P1001' || error.code === 'P1003') {
      return NextResponse.json({ 
        error: "Database connection temporarily unavailable. Please try again.",
        retryable: true 
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
