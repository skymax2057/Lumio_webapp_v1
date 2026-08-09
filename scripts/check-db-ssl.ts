#!/usr/bin/env tsx

/**
 * Script de vérification de la configuration SSL de la base de données
 * Usage: npx tsx scripts/check-db-ssl.ts
 */

import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas défini');
  process.exit(1);
}

console.log('🔍 Vérification de la configuration SSL de la base de données...\n');

// Vérifier si sslmode=require est présent
if (DATABASE_URL.includes('sslmode=require')) {
  console.log('✅ sslmode=require est présent dans DATABASE_URL');
  console.log('🔒 La connexion à la base de données est sécurisée par SSL\n');
  process.exit(0);
} else if (DATABASE_URL.includes('sslmode=')) {
  console.log('⚠️  sslmode est présent mais n\'est pas "require"');
  console.log('   Valeur actuelle:', DATABASE_URL.match(/sslmode=([^&]+)/)?.[1]);
  console.log('   Veuillez le changer en sslmode=require\n');
  process.exit(1);
} else {
  console.log('❌ sslmode n\'est PAS présent dans DATABASE_URL');
  console.log('   Ajoutez ?sslmode=require à la fin de votre DATABASE_URL');
  console.log('   Exemple: postgresql://user:pass@host:5432/db?sslmode=require\n');
  process.exit(1);
}