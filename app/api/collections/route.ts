import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const collections = await prisma.collection.findMany({
      where: {
        OR: [
          { isPrivate: false },
          ...(currentUserId ? [{ userId: currentUserId }] : []),
        ],
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        images: {
          take: 4,
          include: { image: true },
        },
        _count: { select: { images: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, isPrivate } = body;

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        description,
        isPrivate: !!isPrivate,
        userId: session.user.id,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("POST /api/collections error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
