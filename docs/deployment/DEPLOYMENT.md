# 🚀 Guide de Déploiement - Jardin Chef

Ce guide détaille toutes les étapes pour déployer l'application Jardin Chef en production.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- [ ] Un compte GitHub (pour le code source)
- [ ] Un compte Vercel (pour l'hébergement frontend)
- [ ] Un projet Supabase (pour le backend)
- [ ] Node.js 18+ installé localement
- [ ] Git installé

---

## 🗄️ Partie 1 : Configuration Supabase

### 1.1 Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : `jardin-chef-production`
   - **Database Password** : Générer un mot de passe fort
   - **Region** : Choisir la plus proche (Europe West par exemple)
4. Cliquez sur "Create new project"
5. Attendez ~2 minutes que le projet soit créé

### 1.2 Appliquer les Migrations SQL

#### Option A : Via le Dashboard Supabase (Recommandé)

1. Allez dans **SQL Editor** dans la sidebar
2. Créez un nouveau query
3. Copiez-collez le contenu de chaque fichier de migration dans l'ordre :

```bash
# Ordre des migrations
1. supabase/migrations/20250114000000_add_materials_inventory.sql
2. supabase/migrations/20250114000001_add_site_materials.sql
3. supabase/migrations/20250114000002_add_company_profile.sql
```

4. Exécutez chaque migration avec le bouton "Run" (F5)
5. Vérifiez qu'il n'y a pas d'erreurs

#### Option B : Via Supabase CLI

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref <your-project-ref>

# Appliquer les migrations
supabase db push
```

### 1.3 Configurer l'Authentification

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** provider
3. Configurez les paramètres :
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - ❌ Disable double opt-in (optionnel)

### 1.4 Configurer le Storage

1. Allez dans **Storage**
2. Créez un nouveau bucket : `photos`
3. Configurez les permissions :

```sql
-- Permissions pour les photos
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 1.5 Récupérer les Clés API

1. Allez dans **Settings** > **API**
2. Notez les valeurs suivantes (vous en aurez besoin pour Vercel) :
   - `Project URL` : `https://xxxxx.supabase.co`
   - `anon public` key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ☁️ Partie 2 : Déploiement Frontend (Vercel)

### 2.1 Préparer le Repository GitHub

1. **Créez un repository GitHub** :
   ```bash
   # Si pas encore fait
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/jardin-chef.git
   git push -u origin main
   ```

2. **Vérifiez que ces fichiers existent** :
   - `.gitignore` (doit ignorer `.env.local`, `node_modules`, `dist`)
   - `vercel.json` (optionnel, pour configuration avancée)

### 2.2 Déployer sur Vercel

#### Via le Dashboard Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New Project"
4. Importez votre repository `jardin-chef`
5. Configurez les paramètres :

**Build Settings** :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

**Environment Variables** :
Ajoutez ces variables (récupérées depuis Supabase) :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important** : Ne JAMAIS commiter `.env.local` dans Git !

6. Cliquez sur "Deploy"
7. Attendez ~2 minutes que le déploiement se termine
8. Votre app sera accessible à `https://jardin-chef.vercel.app`

#### Via Vercel CLI

```bash
# Installer la CLI Vercel
npm install -g vercel

# Se connecter
vercel login

# Premier déploiement
vercel

# Suivre les instructions
# ? Set up and deploy "~/jardin-chef"? [Y/n] Y
# ? Which scope? → Votre compte
# ? Link to existing project? [y/N] N
# ? What's your project's name? jardin-chef
# ? In which directory is your code located? ./

# Définir les variables d'environnement
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Déployer en production
vercel --prod
```

### 2.3 Configurer un Domaine Personnalisé (Optionnel)

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Cliquez sur "Add"
3. Entrez votre domaine : `jardin-chef.com`
4. Suivez les instructions pour configurer les DNS :

**Chez votre registrar (ex: OVH, Gandi)** :
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Attendez la propagation DNS (~24h max)
6. Vercel configurera automatiquement le SSL (Let's Encrypt)

---

## 🔒 Partie 3 : Sécurité en Production

### 3.1 Variables d'Environnement

**❌ NE JAMAIS** :
- Commiter `.env.local` dans Git
- Partager les clés API publiquement
- Utiliser les mêmes clés dev/prod

**✅ TOUJOURS** :
- Utiliser les variables d'environnement Vercel
- Régénérer les clés en cas de leak
- Monitorer les logs Supabase

### 3.2 Row Level Security (RLS)

Vérifiez que **toutes** les tables ont des politiques RLS :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Activer RLS si nécessaire
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
-- etc.
```

### 3.3 CORS & Headers

Créez `vercel.json` pour configurer les headers :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(self), microphone=(), camera=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3.4 Rate Limiting (Supabase)

Configurez les limites dans Supabase :

1. **Settings** > **API** > **Rate Limiting**
2. Ajustez selon vos besoins :
   - Authentification : 100 req/hour
   - API REST : 1000 req/hour
   - Storage : 500 req/hour

---

## 📊 Partie 4 : Monitoring & Logs

### 4.1 Monitoring Vercel

1. **Analytics** : Activé automatiquement
   - Trafic
   - Performance (Core Web Vitals)
   - Erreurs

2. **Speed Insights** : Gratuit
   - Allez dans **Analytics** > **Speed Insights**
   - Cliquez sur "Enable"

### 4.2 Monitoring Supabase

1. **Database Health** :
   - Allez dans **Database** > **Reports**
   - Surveillez :
     - Connexions actives
     - Slow queries
     - Table sizes

2. **API Logs** :
   - Allez dans **Logs** > **API**
   - Filtrez par status code (4xx, 5xx)

3. **Auth Logs** :
   - Allez dans **Auth** > **Logs**
   - Surveillez les tentatives de login échouées

### 4.3 Alertes (Optionnel)

#### Uptime Monitoring

Utilisez [UptimeRobot](https://uptimerobot.com) (gratuit) :

1. Créez un compte
2. Ajoutez un monitor :
   - **Type** : HTTPS
   - **URL** : `https://jardin-chef.vercel.app`
   - **Interval** : 5 minutes
3. Configurez les alertes par email

#### Error Tracking

Utilisez [Sentry](https://sentry.io) (gratuit jusqu'à 5K events/mois) :

```bash
# Installer Sentry
npm install --save @sentry/react

# Configurer dans src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🔄 Partie 5 : Mises à Jour & CI/CD

### 5.1 Workflow de Déploiement

```
Développement (local)
    ↓ git push
GitHub (main branch)
    ↓ Auto-deploy
Vercel (Preview Deploy)
    ↓ Test & Validation
Vercel (Production)
```

### 5.2 Déploiements Automatiques

Vercel déploie automatiquement :
- ✅ **Production** : Pushs sur `main`
- ✅ **Preview** : Pull requests

Pour **désactiver** les auto-deploys :

1. Vercel Dashboard > **Settings** > **Git**
2. Décochez "Production Branch" ou "Preview Branches"

### 5.3 Rollback

Si un déploiement pose problème :

1. Allez dans **Deployments**
2. Trouvez le déploiement précédent (✅ Ready)
3. Cliquez sur les 3 points `...` > **Promote to Production**

Ou via CLI :
```bash
vercel rollback
```

### 5.4 CI/CD avec GitHub Actions (Optionnel)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test # Si tests implémentés

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/cli@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Partie 6 : Tests en Production

### 6.1 Checklist de Vérification

Après le déploiement, testez :

- [ ] **Authentification**
  - [ ] Inscription
  - [ ] Login
  - [ ] Logout
  - [ ] Récupération mot de passe

- [ ] **CRUD Clients**
  - [ ] Créer un client
  - [ ] Modifier un client
  - [ ] Supprimer un client
  - [ ] Rechercher un client

- [ ] **Devis & Factures**
  - [ ] Créer un devis
  - [ ] Export PDF
  - [ ] Convertir en facture
  - [ ] Export Excel

- [ ] **Chantiers**
  - [ ] Créer un chantier
  - [ ] Upload photos
  - [ ] Gérer les matériaux
  - [ ] Navigation GPS

- [ ] **Employés & Paiements**
  - [ ] Ajouter un employé
  - [ ] Saisir des heures
  - [ ] Export fiche de paie PDF
  - [ ] Enregistrer un paiement

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] Temps de chargement < 3s
  - [ ] Images lazy-loadées

### 6.2 Tests de Charge (Optionnel)

Utilisez [k6](https://k6.io) :

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // Montée à 20 users
    { duration: '1m', target: 20 },   // Maintien 20 users
    { duration: '30s', target: 0 },   // Descente
  ],
};

export default function () {
  let res = http.get('https://jardin-chef.vercel.app');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Exécuter :
```bash
k6 run load-test.js
```

---

## 🐛 Partie 7 : Debugging en Production

### 7.1 Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'un déploiement spécifique
vercel logs <deployment-url>
```

### 7.2 Logs Supabase

1. **API Logs** : `Logs` > `API Logs`
2. **Database Logs** : `Logs` > `Database Logs`
3. **Auth Logs** : `Auth` > `Logs`

### 7.3 Erreurs Courantes

#### "Failed to fetch" / CORS errors

**Solution** : Vérifier que `VITE_SUPABASE_URL` est correct dans Vercel

```bash
# Vérifier les env vars
vercel env ls
```

#### "Row Level Security policy violation"

**Solution** : Vérifier les politiques RLS dans Supabase

```sql
-- Lister les politiques
SELECT * FROM pg_policies WHERE tablename = 'clients';
```

#### "Storage object not found"

**Solution** : Vérifier les permissions du bucket `photos`

---

## 📈 Partie 8 : Optimisations Post-Déploiement

### 8.1 Compression Brotli

Activé automatiquement par Vercel, mais vérifiez :

```bash
curl -H "Accept-Encoding: br" -I https://jardin-chef.vercel.app
# Devrait retourner "Content-Encoding: br"
```

### 8.2 CDN & Edge Caching

Vercel utilise un CDN global automatiquement. Pour maximiser le cache :

```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 8.3 Database Connection Pooling

Supabase utilise **PgBouncer** automatiquement :

- **Transaction mode** : Défaut, recommandé
- **Max connections** : Géré automatiquement

Si besoin d'augmenter :
1. **Settings** > **Database** > **Connection pooling**
2. Ajuster "Pool size"

---

## 🎯 Checklist Finale

Avant de considérer le déploiement comme complet :

- [ ] ✅ Supabase configuré (migrations, auth, storage)
- [ ] ✅ Vercel déployé (frontend + env vars)
- [ ] ✅ Domaine personnalisé (optionnel)
- [ ] ✅ Headers de sécurité configurés
- [ ] ✅ Monitoring activé (Vercel Analytics, logs)
- [ ] ✅ Tests manuels réussis (auth, CRUD, exports)
- [ ] ✅ Performance optimisée (Lighthouse > 90)
- [ ] ✅ Backups automatiques (Supabase)
- [ ] ✅ Documentation à jour
- [ ] ✅ Équipe formée sur le workflow de déploiement

---

## 📚 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🆘 Support

En cas de problème :

1. Vérifiez les logs (Vercel + Supabase)
2. Consultez la documentation ci-dessus
3. Cherchez sur [Stack Overflow](https://stackoverflow.com)
4. Ouvrez une issue sur GitHub

---

**Félicitations ! 🎉 Votre application est maintenant en production !**

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0

