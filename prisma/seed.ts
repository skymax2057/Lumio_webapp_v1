import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Abstrait', slug: 'abstrait', description: 'Formes non figuratives, compositions abstraites et art conceptuel.' },
  { name: 'Action', slug: 'action', description: 'Scènes dynamiques, mouvement intense et captures d\'action.' },
  { name: 'Affiche', slug: 'affiche', description: 'Design graphique, typographie et compositions visuelles percutantes.' },
  { name: 'Ambiance', slug: 'ambiance', description: 'Atmosphères évocatrices, lumières et ambiances visuelles.' },
  { name: 'Anime', slug: 'anime', description: 'Art japonais, style manga et illustrations animées.' },
  { name: 'Architecture', slug: 'architecture', description: 'Lignes épurées, structures futuristes et espaces sacrés.' },
  { name: 'Art 3D', slug: 'art-3d', description: 'Créations tridimensionnelles, rendu 3D et modélisation numérique.' },
  { name: 'Art classique', slug: 'art-classique', description: 'Œuvres classiques, peintures traditionnelles et art historique.' },
  { name: 'Art conceptuel', slug: 'art-conceptuel', description: 'Idées conceptuelles, art contemporain et expressions créatives.' },
  { name: 'Art fractal', slug: 'art-fractal', description: 'Motifs mathématiques, géométrie fractale et art algorithmique.' },
  { name: 'Art numérique', slug: 'art-numerique', description: 'Créations digitales, art numérique et illustrations virtuelles.' },
  { name: 'Art vectoriel', slug: 'art-vectoriel', description: 'Graphismes vectoriels, illustrations précises et art vectoriel.' },
  { name: 'Astrophotographie', slug: 'astrophotographie', description: 'Ciel étoilé, nébuleuses et captures astronomiques.' },
  { name: 'Astronomie', slug: 'astronomie', description: 'Univers, espace et phénomènes cosmiques.' },
  { name: 'Automobile', slug: 'automobile', description: 'Voitures, design automobile et mécanique.' },
  { name: 'Aventure', slug: 'aventure', description: 'Exploration, voyage et découvertes visuelles.' },
  { name: 'Boissons', slug: 'boissons', description: 'Café, cocktails et photographie culinaire.' },
  { name: 'Cinéma', slug: 'cinema', description: 'Scènes de film, cinéma et captures cinématographiques.' },
  { name: 'Citation', slug: 'citation', description: 'Typographie inspirante, citations et design textuel.' },
  { name: 'Comics', slug: 'comics', description: 'Bandes dessinées, comics et illustrations narratives.' },
  { name: 'Concept', slug: 'concept', description: 'Art conceptuel, idées créatives et design expérimental.' },
  { name: 'Cristal', slug: 'cristal', description: 'Cristaux, minéraux et photographie de gemmes.' },
  { name: 'Culture pop', slug: 'culture-pop', description: 'Pop culture, tendances et icones contemporaines.' },
  { name: 'Cyberpunk', slug: 'cyberpunk', description: 'Futurisme dystopique, néon et esthétique cyberpunk.' },
  { name: 'Danse', slug: 'danse', description: 'Mouvement, danse et captures de performance.' },
  { name: 'Décoration', slug: 'decoration', description: 'Intérieur, design d\'intérieur et décoration.' },
  { name: 'Décoration intérieure', slug: 'decoration-interieure', description: 'Design d\'intérieur, espaces et aménagement.' },
  { name: 'Design', slug: 'design', description: 'Design graphique, interfaces, objets et typographie minimaliste.' },
  { name: 'Design 3D', slug: 'design-3d', description: 'Modélisation 3D, design tridimensionnel et rendu.' },
  { name: 'Design minimaliste', slug: 'design-minimaliste', description: 'Minimalisme, épuré et design contemporain.' },
  { name: 'Design typographique', slug: 'design-typographique', description: 'Typographie, lettrage et design textuel.' },
  { name: 'Drame', slug: 'drame', description: 'Scènes dramatiques, émotion et narration visuelle.' },
  { name: 'Élégant', slug: 'elegant', description: 'Élégance, sophistication et esthétique raffinée.' },
  { name: 'Émotionnel', slug: 'emotionnel', description: 'Émotions, expressions et art émotionnel.' },
  { name: 'Enfants', slug: 'enfants', description: 'Enfance, innocence et photographie enfantine.' },
  { name: 'Espace', slug: 'espace', description: 'Cosmos, univers et exploration spatiale.' },
  { name: 'Fantastique', slug: 'fantastique', description: 'Fantasy, imaginaire et mondes fantastiques.' },
  { name: 'Fantasy', slug: 'fantasy', description: 'Mondes imaginaires, créatures fantastiques et fantasy.' },
  { name: 'Fanart', slug: 'fanart', description: 'Art de fans, créations communautaires et hommages.' },
  { name: 'Faune', slug: 'faune', description: 'Animaux sauvages, faune et photographie animalière.' },
  { name: 'Fleurs', slug: 'fleurs', description: 'Fleurs, botanique et photographie florale.' },
  { name: 'Fond d\'écran', slug: 'fond-ecran', description: 'Wallpapers, fonds d\'écran et arrière-plans.' },
  { name: 'Géométrique', slug: 'geometrique', description: 'Formes géométriques, patterns et abstractions.' },
  { name: 'Graphisme', slug: 'graphisme', description: 'Design graphique, illustrations et art visuel.' },
  { name: 'Hardware', slug: 'hardware', description: 'Matériel informatique, tech et photographie hardware.' },
  { name: 'High-Tech', slug: 'high-tech', description: 'Technologie avancée, innovation et high-tech.' },
  { name: 'Histoire', slug: 'histoire', description: 'Histoire, patrimoine et photographie historique.' },
  { name: 'Horreur', slug: 'horreur', description: 'Horreur, sombre et esthétique gothique.' },
  { name: 'Humour', slug: 'humour', description: 'Humour, comédie et illustrations amusantes.' },
  { name: 'Illustration', slug: 'illustration', description: 'Illustrations, dessins et art graphique.' },
  { name: 'Illustrations animales', slug: 'illustrations-animales', description: 'Art animalier, créatures et illustrations faune.' },
  { name: 'Inspiration', slug: 'inspiration', description: 'Inspirant, motivationnel et art positif.' },
  { name: 'Japon', slug: 'japon', description: 'Culture japonaise, esthétique nippon et Japon.' },
  { name: 'Jeux vidéo', slug: 'jeux-video', description: 'Gaming, jeux vidéo et captures de jeu.' },
  { name: 'Linux', slug: 'linux', description: 'Linux, open source et technologie libre.' },
  { name: 'Logo', slug: 'logo', description: 'Logos, branding et identité visuelle.' },
  { name: 'Macro', slug: 'macro', description: 'Photographie macro, détails et gros plans.' },
  { name: 'Manga', slug: 'manga', description: 'Manga, bandes dessinées japonaises et anime.' },
  { name: 'Marvel', slug: 'marvel', description: 'Marvel, super-héros et univers comics.' },
  { name: 'Matériel informatique', slug: 'materiel-informatique', description: 'PC, composants et photographie tech.' },
  { name: 'Mécanique', slug: 'mecanique', description: 'Mécanique, ingénierie et photographie industrielle.' },
  { name: 'Mer', slug: 'mer', description: 'Océan, mer et photographie maritime.' },
  { name: 'Minimalisme', slug: 'minimalisme', description: 'Minimalisme, épuré et design simple.' },
  { name: 'Mode', slug: 'mode', description: 'Styles élégants, textures luxueuses et haute couture.' },
  { name: 'Moderne', slug: 'moderne', description: 'Moderne, contemporain et design actuel.' },
  { name: 'Montagne', slug: 'montagne', description: 'Montagnes, alpinisme et paysages de montagne.' },
  { name: 'Motivation', slug: 'motivation', description: 'Motivationnel, inspirant et art positif.' },
  { name: 'Musique', slug: 'musique', description: 'Musique, concerts et photographie musicale.' },
  { name: 'Mythologie', slug: 'mythologie', description: 'Mythologie, légendes et art mythologique.' },
  { name: 'Nature', slug: 'nature', description: 'Sérénité de la faune, de la flore et des paysages grandioses.' },
  { name: 'Nature morte', slug: 'nature-morte', description: 'Nature morte, still life et compositions.' },
  { name: 'Numérique', slug: 'numerique', description: 'Art numérique, digital et créations virtuelles.' },
  { name: 'Paysage', slug: 'paysage', description: 'Paysages, nature et photographie de paysage.' },
  { name: 'Paysage urbain', slug: 'paysage-urbain', description: 'Urbanisme, ville et photographie urbaine.' },
  { name: 'PC Modding', slug: 'pc-modding', description: 'PC modding, custom et hardware modifié.' },
  { name: 'Peinture', slug: 'peinture', description: 'Peinture, art pictural et techniques artistiques.' },
  { name: 'Photographie', slug: 'photographie', description: 'Clichés captivants, paysages, portraits et instantanés poétiques.' },
  { name: 'Photographie animalière', slug: 'photographie-animaliere', description: 'Animaux sauvages, faune et wildlife photography.' },
  { name: 'Pixel Art', slug: 'pixel-art', description: 'Pixel art, rétro et esthétique pixelisée.' },
  { name: 'Portrait', slug: 'portrait', description: 'Portraits, visages et photographie de portrait.' },
  { name: 'Promotion', slug: 'promotion', description: 'Marketing, publicité et design promotionnel.' },
  { name: 'Rétro', slug: 'retro', description: 'Rétro, vintage et nostalgie visuelle.' },
  { name: 'Rétrogaming', slug: 'retrogaming', description: 'Rétrogaming, jeux rétro et gaming vintage.' },
  { name: 'RPG', slug: 'rpg', description: 'RPG, jeux de rôle et fantasy gaming.' },
  { name: 'Science', slug: 'science', description: 'Science, recherche et photographie scientifique.' },
  { name: 'Science-fiction', slug: 'science-fiction', description: 'Sci-fi, futurisme et science-fiction.' },
  { name: 'Spiritualité', slug: 'spiritualite', description: 'Spiritualité, méditation et art spirituel.' },
  { name: 'Sport mécanique', slug: 'sport-mecanique', description: 'Sport automobile, course et mécanique sportive.' },
  { name: 'Super-héros', slug: 'super-heros', description: 'Super-héros, comics et univers Marvel/DC.' },
  { name: 'Technologie', slug: 'technologie', description: 'Tech, innovation et photographie technologique.' },
  { name: 'Typographie', slug: 'typographie', description: 'Typographie, lettrage et design textuel.' },
  { name: 'Urbain', slug: 'urbain', description: 'Urbain, ville et photographie urbaine.' },
  { name: 'Vintage', slug: 'vintage', description: 'Vintage, rétro et esthétique ancienne.' },
  { name: 'Vie aquatique', slug: 'vie-aquatique', description: 'Vie aquatique, océan et photographie sous-marine.' },
  { name: 'Voyage', slug: 'voyage', description: 'Voyage, exploration et photographie de voyage.' },
];

