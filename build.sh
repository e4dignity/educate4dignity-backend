#!/bin/bash

# Script de build pour le backend sur Render
# Ce script installe les dépendances, génère le client Prisma et compile TypeScript

set -e  # Arrêter en cas d'erreur

echo "📦 Installation des dépendances..."
npm ci

echo "🔧 Génération du client Prisma..."
npx prisma generate

echo "🗄️ Application des migrations de base de données..."
npx prisma migrate deploy

echo "🏗️ Compilation TypeScript..."
npx tsc -p tsconfig.build.json

echo "✅ Build terminé avec succès!"
