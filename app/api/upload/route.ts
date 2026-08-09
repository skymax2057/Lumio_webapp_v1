import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { extractColorAndMoodFromImage } from "@/lib/color-extractor";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Max file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif"];

// Zod schema for upload metadata validation
const uploadSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire").max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  categoryId: z.string().cuid("categoryId doit être un CUID valide").nullable().optional(),
  tags: z.string().max(200, "Les tags ne peuvent pas dépasser 200 caractères").optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Build raw data object for validation
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string,
      tags: formData.get("tags") as string,
    };

    // Validate metadata with Zod
    const validation = uploadSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { title, description, categoryId, tags } = validation.data;

    if (!file) {
      return NextResponse.json({ error: "Fichier obligatoire" }, { status: 400 });
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

    // Format tags array from validated data
    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0)
      : [];

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
  } catch (error: any) {
    console.error("Upload error:", error);

    // Handle connection errors gracefully
    if (error.code === 'P1001' || error.code === 'P1003') {
      return NextResponse.json({ 
        error: "Database connection temporarily unavailable. Please try again.",
        retryable: true 
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