const MOODS = ['calme', 'énergique', 'mystérieuse', 'sereine', 'minimaliste', 'vibrante', 'sombre', 'chaleureuse'];

const PALETTES = [
  '["#0A0A0B","#D4AF37","#252530","#E2E8F0"]',
  '["#1E1B18","#C5A059","#8C7243","#F5F5F0"]',
  '["#0F172A","#38BDF8","#1E293B","#F8FAFC"]',
  '["#18181B","#A1A1AA","#3F3F46","#FAFAFA"]',
  '["#2D124D","#9333EA","#3B0764","#F3E8FF"]',
  '["#064E3B","#10B981","#022C22","#ECFDF5"]',
  '["#7C2D12","#F97316","#451A03","#FFF7ED"]',
];

const DEMO_USERS = [
  {
    name: 'Elena Rostova',
    email: 'elena@lumio.art',
    bio: 'Photographe plasticienne & directrice artistique. Recherche de la lumière pure dans les espaces sombres.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Marcus Vance',
    email: 'marcus@lumio.art',
    bio: 'Architecte d\'intérieur & designer minimaliste basé à Tokyo. Passionné par le mouvement Bauhaus.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Sora Takahashi',
    email: 'sora@lumio.art',
    bio: 'Artiste numérique 3D & concept artist. Créateur d\'univers surréalistes et contemplatifs.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Lumio Admin',
    email: 'demo@lumio.art',
    bio: 'Compte Officiel de Curation Lumio Sanctuary. Exploration quotidienne du beau et de l\'essentiel.',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  },
];

