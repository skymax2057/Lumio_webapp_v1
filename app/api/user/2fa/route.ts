import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

// Helper function to generate a secret key
function generateSecret() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  // Convert to base32 (simplified - in production use a proper library like 'speakeasy')
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// GET - Get 2FA status for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId: session.user.id },
      select: { enabled: true },
    });

    return NextResponse.json({
      enabled: twoFactorSecret?.enabled || false,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Enable 2FA (generate secret and QR code URL)
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const secret = generateSecret();
    const issuer = "Lumio";
    const label = `${issuer}:${session.user.email}`;
    
    // Generate QR code URL (for use with Google Authenticator, Authy, etc.)
    // Format: otpauth://totp/ISSUER:LABEL?secret=SECRET&issuer=ISSUER
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    // Generate backup codes (8 codes of 8 characters each)
    const backupCodes = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
      ).join("")
    );

    // Store the secret (not enabled yet - user needs to verify first)
    await prisma.twoFactorSecret.upsert({
      where: { userId: session.user.id },
      update: {
        secret,
        enabled: false,
        backupCodes: JSON.stringify(backupCodes),
      },
      create: {
        userId: session.user.id,
        secret,
        enabled: false,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    return NextResponse.json({
      secret,
      qrCodeUrl,
      backupCodes,
      message: "Scannez le QR code avec votre application d'authentification",
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Verify 2FA code and enable
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Code invalide (6 chiffres requis)" }, { status: 400 });
    }

    // Get the stored secret
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId: session.user.id },
    });

    if (!twoFactorSecret) {
      return NextResponse.json({ error: "Aucune configuration 2FA trouvée" }, { status: 400 });
    }

    // In production, use a proper TOTP library to verify the code
    // For now, we'll accept any 6-digit code for demonstration
    // TODO: Implement proper TOTP verification with 'speakeasy' or similar
    
    // Enable 2FA
    await prisma.twoFactorSecret.update({
      where: { userId: session.user.id },
      data: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      message: "Authentification à deux facteurs activée avec succès !",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Disable 2FA
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { code, backupCode } = await req.json();

    // Either verify current TOTP code or use a backup code
    // In production, implement proper verification

    await prisma.twoFactorSecret.update({
      where: { userId: session.user.id },
      data: { enabled: false },
    });

    return NextResponse.json({
      success: true,
      message: "Authentification à deux facteurs désactivée.",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}