/**
 * Upload Gallery Images to Cloudinary
 * 
 * Ce script:
 * 1. Lit les 22 images depuis le dossier Downloads
 * 2. Upload chaque image vers Cloudinary
 * 3. Génère un titre et une description basée sur le nom du fichier
 * 4. Sauvegarde les métadonnées dans la base de données via l'API backend
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlrh6uuaa',
  api_key: process.env.CLOUDINARY_API_KEY || '327843187189491',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'FdP6JOxr9fpY7pjvkiV5mlecITM'
});

const GALLERY_DIR = 'C:\\Users\\knkjo\\Downloads\\CSGC Educate for dignity Photos-20251111T225024Z-1-001\\CSGC Educate for dignity Photos';
const API_BASE = 'http://localhost:4000';

// Fonction pour générer métadonnées basées sur le nom de fichier
function generateMetadata(filename) {
  const name = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  
  // Catégorisation par préfixe
  if (name.toLowerCase().startsWith('jess')) {
    return {
      category: 'team',
      title: `Jessica - ${name}`,
      description: 'Photo de Jessica, membre fondatrice et coordinatrice du projet Educate for Dignity',
      tags: ['jessica', 'team', 'leadership', 'founder']
    };
  } else if (name.toLowerCase().startsWith('luiru')) {
    return {
      category: 'impact',
      title: `Luiru Community - ${name}`,
      description: 'Activités communautaires à Luiru, témoignages de l\'impact du projet sur la santé menstruelle et la dignité',
      tags: ['luiru', 'community', 'impact', 'testimony']
    };
  } else if (name.toLowerCase().startsWith('b') || name.toLowerCase() === 'bc') {
    return {
      category: 'workshop',
      title: `Atelier - ${name}`,
      description: 'Session de formation sur la santé menstruelle et la production de serviettes hygiéniques réutilisables',
      tags: ['workshop', 'training', 'menstrual-health', 'education']
    };
  }
  
  // Par défaut
  return {
    category: 'general',
    title: filename,
    description: `Image de la galerie Educate for Dignity - ${filename}`,
    tags: ['gallery', 'e4d']
  };
}

// Fonction pour uploader une image vers Cloudinary
async function uploadToCloudinary(filePath, filename) {
  try {
    console.log(`📤 Upload de ${filename} vers Cloudinary...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'educate4dignity/gallery',
      public_id: filename.replace(/\.(jpg|jpeg|png|gif)$/i, ''),
      resource_type: 'image',
      overwrite: true
    });
    
    console.log(`✅ Uploadé: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur upload ${filename}:`, error.message);
    throw error;
  }
}

// Fonction pour sauvegarder dans la base de données via l'API
async function saveToDatabase(imageData) {
  try {
    console.log(`💾 Sauvegarde métadonnées: ${imageData.title}`);
    
    const response = await axios.post(`${API_BASE}/api/uploads/gallery`, {
      filename: imageData.filename,
      url: imageData.url,
      publicId: imageData.publicId,
      title: imageData.title,
      description: imageData.description,
      category: imageData.category,
      tags: imageData.tags,
      width: imageData.width,
      height: imageData.height,
      format: imageData.format,
      isPublic: true
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Sauvegardé en base de données: ID ${response.data.id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`❌ Erreur API:`, error.response.status, error.response.data);
    } else {
      console.error(`❌ Erreur réseau:`, error.message);
    }
    throw error;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du script d\'upload de galerie\n');
  
  // Vérifier que le dossier existe
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`❌ Dossier introuvable: ${GALLERY_DIR}`);
    process.exit(1);
  }
  
  // Lire tous les fichiers
  const files = fs.readdirSync(GALLERY_DIR)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
  
  console.log(`📁 ${files.length} images trouvées\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  // Traiter chaque image
  for (const filename of files) {
    try {
      const filePath = path.join(GALLERY_DIR, filename);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Traitement: ${filename}`);
      console.log('='.repeat(60));
      
      // 1. Upload vers Cloudinary
      const cloudinaryResult = await uploadToCloudinary(filePath, filename);
      
      // 2. Générer métadonnées
      const metadata = generateMetadata(filename);
      
      // 3. Préparer les données
      const imageData = {
        filename: filename,
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format
      };
      
      // 4. Sauvegarder en base de données
      const dbResult = await saveToDatabase(imageData);
      
      results.success.push({
        filename,
        cloudinaryUrl: cloudinaryResult.secure_url,
        dbId: dbResult.id
      });
      
      console.log(`✅ ${filename} traité avec succès`);
      
    } catch (error) {
      console.error(`❌ Échec pour ${filename}:`, error.message);
      results.failed.push({ filename, error: error.message });
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Réussis: ${results.success.length}/${files.length}`);
  console.log(`❌ Échecs: ${results.failed.length}/${files.length}`);
  
  if (results.success.length > 0) {
    console.log('\n✅ Images uploadées:');
    results.success.forEach(r => {
      console.log(`  - ${r.filename} → ${r.cloudinaryUrl}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Échecs:');
    results.failed.forEach(r => {
      console.log(`  - ${r.filename}: ${r.error}`);
    });
  }
  
  console.log('\n✨ Script terminé\n');
}

// Exécution
main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
