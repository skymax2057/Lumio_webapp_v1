import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Default reactions available
const DEFAULT_REACTIONS = ["❤️", "🔥", "✨", "🎨", "💯", "👏", "😍", "🌟"];

// GET - Get all reactions for an image
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: imageId } = await params;

    const reactions = await prisma.reaction.groupBy({
      by: ['emoji'],
      where: { imageId },
      _count: { emoji: true },
      orderBy: { _count: { emoji: 'desc' } },
    });

    const reactionCounts = reactions.map(r => ({
      emoji: r.emoji,
      count: r._count.emoji,
    }));

    // Get current user's reactions if authenticated
    const session = await auth();
    let userReactions: string[] = [];
    
    if (session?.user?.id) {
      const userReactionRecords = await prisma.reaction.findMany({
        where: {
          imageId,
          userId: session.user.id,
        },
        select: { emoji: true },
      });
      userReactions = userReactionRecords.map(r => r.emoji);
    }

    return NextResponse.json({
      reactions: reactionCounts,
      userReactions,
      availableReactions: DEFAULT_REACTIONS,
    });
  } catch (error) {
    console.error("Reactions fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Add a reaction to an image
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: imageId } = await params;
    const { emoji } = await req.json();

    if (!emoji || !DEFAULT_REACTIONS.includes(emoji)) {
      return NextResponse.json({ error: "Reaction invalide" }, { status: 400 });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_imageId_emoji: {
          userId: session.user.id,
          imageId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      return NextResponse.json({ error: "Vous avez déjà réagi avec cette émoji" }, { status: 400 });
    }

    // Create reaction
    await prisma.reaction.create({
      data: {
        userId: session.user.id,
        imageId,
        emoji,
      },
    });

    // Update image stats
    await prisma.image.update({
      where: { id: imageId },
      data: { sharesCount: { increment: 1 } },
    });

    // Create notification for image owner
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { userId: true },
    });

    if (image && image.userId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          recipientId: image.userId,
          actorId: session.user.id,
          type: "REACTION",
          imageId,
          message: `${user?.name || "Quelqu'un"} a réagi avec ${emoji} à votre œuvre`,
          metadata: JSON.stringify({ emoji, actorName: user?.name }),
        },
      });
    }

    return NextResponse.json({ success: true, emoji });
  } catch (error) {
    console.error("Reaction add error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Remove a reaction from an image
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: imageId } = await params;
    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: "Emoji manquant" }, { status: 400 });
    }

    // Delete reaction
    await prisma.reaction.deleteMany({
      where: {
        userId: session.user.id,
        imageId,
        emoji,
      },
    });

    return NextResponse.json({ success: true, emoji });
  } catch (error) {
    console.error("Reaction remove error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
