import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time seed route — protected by a secret token
// Call with: GET /api/seed-categories?token=YOUR_SEED_SECRET
const CATEGORIES = [
  { name: "Abstrait", slug: "abstrait", description: "Formes non figuratives, compositions abstraites et art conceptuel." },
  { name: "Action", slug: "action", description: "Scènes dynamiques, mouvement intense et captures d'action." },
  { name: "Affiche", slug: "affiche", description: "Design graphique, typographie et compositions visuelles percutantes." },
  { name: "Ambiance", slug: "ambiance", description: "Atmosphères évocatrices, lumières et ambiances visuelles." },
  { name: "Anime", slug: "anime", description: "Art japonais, style manga et illustrations animées." },
  { name: "Architecture", slug: "architecture", description: "Lignes épurées, structures futuristes et espaces sacrés." },
  { name: "Art 3D", slug: "art-3d", description: "Créations tridimensionnelles, rendu 3D et modélisation numérique." },
  { name: "Art classique", slug: "art-classique", description: "Œuvres classiques, peintures traditionnelles et art historique." },
  { name: "Art conceptuel", slug: "art-conceptuel", description: "Idées conceptuelles, art contemporain et expressions créatives." },
  { name: "Art fractal", slug: "art-fractal", description: "Motifs mathématiques, géométrie fractale et art algorithmique." },
  { name: "Art numérique", slug: "art-numerique", description: "Créations digitales, art numérique et illustrations virtuelles." },
  { name: "Art vectoriel", slug: "art-vectoriel", description: "Graphismes vectoriels, illustrations précises et art vectoriel." },
  { name: "Astrophotographie", slug: "astrophotographie", description: "Ciel étoilé, nébuleuses et captures astronomiques." },
  { name: "Astronomie", slug: "astronomie", description: "Univers, espace et phénomènes cosmiques." },
  { name: "Automobile", slug: "automobile", description: "Voitures, design automobile et mécanique." },
  { name: "Aventure", slug: "aventure", description: "Exploration, voyage et découvertes visuelles." },
  { name: "Boissons", slug: "boissons", description: "Café, cocktails et photographie culinaire." },
  { name: "Cinéma", slug: "cinema", description: "Scènes de film, cinéma et captures cinématographiques." },
  { name: "Citation", slug: "citation", description: "Typographie inspirante, citations et design textuel." },
  { name: "Comics", slug: "comics", description: "Bandes dessinées, comics et illustrations narratives." },
  { name: "Concept", slug: "concept", description: "Art conceptuel, idées créatives et design expérimental." },
  { name: "Cristal", slug: "cristal", description: "Cristaux, minéraux et photographie de gemmes." },
  { name: "Culture pop", slug: "culture-pop", description: "Pop culture, tendances et icones contemporaines." },
  { name: "Cyberpunk", slug: "cyberpunk", description: "Futurisme dystopique, néon et esthétique cyberpunk." },
  { name: "Danse", slug: "danse", description: "Mouvement, danse et captures de performance." },
  { name: "Décoration", slug: "decoration", description: "Intérieur, design d'intérieur et décoration." },
  { name: "Design", slug: "design", description: "Design graphique, interfaces, objets et typographie minimaliste." },
  { name: "Design minimaliste", slug: "design-minimaliste", description: "Minimalisme, épuré et design contemporain." },
  { name: "Espace", slug: "espace", description: "Cosmos, univers et exploration spatiale." },
  { name: "Fantastique", slug: "fantastique", description: "Fantasy, imaginaire et mondes fantastiques." },
  { name: "Fantasy", slug: "fantasy", description: "Mondes imaginaires, créatures fantastiques et fantasy." },
  { name: "Faune", slug: "faune", description: "Animaux sauvages, faune et photographie animalière." },
  { name: "Fleurs", slug: "fleurs", description: "Fleurs, botanique et photographie florale." },
  { name: "Fond d'écran", slug: "fond-ecran", description: "Wallpapers, fonds d'écran et arrière-plans." },
  { name: "Géométrique", slug: "geometrique", description: "Formes géométriques, patterns et abstractions." },
  { name: "Graphisme", slug: "graphisme", description: "Design graphique, illustrations et art visuel." },
  { name: "High-Tech", slug: "high-tech", description: "Technologie avancée, innovation et high-tech." },
  { name: "Horreur", slug: "horreur", description: "Horreur, sombre et esthétique gothique." },
  { name: "Humour", slug: "humour", description: "Humour, comédie et illustrations amusantes." },
  { name: "Illustration", slug: "illustration", description: "Illustrations, dessins et art graphique." },
  { name: "Inspiration", slug: "inspiration", description: "Inspirant, motivationnel et art positif." },
  { name: "Japon", slug: "japon", description: "Culture japonaise, esthétique nippon et Japon." },
  { name: "Jeux vidéo", slug: "jeux-video", description: "Gaming, jeux vidéo et captures de jeu." },
  { name: "Logo", slug: "logo", description: "Logos, branding et identité visuelle." },
  { name: "Macro", slug: "macro", description: "Photographie macro, détails et gros plans." },
  { name: "Manga", slug: "manga", description: "Manga, bandes dessinées japonaises et anime." },
  { name: "Mer", slug: "mer", description: "Océan, mer et photographie maritime." },
  { name: "Minimalisme", slug: "minimalisme", description: "Minimalisme, épuré et design simple." },
  { name: "Mode", slug: "mode", description: "Styles élégants, textures luxueuses et haute couture." },
  { name: "Montagne", slug: "montagne", description: "Montagnes, alpinisme et paysages de montagne." },
  { name: "Musique", slug: "musique", description: "Musique, concerts et photographie musicale." },
  { name: "Mythologie", slug: "mythologie", description: "Mythologie, légendes et art mythologique." },
  { name: "Nature", slug: "nature", description: "Sérénité de la faune, de la flore et des paysages grandioses." },
  { name: "Numérique", slug: "numerique", description: "Art numérique, digital et créations virtuelles." },
  { name: "Paysage", slug: "paysage", description: "Paysages, nature et photographie de paysage." },
  { name: "Paysage urbain", slug: "paysage-urbain", description: "Urbanisme, ville et photographie urbaine." },
  { name: "Peinture", slug: "peinture", description: "Peinture, art pictural et techniques artistiques." },
  { name: "Photographie", slug: "photographie", description: "Clichés captivants, paysages, portraits et instantanés poétiques." },
  { name: "Pixel Art", slug: "pixel-art", description: "Pixel art, rétro et esthétique pixelisée." },
  { name: "Portrait", slug: "portrait", description: "Portraits, visages et photographie de portrait." },
  { name: "Rétro", slug: "retro", description: "Rétro, vintage et nostalgie visuelle." },
  { name: "RPG", slug: "rpg", description: "RPG, jeux de rôle et fantasy gaming." },
  { name: "Science", slug: "science", description: "Science, recherche et photographie scientifique." },
  { name: "Science-fiction", slug: "science-fiction", description: "Sci-fi, futurisme et science-fiction." },
  { name: "Spiritualité", slug: "spiritualite", description: "Spiritualité, méditation et art spirituel." },
  { name: "Super-héros", slug: "super-heros", description: "Super-héros, comics et univers Marvel/DC." },
  { name: "Technologie", slug: "technologie", description: "Tech, innovation et photographie technologique." },
  { name: "Typographie", slug: "typographie", description: "Typographie, lettrage et design textuel." },
  { name: "Urbain", slug: "urbain", description: "Urbain, ville et photographie urbaine." },
  { name: "Vintage", slug: "vintage", description: "Vintage, rétro et esthétique ancienne." },
  { name: "Voyage", slug: "voyage", description: "Voyage, exploration et photographie de voyage." },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // Protect this route with a secret token
  if (token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    let created = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug },
      });

      if (!existing) {
        await prisma.category.create({ data: cat });
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seed terminé : ${created} catégories créées, ${skipped} déjà existantes.`,
      total: CATEGORIES.length,
    });
  } catch (error) {
    console.error("Seed categories error:", error);
    return NextResponse.json({ error: "Erreur lors du seed" }, { status: 500 });
  }
}