async function main() {
  console.log('🌱 Starting Lumio database seeding...');

  // 1. Ensure public uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Clear existing records
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.collectionImage.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.image.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Categories
  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  const categoryIds = Array.from(categoryMap.values());

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const createdUsers = [];
  for (const u of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        ...u,
        password: passwordHash,
      },
    });
    createdUsers.push(user);
  }

  // 4. Collect local image files from root & Images/
  const imageFiles: { srcPath: string; fileName: string }[] = [];

  // Check root files
  const rootFiles = ['hero-bg.jpg', 'img_1.jpg', 'img_2.jpg'];
  for (const f of rootFiles) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      imageFiles.push({ srcPath: p, fileName: f });
    }
  }

  // Check Images directory
  const imagesDirPath = path.join(process.cwd(), 'Images');
  if (fs.existsSync(imagesDirPath)) {
    const filesInDir = fs.readdirSync(imagesDirPath);
    for (const f of filesInDir) {
      const fullP = path.join(imagesDirPath, f);
      if (fs.statSync(fullP).isFile() && (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp'))) {
        imageFiles.push({ srcPath: fullP, fileName: f });
      }
    }
  }

  console.log(`📸 Found ${imageFiles.length} image files to seed.`);

  // 5. Copy images to public/uploads and create Image records
  const sampleTitles = [
    'Équilibre Lumineux & Clarté',
    'Sérénité Minérale au Coucher du Soleil',
    'Structure Contemporaine & Ombres',
    'Horizon Infini & Nuances Célestes',
    'Abstraction Géométrique & Or',
    'Faune Sauvegardée & Regard Intense',
    'Reflets Liquides & Lumière Neoniene',
    'Lignes Vivantes & Minimalisme',
    'Symphonie de Couleurs & Calme',
    'Essence de la Nature Sauvage',
    'Architecture du Silence',
    'Vibrations Botaniques',
    'Perspective Moderne & Espace',
    'Lueur Crépusculaire & Mystère',
    'Harmonie Urbaine & Formes'
  ];

  const sampleDescriptions = [
    'Une capture privilégiée célébrant la beauté brute et le calme absolu de l\'instant présent.',
    'Exploration visuelle jouant sur la profondeur des textures, les contrastes dorés et la lumière douce.',
    'Œuvre poétique conçue pour apporter une atmosphère apaisante et épurée à votre sanctuaire visuel.',
    'Une composition équilibrée reflétant le dialogue subtil entre forme, ombre et clarté.',
    'Moment suspendu immortalisé dans une esthétique contemplative et intemporelle.'
  ];

  const createdImages = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const cleanFileName = `lumio_${i + 1}_${file.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destPath = path.join(uploadsDir, cleanFileName);

    fs.copyFileSync(file.srcPath, destPath);

    const title = sampleTitles[i % sampleTitles.length] + (i >= sampleTitles.length ? ` #${i + 1}` : '');
    const description = sampleDescriptions[i % sampleDescriptions.length];
    const categoryId = categoryIds[i % categoryIds.length];
    const user = createdUsers[i % createdUsers.length];
    const mood = MOODS[i % MOODS.length];
    const palette = PALETTES[i % PALETTES.length];
    const dominantColor = JSON.parse(palette)[0];

    const tags = JSON.stringify([
      'lumio',
      MOODS[i % MOODS.length],
      CATEGORIES[i % CATEGORIES.length].slug,
      'artisan',
      'visual'
    ]);

    // Alternate heights for realistic masonry layout variability
    const heightVariants = [900, 1200, 800, 1400, 1000, 750, 1100];
    const height = heightVariants[i % heightVariants.length];

    const img = await prisma.image.create({
      data: {
        title,
        description,
        url: `/uploads/${cleanFileName}`,
        thumbnailUrl: `/uploads/${cleanFileName}`,
        width: 1200,
        height,
        userId: user.id,
        categoryId,
        dominantColor,
        palette,
        mood,
        tags,
        viewsCount: Math.floor(Math.random() * 800) + 120,
      },
    });
    createdImages.push(img);
  }

  // 6. Create sample Collections
  console.log('📁 Creating sample collections...');
  const mainUser = createdUsers[0];

  const col1 = await prisma.collection.create({
    data: {
      title: 'Sérénité & Formes Épurées',
      description: 'Une sélection curatoriale axée sur le calme, l\'équilibre visuel et l\'architecture minimale.',
      isPrivate: false,
      userId: mainUser.id,
    }
  });

  const col2 = await prisma.collection.create({
    data: {
      title: 'Nuances Crépusculaires',
      description: 'Palette dorée, tons sombres et ambiances poétiques de fin de journée.',
      isPrivate: false,
      userId: mainUser.id,
    }
  });

  // Attach images to collections
  for (let i = 0; i < Math.min(8, createdImages.length); i++) {
    await prisma.collectionImage.create({
      data: {
        collectionId: col1.id,
        imageId: createdImages[i].id,
      }
    });
  }

  for (let i = 2; i < Math.min(10, createdImages.length); i++) {
    await prisma.collectionImage.create({
      data: {
        collectionId: col2.id,
        imageId: createdImages[i].id,
      }
    });
  }

  // 7. Create sample Likes and Notifications
  console.log('❤️ Creating initial likes & notifications...');
  for (let i = 0; i < createdImages.length; i++) {
    const targetImage = createdImages[i];
    // Add 1 to 3 likes per image
    const likers = createdUsers.filter(u => u.id !== targetImage.userId).slice(0, (i % 3) + 1);

    for (const liker of likers) {
      await prisma.like.create({
        data: {
          userId: liker.id,
          imageId: targetImage.id,
        }
      });

      // Add notification for the image author
      if (liker.id !== targetImage.userId) {
        await prisma.notification.create({
          data: {
            recipientId: targetImage.userId,
            actorId: liker.id,
            type: 'LIKE',
            imageId: targetImage.id,
            message: `${liker.name} a aimé votre création "${targetImage.title}"`,
            read: i > 3,
          }
        });
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
