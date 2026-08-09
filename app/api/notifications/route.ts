import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: { select: { name: true, image: true } },
        image: { select: { id: true, title: true, url: true } },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);

    // Handle connection errors gracefully
    if (error.code === 'P1001' || error.code === 'P1003') {
      return NextResponse.json({ 
        notifications: [], 
        error: "Database connection temporarily unavailable",
        retryable: true 
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
