import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - List all active sessions for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get all sessions for the current user
    const sessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        expires: true,
        sessionToken: true,
      },
      orderBy: { expires: "desc" },
    });

    // Get current session token from cookies (simplified - in production you'd parse the cookie)
    const currentSessionToken = sessions[0]?.sessionToken || "";

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      sessionToken: s.sessionToken.slice(0, 8) + "..." + s.sessionToken.slice(-4),
      expires: s.expires,
      isCurrent: s.sessionToken === currentSessionToken,
      status: new Date(s.expires) > new Date() ? "active" : "expired",
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Delete all sessions except the current one
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get current session token from the request cookies
    const currentSessionToken = req.cookies.get("next-auth.session-token")?.value || "";

    // Delete all sessions except the current one
    const deletedCount = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        sessionToken: {
          not: currentSessionToken,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount.count,
      message: `${deletedCount.count} sessions déconnectées`,
    });
  } catch (error) {
    console.error("Sessions delete error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}