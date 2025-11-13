# Configuration Supabase - URLs de redirection

## ⚠️ Configuration requise dans Supabase Dashboard

Pour que la confirmation d'email fonctionne correctement, vous devez configurer les URLs de redirection autorisées dans Supabase.

### Étapes de configuration

1. **Allez sur votre projet Supabase** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/auth

2. **Dans la section "URL Configuration"** :
   - **Site URL** : `http://localhost:8080` (pour le développement)
   - **Redirect URLs** : Ajoutez TOUTES ces URLs (une par ligne) :
     
     **Pour le développement local :**
     ```
     http://localhost:8080/**
     http://localhost:8080/auth
     http://localhost:8080/
     ```
     
     **Pour Vercel (production) :**
     ```
     https://votre-projet.vercel.app/**
     https://votre-projet.vercel.app/auth
     https://votre-projet.vercel.app/
     ```
     
     ⚠️ **Remplacez `votre-projet` par votre nom de projet Vercel réel** (ex: `jardin-chef-mobile.vercel.app`)
     
     **Si vous avez un domaine personnalisé :**
     ```
     https://votre-domaine.com/**
     https://votre-domaine.com/auth
     https://votre-domaine.com/
     ```

3. **Exemple complet** (si votre projet Vercel s'appelle `jardin-chef-mobile`) :
   ```
   http://localhost:8080/**
   http://localhost:8080/auth
   http://localhost:8080/
   https://jardin-chef-mobile.vercel.app/**
   https://jardin-chef-mobile.vercel.app/auth
   https://jardin-chef-mobile.vercel.app/
   ```

### Pourquoi cette configuration est importante

- Supabase vérifie que les URLs de redirection sont autorisées pour des raisons de sécurité
- Sans cette configuration, vous obtiendrez des erreurs 400 lors de la confirmation d'email
- Les URLs doivent correspondre exactement à celles utilisées dans votre application

### Vérification

Après avoir configuré les URLs :
1. Créez un nouveau compte
2. Confirmez votre email
3. Vous devriez être redirigé vers `/auth` puis automatiquement vers `/` (Dashboard)

