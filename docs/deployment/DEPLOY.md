# Guide de déploiement 🚀

## Déploiement sur Vercel (Recommandé)

### Option 1 : Déploiement via l'interface Vercel (Plus simple)

1. **Allez sur [vercel.com](https://vercel.com)** et connectez-vous avec votre compte GitHub

2. **Cliquez sur "New Project"**

3. **Importez votre repository** `gardeauarbres/jardin-chef-mobile`

4. **Configuration du projet** :
   - **Framework Preset** : Vite
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (déjà configuré dans vercel.json)
   - **Output Directory** : `dist` (déjà configuré dans vercel.json)
   - **Install Command** : `npm install` (déjà configuré)

5. **Variables d'environnement** :
   - Cliquez sur "Environment Variables"
   - Ajoutez :
     - `VITE_SUPABASE_URL` = votre URL Supabase
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = votre clé anon Supabase

6. **Cliquez sur "Deploy"**

7. **Votre application sera déployée** et vous recevrez une URL (ex: `jardin-chef-mobile.vercel.app`)

### Option 2 : Déploiement via CLI Vercel

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour déployer en production
vercel --prod
```

## Déploiement sur Netlify

### Via l'interface Netlify

1. Allez sur [netlify.com](https://netlify.com) et connectez-vous avec GitHub

2. Cliquez sur "Add new site" > "Import an existing project"

3. Sélectionnez votre repository

4. Configuration :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`

5. Ajoutez les variables d'environnement dans "Site settings" > "Environment variables"

6. Déployez !

### Via CLI Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=dist
```

## Variables d'environnement requises

Assurez-vous d'ajouter ces variables dans votre plateforme de déploiement :

```
VITE_SUPABASE_URL=https://qppuntwgpglsbdppejhw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon
```

## Notes importantes

- ✅ Le fichier `vercel.json` est déjà configuré pour Vercel
- ✅ Le dossier `dist` est généré après `npm run build`
- ✅ Les routes React Router sont configurées avec des rewrites dans `vercel.json`
- ⚠️ N'oubliez pas d'ajouter les variables d'environnement dans votre plateforme de déploiement

## Après le déploiement

1. Vérifiez que l'application fonctionne correctement
2. Testez l'inscription/connexion
3. Vérifiez que les données se synchronisent avec Supabase
4. Configurez un domaine personnalisé si nécessaire (dans les paramètres du projet)

## Support

En cas de problème :
- Vérifiez les logs de déploiement dans votre dashboard Vercel/Netlify
- Vérifiez que les variables d'environnement sont bien configurées
- Vérifiez que le build fonctionne localement avec `npm run build`

