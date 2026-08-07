import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'Abstrait',
  'Action',
  'Affiche',
  'Ambiance',
  'Anime',
  'Architecture',
  'Art 3D',
  'Art classique',
  'Art conceptuel',
  'Art fractal',
  'Art numérique',
  'Art vectoriel',
  'Astrophotographie',
  'Astronomie',
  'Automobile',
  'Aventure',
  'Boissons',
  'Cinéma',
  'Citation',
  'Comics',
  'Concept',
  'Cristal',
  'Culture pop',
  'Cyberpunk',
  'Danse',
  'Décoration',
  'Décoration intérieure',
  'Design',
  'Design 3D',
  'Design minimaliste',
  'Design typographique',
  'Drame',
  'Élégant',
  'Émotionnel',
  'Enfants',
  'Espace',
  'Fantastique',
  'Fantasy',
  'Fanart',
  'Faune',
  'Fleurs',
  'Fond d\'écran',
  'Géométrique',
  'Graphisme',
  'Hardware',
  'High-Tech',
  'Histoire',
  'Horreur',
  'Humour',
  'Illustration',
  'Illustrations animales',
  'Inspiration',
  'Japon',
  'Jeux vidéo',
  'Linux',
  'Logo',
  'Macro',
  'Manga',
  'Marvel',
  'Matériel informatique',
  'Mécanique',
  'Mer',
  'Minimalisme',
  'Mode',
  'Moderne',
  'Montagne',
  'Motivation',
  'Musique',
  'Mythologie',
  'Nature',
  'Nature morte',
  'Numérique',
  'Paysage',
  'Paysage urbain',
  'PC Modding',
  'Peinture',
  'Photographie',
  'Photographie animalière',
  'Pixel Art',
  'Portrait',
  'Promotion',
  'Rétro',
  'Rétrogaming',
  'RPG',
  'Science',
  'Science-fiction',
  'Spiritualité',
  'Sport mécanique',
  'Super-héros',
  'Technologie',
  'Typographie',
  'Urbain',
  'Vintage',
  'Vie aquatique',
  'Voyage'
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🏷️  Adding categories to Lumio...');

  for (const categoryName of categories) {
    const slug = slugify(categoryName);
    
    try {
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: {
          name: categoryName,
          slug: slug,
          description: `${categoryName} images and artwork`
        }
      });
      console.log(`✅ Added category: ${categoryName}`);
    } catch (error) {
      console.error(`❌ Error adding category ${categoryName}:`, error);
    }
  }

  console.log(`🎉 Successfully added ${categories.length} categories!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during category creation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
