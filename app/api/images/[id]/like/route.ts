import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: imageId } = await params;

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true, userId: true, title: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image non trouvée" }, { status: 404 });
    }

    // Check existing like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_imageId: { userId, imageId },
      },
    });

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Add like
      await prisma.like.create({
        data: {
          userId,
          imageId,
        },
      });

      // Create notification for author if different user
      if (image.userId !== userId) {
        await prisma.notification.create({
          data: {
            recipientId: image.userId,
            actorId: userId,
            type: "LIKE",
            imageId: image.id,
            message: `${session.user.name || "Un membre"} a aimé votre création "${image.title}"`,
          },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
