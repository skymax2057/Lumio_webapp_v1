# Guide de Déploiement Rapide - Lumio App

Suivez ces étapes dans l'ordre. Copiez-collez les commandes.

---

## ÉTAPE 1: Créer une base de données Supabase (5 minutes)

1. Allez sur https://supabase.com et créez un compte gratuit
2. Cliquez sur "New Project"
3. Remplissez:
   - Name: `lumio-app`
   - Database Password: `choisissez-un-mot-de-passe`
   - Region: Choisissez la plus proche de vous
4. Attendez 2 minutes que le projet soit créé
5. Cliquez sur Settings → Database
6. Copiez la "Connection String" qui ressemble à:
   ```
   postgresql://postgres.votre-mot-de-passe@db.votre-projet.supabase.co:5432/postgres
   ```

---

## ÉTAPE 2: Mettre à jour le fichier .env (2 minutes)

Ouvrez le fichier `.env` dans votre projet et remplacez la ligne:

```
DATABASE_URL="file:./dev.db"
```

par:

```
DATABASE_URL="postgresql://postgres.votre-mot-de-passe@db.votre-projet.supabase.co:5432/postgres"
```

---

## ÉTAPE 3: Installer PostgreSQL et générer le schema (3 minutes)

```bash
npm install pg @types/pg
npx prisma generate
npx prisma db push
```

---

## ÉTAPE 4: Configurer OAuth pour Google (5 minutes)

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet ou sélectionnez-en un
3. Dans le menu, allez à "APIs & Services" → "Credentials"
4. Cliquez sur "Create Credentials" → "OAuth client ID"
5. Choisissez "Web application"
6. Dans "Authorized redirect URIs", ajoutez:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://votre-app.vercel.app/api/auth/callback/google` (remplacez par votre futur nom d'app)
7. Copiez le Client ID et Client Secret

---

## ÉTAPE 5: Configurer OAuth pour GitHub (3 minutes)

1. Allez sur https://github.com/settings/developers
2. Cliquez sur "New OAuth App"
3. Remplissez:
   - Application name: `Lumio App`
   - Homepage URL: `https://votre-app.vercel.app` (remplacez par votre futur nom d'app)
   - Authorization callback URL: `https://votre-app.vercel.app/api/auth/callback/github`
4. Copiez le Client ID et Client Secret

---

## ÉTAPE 6: Commiter et pousser sur GitHub (2 minutes)

```bash
git add .
git commit -m "chore: ready for production deployment"
git push origin main
```

---

## ÉTAPE 7: Déployer sur Vercel (5 minutes)

1. Allez sur https://vercel.com et créez un compte gratuit
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub
4. Dans "Environment Variables", ajoutez:

| Nom | Valeur |
|-----|--------|
| `DATABASE_URL` | Votre connection string Supabase (étape 1) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` (générez un secret) |
| `NEXTAUTH_URL` | Laissez vide pour l'instant |
| `AUTH_SECRET` | `openssl rand -base64 32` (générez un secret) |
| `GOOGLE_CLIENT_ID` | Votre Google Client ID (étape 4) |
| `GOOGLE_CLIENT_SECRET` | Votre Google Client Secret (étape 4) |
| `GITHUB_ID` | Votre GitHub Client ID (étape 5) |
| `GITHUB_SECRET` | Votre GitHub Client Secret (étape 5) |

5. Cliquez sur "Deploy"
6. Attendez 2-3 minutes

---

## ÉTAPE 8: Finaliser la configuration (2 minutes)

1. Une fois déployé, Vercel vous donnera une URL comme: `https://lumio-app.vercel.app`
2. Retournez sur votre `.env` et ajoutez:
   ```
   NEXTAUTH_URL="https://lumio-app.vercel.app"
   ```
3. Sur Vercel, allez dans Settings → Environment Variables
4. Ajoutez ou mettez à jour `NEXTAUTH_URL` avec votre URL Vercel
5. Redéployez depuis Vercel

---

## ÉTAPE 9: Mettre à jour les URLs OAuth (2 minutes)

1. Retournez sur Google Console (étape 4)
2. Ajoutez votre URL Vercel dans les "Authorized redirect URIs"
3. Retournez sur GitHub (étape 5)
4. Mettez à jour l'URL avec votre domaine Vercel

---

## ⚠️ IMPORTANT: Stockage des images

Votre projet utilise actuellement un stockage local qui ne fonctionne PAS en production.

**Solution rapide:** Pour l'instant, les images ne seront pas persistantes entre les déploiements. Pour une solution complète, contactez-moi pour configurer Vercel Blob Storage.

---

## Vérification

Ouvrez votre URL Vercel dans le navigateur et testez:
- [ ] La page d'accueil s'affiche
- [ ] Vous pouvez vous connecter avec Google
- [ ] Vous pouvez vous connecter avec GitHub
- [ ] Vous pouvez créer un compte

---

## Coût total: $0/mois

- Vercel: Gratuit
- Supabase: Gratuit (500MB)
- Domaine personnalisé: Optionnel (~$10/an)

---

## Problèmes ?

Si quelque chose ne fonctionne pas, dites-moi quelle étape bloque et je vous aiderai.
