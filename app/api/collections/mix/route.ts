import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collectionIds } = body;

    if (!Array.isArray(collectionIds) || collectionIds.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const items = await prisma.collectionImage.findMany({
      where: {
        collectionId: { in: collectionIds },
        image: { isDeleted: false },
      },
      include: {
        image: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    // Deduplicate images
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.image.id)) {
        map.set(item.image.id, item.image);
      }
    }

    const images = Array.from(map.values());

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Collection mix error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
