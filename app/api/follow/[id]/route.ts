import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Follow a user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous suivre vous-même" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "Vous suivez déjà cet utilisateur" }, { status: 400 });
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    // Update follower/following counts
    await prisma.user.update({
      where: { id: targetUserId },
      data: { followersCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: currentUserId },
      data: { followingCount: { increment: 1 } },
    });

    // Create notification
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        recipientId: targetUserId,
        actorId: currentUserId,
        type: "FOLLOW",
        message: `${currentUser?.name || "Quelqu'un"} vous suit maintenant`,
        metadata: JSON.stringify({ followerName: currentUser?.name }),
      },
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Unfollow a user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json({ error: "Vous ne suivez pas cet utilisateur" }, { status: 400 });
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    // Update follower/following counts
    await prisma.user.update({
      where: { id: targetUserId },
      data: { followersCount: { decrement: 1 } },
    });

    await prisma.user.update({
      where: { id: currentUserId },
      data: { followingCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET - Check if following and get follow status
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ following: false, isOwnProfile: false });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;
    const isOwnProfile = targetUserId === currentUserId;

    if (isOwnProfile) {
      return NextResponse.json({ following: false, isOwnProfile: true });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({ 
      following: !!existingFollow, 
      isOwnProfile: false 
    });
  } catch (error) {
    console.error("Follow status check error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
