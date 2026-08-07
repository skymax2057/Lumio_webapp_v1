import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const mood = searchParams.get("mood");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      isDeleted: false,
    };

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (mood && mood !== "all") {
      where.mood = mood;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const images = await prisma.image.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            likes: true,
            collections: true,
          },
        },
      },
    });

    const totalCount = await prisma.image.count({ where });

    // Check if liked by current user
    let userLikesSet = new Set<string>();
    if (currentUserId) {
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          imageId: { in: images.map((img: { id: string }) => img.id) },
        },
        select: { imageId: true },
      });
      userLikesSet = new Set(userLikes.map((l: { imageId: string }) => l.imageId));
    }

    const imagesWithLikedState = images.map((img: { id: string }) => ({
      ...img,
      isLikedByCurrentUser: userLikesSet.has(img.id),
    }));

    return NextResponse.json({
      images: imagesWithLikedState,
      page,
      hasMore: page * limit < totalCount,
      totalCount,
    });
  } catch (error) {
    console.error("GET /api/images error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
