import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            images: { where: { isDeleted: false } },
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const images = await prisma.image.findMany({
      where: { userId: id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({ user, images });
  } catch (error) {
    console.error("GET /api/user/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
