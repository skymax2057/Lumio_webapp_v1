import { HeroSection } from "@/components/hero-section";
import { DailyLight } from "@/components/daily-light";
import { CategoryFilter } from "@/components/feed/category-filter";
import { MasonryGrid } from "@/components/feed/masonry-grid";
import { MoodFilter } from "@/components/feed/mood-filter";
import { Footer } from "@/components/footer";
import { Lightbox } from "@/components/lightbox";
import { Navbar } from "@/components/navbar";
import { VisualEchoModal } from "@/components/visual-echo-modal";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  // Fetch initial images
  const initialImages = await prisma.image.findMany({
    where: { isDeleted: false },
    take: 24,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, collections: true },
      },
    },
  });

  // Check user likes
  let userLikesSet = new Set<string>();
  if (currentUserId) {
    const userLikes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        imageId: { in: initialImages.map((img) => img.id) },
      },
      select: { imageId: true },
    });
    userLikesSet = new Set(userLikes.map((l) => l.imageId));
  }

  const imagesWithLikedState = initialImages.map((img) => ({
    ...img,
    isLikedByCurrentUser: userLikesSet.has(img.id),
  }));

  // Daily Light featured image (pick 1 random or top view image)
  const dailyFeaturedImage = initialImages.length > 0 ? initialImages[0] : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Daily Light Featured Banner */}
          {dailyFeaturedImage && (
            <div className="mb-12">
              <DailyLight image={dailyFeaturedImage as any} />
            </div>
          )}

          {/* Categories Bar */}
          <div className="mb-8">
            <CategoryFilter />
          </div>

          {/* Lumina Mood Filter */}
          <div className="mb-10">
            <MoodFilter />
          </div>

          {/* Main Masonry Grid */}
          <div>
            <MasonryGrid initialImages={imagesWithLikedState as any} />
          </div>
        </div>
      </main>

      <Lightbox />
      <VisualEchoModal />

      <Footer />
    </div>
  );
}
