import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authRateLimit, isRateLimitingEnabled } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Rate limiting
    if (isRateLimitingEnabled()) {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const { success, limit, reset, remaining } = await authRateLimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: "Trop de tentatives d'authentification. Veuillez réessayer dans quelques minutes.",
            limit,
            reset,
            remaining,
          },
          { status: 429 }
        );
      }
    }

    const { name, email, password, bio, interests, moods } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio: bio || "Créateur passionné sur Lumio Sanctuary.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        isOnboarded: true,
      },
    });

    // Create user profile with preferences
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        favoriteStyles: interests ? JSON.stringify(interests) : null,
        favoriteMoods: moods ? JSON.stringify(moods) : null,
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}