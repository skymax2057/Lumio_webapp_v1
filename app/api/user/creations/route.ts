import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const images = await prisma.image.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true } },
      },
    });

    const totalUploads = images.length;
    const totalViews = images.reduce((acc: number, img: { viewsCount: number }) => acc + img.viewsCount, 0);

    const likesCount = await prisma.like.count({
      where: { image: { userId, isDeleted: false } },
    });

    return NextResponse.json({
      images,
      stats: {
        totalUploads,
        totalLikes: likesCount,
        totalViews,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
