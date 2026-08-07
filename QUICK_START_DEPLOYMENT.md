# Guide de Déploiement Rapide - Lumio App

Suivez ces étapes dans l'ordre. Copiez-collez les commandes.

---

## ÉTAPE 1: Installer PostgreSQL (1 minute)

```bash
npm install pg @types/pg
```

---

## ÉTAPE 2: Déployer sur Vercel pour obtenir l'URL (5 minutes)

1. Allez sur https://vercel.com et créez un compte gratuit
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub (`mbouloumaxrob5/Lumio_v1`)
4. **IMPORTANT:** Dans "Storage", cliquez sur "Create Database" → "Vercel Postgres"
5. Acceptez les paramètres par défaut et créez la base de données
6. Dans "Environment Variables", ajoutez SEULEMENT:

| Nom | Valeur |
|-----|--------|
| `NEXTAUTH_SECRET` | `eUfBZkrlsMg5xl03B4JlmnuMX3SkoK4bsks5d+s8o/E=` |
| `NEXTAUTH_URL` | Laissez vide |
| `AUTH_SECRET` | `lod8A3cTjJksjWW1MmvBexxnZQkjBVswRr5wsupZ91k=` |

**Note:** `POSTGRES_URL` sera ajouté automatiquement par Vercel Postgres

7. Cliquez sur "Deploy"
8. Attendez 2-3 minutes
9. **Copiez l'URL Vercel** (ex: `https://lumio-app.vercel.app`)

---

## ÉTAPE 3: Configurer OAuth pour Google (5 minutes)

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet ou sélectionnez-en un
3. Dans le menu, allez à "APIs & Services" → "Credentials"
4. Cliquez sur "Create Credentials" → "OAuth client ID"
5. Choisissez "Web application"
6. Dans "Authorized redirect URIs", ajoutez:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://VOTRE-URL-VERCEL/api/auth/callback/google` (remplacez par votre URL Vercel)
7. Copiez le Client ID et Client Secret

---

## ÉTAPE 4: Configurer OAuth pour GitHub (3 minutes)

1. Allez sur https://github.com/settings/developers
2. Cliquez sur "New OAuth App"
3. Remplissez:
   - Application name: `Lumio App`
   - Homepage URL: `https://VOTRE-URL-VERCEL` (remplacez par votre URL Vercel)
   - Authorization callback URL: `https://VOTRE-URL-VERCEL/api/auth/callback/github`
4. Copiez le Client ID et Client Secret

---

## ÉTAPE 5: Ajouter les credentials OAuth sur Vercel (2 minutes)

1. Retournez sur votre projet Vercel
2. Allez dans Settings → Environment Variables
3. Ajoutez:

| Nom | Valeur |
|-----|--------|
| `GOOGLE_CLIENT_ID` | Votre Google Client ID (étape 3) |
| `GOOGLE_CLIENT_SECRET` | Votre Google Client Secret (étape 3) |
| `GITHUB_ID` | Votre GitHub Client ID (étape 4) |
| `GITHUB_SECRET` | Votre GitHub Client Secret (étape 4) |

4. Mettez à jour `NEXTAUTH_URL` avec votre URL Vercel
5. Cliquez sur "Redeploy"

---

## ÉTAPE 6: Finaliser la configuration (2 minutes)

1. Une fois redéployé, testez votre application
2. Vérifiez que la base de données fonctionne

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
- Vercel Postgres: Gratuit (256MB)
- Domaine personnalisé: Optionnel (~$10/an)

---

## Problèmes ?

Si quelque chose ne fonctionne pas, dites-moi quelle étape bloque et je vous aiderai.
