# Lumio — Visual Sanctuary & Aesthetic Platform

Lumio est une plateforme web de partage d'images premium, visuelle et émotionnelle. Elle offre une expérience immersive autour de la photographie, de l'art et du design, avec une grille masonry, des filtres par mood, des collections intelligentes et un système de notifications élégant.

## Fonctionnalités

- Authentification complète : Google, GitHub et credentials
- Flux d'images en grille masonry responsive
- Filtres par catégorie et par mood
- Système de likes et de collections privées/publiques
- Notifications en temps réel
- Mode sombre/clair automatique
- Upload et gestion d'images
- Palette de couleurs dominante par image
- Vue "Daily Light" pour une inspiration quotidienne
- Système de recherche plein texte

## Stack technique

- [Next.js 15](https://nextjs.org/) — App Router, Server Components, API Routes
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma 6](https://www.prisma.io/) + SQLite
- [NextAuth v5](https://next-auth.js.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Zustand](https://docs.pmnd.rs/zustand) / [React Hook Form](https://react-hook-form.com/) / [Zod](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)

## Prérequis

- Node.js >= 18.18
- npm ou pnpm

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
```

### Variables d'environnement requises

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_ID=""
GITHUB_SECRET=""
```

## Base de données

```bash
# Générer le client Prisma
npm run db:push

# Peupler la base avec des données de démo
npm run db:seed
```

Compte démo : `demo@lumio.art` / `password123`

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
npm run start
```

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting |
| `npm run db:push` | Appliquer le schéma Prisma |
| `npm run db:seed` | Peupler la base de données |

## Structure du projet

```
app/                      # App Router Next.js
  api/
    images/route.ts       # API REST images
    auth/[...nextauth]/    # NextAuth handlers
  globals.css             # Styles globaux Tailwind
  layout.tsx              # Layout racine
components/               # Composants React réutilisables
  feed/                   # Composants du flux d'images
lib/                      # Utilitaires et logique métier
  auth.ts                 # Configuration NextAuth
  prisma.ts               # Client Prisma singleton
  color-extractor.ts      # Extraction de palette
  visual-echo.ts          # Moteur "Visual Echo"
  store.ts                # Store global Zustand
prisma/
  schema.prisma           # Schéma de base de données
  seed.ts                 # Données de démo
```

## Licence

Privé — © Lumio Sanctuary
