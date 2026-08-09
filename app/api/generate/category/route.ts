import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Clé API Gemini non configurée" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `Tu es un assistant IA spécialisé dans l'art, la photographie et la création visuelle pour l'application "Lumio Sanctuary".
Génère une courte description inspirante (maximum 2 à 3 phrases) pour une catégorie d'œuvres nommée "${name}".
La description doit être poétique, engageante et professionnelle. Ne renvoie QUE la description, sans introduction, sans guillemets, et sans formattage Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error("Erreur génération catégorie:", error);
    return NextResponse.json({ error: "Erreur lors de la génération de la description" }, { status: 500 });
  }
}
