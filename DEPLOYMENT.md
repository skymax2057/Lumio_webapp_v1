# Guide de Déploiement - Lumio App

## Architecture de Production

- **Frontend/Backend:** Vercel
- **Base de données:** PostgreSQL (Supabase ou Vercel Postgres)
- **Authentification:** NextAuth v5 avec OAuth (Google + GitHub)
- **Stockage images:** À configurer (Vercel Blob ou Cloudinary)

---

## Étape 1: Préparation de la Base de Données

### Option A: Supabase (Recommandé - Gratuit)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings → Database
4. Copier la "Connection String" au format:
   ```
   postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   ```

### Option B: Vercel Postgres

1. Dans Vercel Dashboard → Storage
2. Créer une nouvelle base de données Postgres
3. Copier la `POSTGRES_URL` fournie

---

## Étape 2: Configuration OAuth pour Production

### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer ou sélectionner un projet
3. Activer "Google+ API"
4. Créer des identifiants OAuth 2.0
5. Ajouter les "Authorized redirect URIs":
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-app.vercel.app/api/auth/callback/google` (production)

### GitHub OAuth

1. Aller sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créer une nouvelle OAuth App
3. Configurer:
   - Application name: Lumio App
   - Homepage URL: `https://votre-app.vercel.app`
   - Authorization callback URL: `https://votre-app.vercel.app/api/auth/callback/github`

---

## Étape 3: Migration SQLite → PostgreSQL

### Méthode 1: Via Prisma (Recommandée)

```bash
# 1. Sauvegarder vos données SQLite actuelles
cp prisma/dev.db prisma/dev.db.backup

# 2. Mettre à jour le schema (déjà fait)
# Le fichier prisma/schema.prisma utilise maintenant PostgreSQL

# 3. Installer les dépendances PostgreSQL
npm install pg @types/pg

# 4. Générer le client Prisma
npx prisma generate

# 5. Pousser le schema vers PostgreSQL
npx prisma db push

# 6. (Optionnel) Migrer les données existantes
# Utiliser un outil comme pgloader ou exporter/importer manuellement
```

### Méthode 2: Via pgloader (Si vous avez des données)

```bash
# Installer pgloader
# Sur Windows: Utiliser WSL ou Docker
# Sur Mac: brew install pgloader
# Sur Linux: apt install pgloader

# Migrer les données
pgloader sqlite:///path/to/dev.db postgresql://user:password@host:5432/dbname
```

---

## Étape 4: Déploiement sur Vercel

### 4.1 Préparer le Repository

```bash
# Committer les changements
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 4.2 Importer sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer votre repository GitHub
4. Configurer les Environment Variables:

| Variable | Valeur | Requis |
|----------|--------|--------|
| `DATABASE_URL` | Votre connection string PostgreSQL | ✅ |
| `NEXTAUTH_SECRET` | Généré avec `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | `https://votre-app.vercel.app` | ✅ |
| `AUTH_SECRET` | Généré avec `openssl rand -base64 32` | ✅ |
| `GOOGLE_CLIENT_ID` | Votre Google Client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Votre Google Client Secret | ❌ |
| `GITHUB_ID` | Votre GitHub Client ID | ❌ |
| `GITHUB_SECRET` | Votre GitHub Client Secret | ❌ |

### 4.3 Déployer

1. Cliquer sur "Deploy"
2. Attendre le déploiement (2-3 minutes)
3. Vérifier que le build réussit

---

## Étape 5: Configuration Post-Déploiement

### 5.1 Mettre à jour les URLs OAuth

- Retourner sur Google Console et GitHub Developer Settings
- Ajouter l'URL de production Vercel dans les redirect URIs

### 5.2 Configurer le domaine personnalisé (Optionnel)

1. Dans Vercel Dashboard → Settings → Domains
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions Vercel

---

## Étape 6: Stockage des Images (Important)

Le projet utilise actuellement un stockage local. Pour la production:

### Option A: Vercel Blob Storage

```bash
npm install @vercel/blob
```

Modifier le système d'upload pour utiliser Vercel Blob.

### Option B: Cloudinary

```bash
npm install cloudinary
```

Configurer Cloudinary et modifier les fonctions d'upload.

### Option C: Supabase Storage

Utiliser le storage Supabase déjà configuré avec votre base de données.

---

## Commandes Utiles

### Développement Local avec PostgreSQL

```bash
# Installer PostgreSQL localement ou utiliser Docker
docker run --name lumio-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Mettre à jour .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/lumio"

# Générer et pousser le schema
npx prisma generate
npx prisma db push

# Lancer le dev
npm run dev
```

### Production

```bash
# Build local pour tester
npm run build

# Vérifier les logs Vercel
vercel logs
```

---

## Dépannage

### Erreur: Database connection failed

- Vérifier que `DATABASE_URL` est correctement configurée sur Vercel
- S'assurer que la base de données PostgreSQL est accessible
- Vérifier les règles de firewall (pour Supabase)

### Erreur: NextAuth callback failed

- Vérifier que `NEXTAUTH_URL` correspond à votre domaine Vercel
- S'assurer que les redirect URIs OAuth sont correctement configurées
- Vérifier que `NEXTAUTH_SECRET` est identique en développement et production

### Erreur: Images ne s'affichent pas

- Le stockage local ne fonctionne pas en production
- Configurer un stockage cloud (Vercel Blob, Cloudinary, etc.)

---

## Sécurité

- **Ne jamais commit** le fichier `.env`
- Utiliser des secrets différents pour développement et production
- Régénérer les secrets OAuth si compromis
- Activer 2FA sur tous les comptes (Google, GitHub, Vercel, Supabase)

---

## Coûts Estimés

| Service | Plan | Coût Mensuel |
|---------|-------|--------------|
| Vercel (Hobby) | Frontend/Backend | $0 |
| Supabase (Free) | PostgreSQL | $0 |
| Vercel Blob | Stockage images | ~$0.15/GB |
| Domaine personnalisé | Optionnel | ~$10-15/an |

**Total estimé:** $0-15/mois selon l'utilisation

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
