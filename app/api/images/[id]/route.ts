import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await prisma.image.findUnique({
      where: { id, isDeleted: false },
      include: {
        user: true,
        category: true,
        _count: {
          select: { likes: true, collections: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image non trouvée" }, { status: 404 });
    }

    // Increment views count
    await prisma.image.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, categoryId, tags, mood } = body;

    const updated = await prisma.image.update({
      where: { id },
      data: {
        title: title ?? image.title,
        description: description ?? image.description,
        categoryId: categoryId ?? image.categoryId,
        tags: tags ? JSON.stringify(tags) : image.tags,
        mood: mood ?? image.mood,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    // Soft delete
    await prisma.image.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true, message: "Image supprimée" });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
