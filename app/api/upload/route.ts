import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { extractColorAndMoodFromImage } from "@/lib/color-extractor";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Max file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const categoryId = (formData.get("categoryId") as string) || null;
    const tagsInput = (formData.get("tags") as string) || "";

    if (!file || !title) {
      return NextResponse.json({ error: "Fichier et titre obligatoires" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilise JPG, PNG, WebP, AVIF ou GIF." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 20MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(buffer, {
      folder: "lumio/uploads",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    // Extract color & mood from Cloudinary URL
    const colorAnalysis = extractColorAndMoodFromImage(uploaded.url);

    // Format tags array
    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const image = await prisma.image.create({
      data: {
        title,
        description,
        url: uploaded.url,
        thumbnailUrl: uploaded.url,
        userId: session.user.id,
        categoryId: categoryId || undefined,
        dominantColor: colorAnalysis.dominantColor,
        palette: JSON.stringify(colorAnalysis.palette),
        mood: colorAnalysis.mood,
        tags: JSON.stringify(tagsArray),
        width: uploaded.width || 1200,
        height: uploaded.height || 900,
        format: uploaded.format,
        fileSize: file.size,
      },
      include: {
        user: true,
        category: true,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
