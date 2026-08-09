import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Safe JSON parser that handles markdown and malformed responses
function safeJsonParse(str: string): { description: string; tags: string } | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = str
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Try to extract JSON if there's extra text around it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (parsed && typeof parsed.description === "string" && typeof parsed.tags === "string") {
      return { description: parsed.description, tags: parsed.tags };
    }

    return null;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const image = formData.get("image") as File | null;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Clé API Gemini non configurée" }, { status: 500 });
    }

    // Use gemini-3.5-flash as it supports multimodal (text + image)
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    let prompt = `Tu es un assistant IA spécialisé dans l'art, la photographie et la création visuelle pour l'application "Lumio Sanctuary".
L'utilisateur s'apprête à publier une œuvre.`;

    if (title) {
      prompt += `\nLe titre donné est : "${title}".`;
    }

    prompt += `\nGénère une belle description poétique (2-3 paragraphes) pour cette œuvre.
Renvoie la réponse sous forme d'objet JSON strict sans fioritures (pas de markdown \`\`\`json) avec cette structure :
{
  "description": "Ta description poétique ici...",
  "tags": "tag1, tag2, tag3, tag4"
}`;

    const parts: any[] = [prompt];

    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      parts.push({
        inlineData: {
          data: base64,
          mimeType: image.type,
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().trim();

    // Use safe JSON parser with fallback
    const parsedData = safeJsonParse(text) || {
      description: text.substring(0, 500),
      tags: "art, lumio"
    };

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Erreur génération post:", error);
    return NextResponse.json({ error: "Erreur lors de la génération de la description du post" }, { status: 500 });
  }
}
