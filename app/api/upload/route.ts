import { auth } from "@/lib/auth";
import { extractColorAndMoodFromImage } from "@/lib/color-extractor";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    // Extract color & mood
    const colorAnalysis = extractColorAndMoodFromImage(imageUrl);

    // Format tags array
    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const image = await prisma.image.create({
      data: {
        title,
        description,
        url: imageUrl,
        thumbnailUrl: imageUrl,
        userId: session.user.id,
        categoryId: categoryId || undefined,
        dominantColor: colorAnalysis.dominantColor,
        palette: JSON.stringify(colorAnalysis.palette),
        mood: colorAnalysis.mood,
        tags: JSON.stringify(tagsArray),
        width: 1200,
        height: 900,
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
