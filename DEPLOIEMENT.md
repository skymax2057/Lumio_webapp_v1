# Guide de déploiement — Lumio App

Stack : **Next.js 15 + PostgreSQL (Neon) + Cloudinary + Vercel**

---

## Étape 1 — Base de données PostgreSQL avec Neon (gratuit)

1. Aller sur **[neon.tech](https://neon.tech)** → créer un compte
2. Créer un nouveau projet (ex: `lumio-prod`)
3. Dans le dashboard Neon → **Connection Details** → copier la **connection string**
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Garder cette URL pour l'étape 4

---

## Étape 2 — Stockage d'images avec Cloudinary (gratuit)

1. Aller sur **[cloudinary.com](https://cloudinary.com)** → créer un compte gratuit
2. Dans le dashboard → **Settings > API Keys**
3. Copier :
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. Garder ces valeurs pour l'étape 4

---

## Étape 3 — Configurer les OAuth providers

### Google OAuth
1. Aller sur **[console.cloud.google.com](https://console.cloud.google.com)**
2. Sélectionner ton projet → **APIs & Services > Credentials**
3. Dans **OAuth 2.0 Client IDs** → modifier ton client
4. Ajouter dans **Authorized redirect URIs** :
   ```
   https://ton-app.vercel.app/api/auth/callback/google
   ```

### GitHub OAuth
1. Aller sur **[github.com/settings/developers](https://github.com/settings/developers)**
2. Modifier ton OAuth App
3. Changer **Homepage URL** → `https://ton-app.vercel.app`
4. Changer **Authorization callback URL** → `https://ton-app.vercel.app/api/auth/callback/github`

---

## Étape 4 — Déployer sur Vercel

### 4.1 Pousser le code sur GitHub
```bash
git init  # si pas encore fait
git add .
git commit -m "feat: production ready — cloudinary + postgresql"
git remote add origin https://github.com/ton-user/lumio-app.git
git push -u origin main
```

### 4.2 Créer le projet sur Vercel
1. Aller sur **[vercel.com](https://vercel.com)** → New Project
2. Importer le repo GitHub
3. Framework preset : **Next.js** (auto-détecté)
4. Laisser les build settings par défaut

### 4.3 Configurer les variables d'environnement sur Vercel
Dans le projet Vercel → **Settings > Environment Variables**, ajouter :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL Neon (avec `?sslmode=require`) |
| `NEXTAUTH_SECRET` | Générer : `openssl rand -base64 32` |
| `AUTH_SECRET` | Même valeur que NEXTAUTH_SECRET |
| `NEXTAUTH_URL` | `https://ton-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google |
| `GITHUB_ID` | GitHub OAuth App ID |
| `GITHUB_SECRET` | GitHub OAuth App Secret |
| `CLOUDINARY_CLOUD_NAME` | Ton cloud name Cloudinary |
| `CLOUDINARY_API_KEY` | Ton API key Cloudinary |
| `CLOUDINARY_API_SECRET` | Ton API secret Cloudinary |

### 4.4 Déployer
Cliquer **Deploy** → Vercel va builder l'app.

Le script de build (`prisma generate && prisma db push && next build`) va automatiquement :
- Générer le client Prisma
- Créer les tables dans Neon
- Builder l'app Next.js

---

## Étape 5 — Après le déploiement

1. **Tester l'authentification** : `/login` avec email + Google + GitHub
2. **Tester l'upload** : aller sur `/create` et uploader une image
3. **Vérifier Cloudinary** : les images doivent apparaître dans ton dashboard Cloudinary
4. **Seeder la BDD** (optionnel) : dans Vercel → Functions → appeler `/api/...`

---

## Variables d'environnement locales (.env)

Pour continuer à développer en local avec PostgreSQL :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lumio"
# ou utiliser ton URL Neon directement en local (branch dev)
```

Pour Neon, tu peux créer une **branch de développement** séparée de la prod.

---

## Résumé des services utilisés (tous gratuits)

| Service | Usage | Limite gratuite |
|---------|-------|-----------------|
| Vercel | Hosting Next.js | 100GB bandwidth/mois |
| Neon | PostgreSQL | 512MB storage, 3 branches |
| Cloudinary | Images | 25GB storage, 25GB bandwidth/mois |
| GitHub | Code source | Illimité |
