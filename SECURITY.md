# Configuration de Sécurité - Lumio App Web

## Variables d'Environnement Requises

### Authentification & Sécurité
```bash
# NextAuth v5 - OBLIGATOIRE en production
NEXTAUTH_SECRET=votre_secret_aleatoire_32_caracteres_minimum
AUTH_SECRET=votre_secret_aleatoire_32_caracteres_minimum

# OAuth Providers
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
GITHUB_ID=votre_github_client_id
GITHUB_SECRET=votre_github_client_secret
```

### Base de Données Neon PostgreSQL
```bash
# IMPORTANT: sslmode=require est OBLIGATOIRE
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### Rate Limiting (Upstash Redis)
```bash
# Optionnel mais RECOMMANDÉ en production
UPSTASH_REDIS_REST_URL=https://votre-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=votre_upstash_redis_token
```

### Services Externes
```bash
# Cloudinary - Stockage d'images
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Google Gemini AI - Génération de contenu
GEMINI_API_KEY=votre_gemini_api_key

# Seed Categories (optionnel)
SEED_SECRET=votre_secret_pour_seed_categories
```

### CORS Configuration
```bash
# Liste des origines autorisées, séparées par des virgules
# En production, ne mettre que vos domaines de production
ALLOWED_ORIGINS=https://lumio-sanctuary.com,https://www.lumio-sanctuary.com
```

## Configuration Vercel

### 1. Variables d'Environnement
Dans Vercel Dashboard → Settings → Environment Variables, ajoutez toutes les variables ci-dessus.

### 2. Build Configuration
```bash
# Build Command
prisma generate && prisma db push --accept-data-loss && next build

# Output Directory
.next

# Install Command
npm install
```

### 3. Domaines & HTTPS
- Activez HTTPS automatique (Vercel le fait par défaut)
- Configurez vos domaines personnalisés dans Settings → Domains

## Configuration Neon PostgreSQL

### 1. Vérification SSL
Assurez-vous que votre DATABASE_URL contient `sslmode=require` :
```
postgresql://user:password@ep-xxx.pooler.supabase.com:5432/dbname?sslmode=require
```

### 2. Connection Pooling
Neon utilise déjà le connection pooling. Assurez-vous d'utiliser l'URL de pooler :
```
postgresql://user:password@ep-xxx.pooler.supabase.com:5432/dbname?sslmode=require
```

### 3. Restrictions IP (Optionnel)
Dans Neon Dashboard → Settings → Connection Details, vous pouvez restreindre les accès par IP pour plus de sécurité.

## Configuration Upstash Redis (Rate Limiting)

### 1. Création d'une base de données Redis
1. Allez sur [Upstash Console](https://console.upstash.com/)
2. Créez une nouvelle base de données Redis
3. Choisissez la région la plus proche de votre Vercel (ex: eu-west-1)

### 2. Récupération des credentials
Dans Upstash Dashboard → Details → REST API :
- Copy `UPSTASH_REDIS_REST_URL`
- Copy `UPSTASH_REDIS_REST_TOKEN`

### 3. Configuration dans Vercel
Ajoutez ces deux variables dans vos environment variables Vercel.

## Configuration CORS

### Pour le développement local
```bash
ALLOWED_ORIGINS=http://localhost:3000
```

### Pour la production
```bash
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

## Security Headers Actifs

L'application applique automatiquement les headers de sécurité suivants :

- **Strict-Transport-Security**: Force HTTPS (max-age=2 ans)
- **X-Frame-Options**: Protection contre le clickjacking
- **X-Content-Type-Options**: Empêche le MIME-sniffing
- **Referrer-Policy**: Contrôle les informations de referrer
- **Permissions-Policy**: Restreint l'accès aux APIs sensibles
- **Cross-Origin-Opener-Policy**: Protection contre les attaques cross-origin
- **Cross-Origin-Resource-Policy**: Restreint l'accès aux ressources

## Rate Limiting

### Limites actuelles
- **Upload API**: 10 requêtes / 10 secondes par IP
- **Auth API**: 5 requêtes / minute par IP
- **General API**: 100 requêtes / minute par IP

### Comportement
- En cas de dépassement : HTTP 429 avec message explicite
- Les limites sont basées sur l'adresse IP
- Fonctionne uniquement si Upstash Redis est configuré

## Checks de Sécurité Avant Déploiement

### 1. Vérification des secrets
```bash
# Assurez-vous que NEXTAUTH_SECRET est défini
# Ne JAMAIS utiliser de valeurs par défaut en production
```

### 2. Vérification SSL
```bash
# Vérifiez que DATABASE_URL contient sslmode=require
```

### 3. Vérification CORS
```bash
# Assurez-vous que ALLOWED_ORIGINS ne contient que vos domaines de production
```

### 4. Vérification Rate Limiting
```bash
# Configurez Upstash Redis pour activer le rate limiting en production
```

## Monitoring & Alertes

### 1. Vercel Analytics
Activez Vercel Analytics pour surveiller les performances et les erreurs.

### 2. Error Tracking
Intégrez un service comme Sentry pour le tracking des erreurs en production.

### 3. Rate Limiting Monitoring
Upstash fournit des analytics pour surveiller l'utilisation du rate limiting.

## Bonnes Pratiques

### 1. Rotation des secrets
- Changez régulièrement les secrets (NEXTAUTH_SECRET, API keys)
- Utilisez des secrets différents pour chaque environnement

### 2. Revue des accès
- Révisez régulièrement les accès OAuth (Google, GitHub)
- Supprimez les applications non utilisées

### 3. Mises à jour
- Gardez les dépendances à jour
- Appliquez les patches de sécurité rapidement

### 4. Backups
- Neon effectue des backups automatiques
- Vérifiez régulièrement la restauration des backups

## Support & Contact

En cas de problème de sécurité :
1. Vérifiez les logs Vercel
2. Consultez les logs Neon
3. Vérifiez la configuration Upstash
4. Contactez l'équipe technique si nécessaire