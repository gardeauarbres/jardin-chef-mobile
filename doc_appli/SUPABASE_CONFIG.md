# Configuration Supabase - URLs de redirection

## ⚠️ Configuration requise dans Supabase Dashboard

Pour que la confirmation d'email fonctionne correctement, vous devez configurer les URLs de redirection autorisées dans Supabase.

### Étapes de configuration

1. **Allez sur votre projet Supabase** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/auth

2. **Dans la section "URL Configuration"** :
   - **Site URL** : `http://localhost:8080`
   - **Redirect URLs** : Ajoutez ces URLs (une par ligne) :
     ```
     http://localhost:8080/**
     http://localhost:8080/auth
     http://localhost:8080/
     ```

3. **Pour la production** (si vous déployez) :
   - Ajoutez aussi votre URL de production :
     ```
     https://votre-domaine.com/**
     https://votre-domaine.com/auth
     https://votre-domaine.com/
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

