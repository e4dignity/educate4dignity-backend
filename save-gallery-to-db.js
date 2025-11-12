/**
 * Save Gallery Images to Database (Prisma Direct)
 * 
 * Ce script sauvegarde les métadonnées des 22 images déjà uploadées sur Cloudinary
 * directement dans la base de données via Prisma, sans passer par l'API.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Les 22 images uploadées avec leurs URLs Cloudinary
const galleryImages = [
  {
    filename: 'B10.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905475/educate4dignity/gallery/B10.jpg',
    title: 'Atelier - B10',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B11.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905476/educate4dignity/gallery/B11.jpg',
    title: 'Atelier - B11',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B12.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905478/educate4dignity/gallery/B12.jpg',
    title: 'Atelier - B12',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B13.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905479/educate4dignity/gallery/B13.jpg',
    title: 'Atelier - B13',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B4.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905481/educate4dignity/gallery/B4.jpg',
    title: 'Atelier - B4',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B5.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905482/educate4dignity/gallery/B5.jpg',
    title: 'Atelier - B5',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B6.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905484/educate4dignity/gallery/B6.jpg',
    title: 'Atelier - B6',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B8.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905485/educate4dignity/gallery/B8.jpg',
    title: 'Atelier - B8',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'B9.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905487/educate4dignity/gallery/B9.jpg',
    title: 'Atelier - B9',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'bc.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905488/educate4dignity/gallery/bc.jpg',
    title: 'Atelier - bc',
    description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
    category: 'workshop',
    tags: 'workshop,training,menstrual-health,education'
  },
  {
    filename: 'JessB1.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905490/educate4dignity/gallery/JessB1.jpg',
    title: 'Jessica - JessB1',
    description: 'Photo de Jessica, membre fondatrice et coordinatrice du projet Educate for Dignity',
    category: 'team',
    tags: 'jessica,team,leadership,founder'
  },
  {
    filename: 'JessB2.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905491/educate4dignity/gallery/JessB2.jpg',
    title: 'Jessica - JessB2',
    description: 'Photo de Jessica, membre fondatrice et coordinatrice du projet Educate for Dignity',
    category: 'team',
    tags: 'jessica,team,leadership,founder'
  },
  {
    filename: 'JessB3.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905496/educate4dignity/gallery/JessB3.jpg',
    title: 'Jessica - JessB3',
    description: 'Photo de Jessica, membre fondatrice et coordinatrice du projet Educate for Dignity',
    category: 'team',
    tags: 'jessica,team,leadership,founder'
  },
  {
    filename: 'JessB4.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905498/educate4dignity/gallery/JessB4.jpg',
    title: 'Jessica - JessB4',
    description: 'Photo de Jessica, membre fondatrice et coordinatrice du projet Educate for Dignity',
    category: 'team',
    tags: 'jessica,team,leadership,founder'
  },
  {
    filename: 'Luiru1.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905499/educate4dignity/gallery/Luiru1.jpg',
    title: 'Luiru Community - Luiru1',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'Luiru2.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905500/educate4dignity/gallery/Luiru2.jpg',
    title: 'Luiru Community - Luiru2',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'Luiru3.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905503/educate4dignity/gallery/Luiru3.jpg',
    title: 'Luiru Community - Luiru3',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'luiru4.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905504/educate4dignity/gallery/luiru4.jpg',
    title: 'Luiru Community - luiru4',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'luiru5.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905506/educate4dignity/gallery/luiru5.jpg',
    title: 'Luiru Community - luiru5',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'luiru6.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905509/educate4dignity/gallery/luiru6.jpg',
    title: 'Luiru Community - luiru6',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'luiru7.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905511/educate4dignity/gallery/luiru7.jpg',
    title: 'Luiru Community - luiru7',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  },
  {
    filename: 'luiru8.jpg',
    url: 'https://res.cloudinary.com/dlrh6uuaa/image/upload/v1762905513/educate4dignity/gallery/luiru8.jpg',
    title: 'Luiru Community - luiru8',
    description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
    category: 'impact',
    tags: 'luiru,community,impact,testimony'
  }
];

async function main() {
  console.log('🚀 Sauvegarde des images de galerie dans la base de données\n');

  let success = 0;
  let failed = 0;

  for (const image of galleryImages) {
    try {
      // Convertir tags en array PostgreSQL
      const tagsArray = image.tags.split(',').map(t => t.trim());
      
      // Insérer avec Prisma (compatible avec TypeORM entity)
      await prisma.$executeRaw`
        INSERT INTO "GalleryImage" 
        (id, filename, url, title, description, category, tags, "uploadedAt", "isPublic")
        VALUES (
          gen_random_uuid(),
          ${image.filename},
          ${image.url},
          ${image.title},
          ${image.description},
          ${image.category},
          ${tagsArray}::text[],
          NOW(),
          true
        )
      `;
      
      console.log(`✅ ${image.filename} sauvegardé`);
      success++;
      
    } catch (error) {
      console.error(`❌ Erreur pour ${image.filename}:`, error.message);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Succès: ${success}/${galleryImages.length}`);
  console.log(`❌ Échecs: ${failed}/${galleryImages.length}`);
  console.log('✨ Script terminé\n');

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
