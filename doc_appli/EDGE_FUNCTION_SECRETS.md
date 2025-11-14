# Configuration des Secrets pour Edge Function

## Problème

L'erreur 401 "Unauthorized" peut être causée par des variables d'environnement manquantes dans la fonction Edge `send-invoice-email`.

## Solution : Ajouter les secrets Supabase

Les Edge Functions Supabase nécessitent que certaines variables soient configurées comme **secrets** dans le dashboard Supabase.

### Étapes pour ajouter les secrets

1. **Allez sur la page des secrets Supabase** :
   https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets

2. **Ajoutez les deux secrets suivants** :

   #### Secret 1 : `SUPABASE_URL`
   - **Nom** : `SUPABASE_URL`
   - **Valeur** : `https://qppuntwgpglsbdppejhw.supabase.co`
   - Cliquez sur "Add secret"

   #### Secret 2 : `SUPABASE_ANON_KEY`
   - **Nom** : `SUPABASE_ANON_KEY`
   - **Valeur** : Votre clé publique Supabase (celle qui commence par `eyJ...`)
   - Cette valeur se trouve dans :
     - Votre fichier `.env` : `VITE_SUPABASE_PUBLISHABLE_KEY`
     - Ou dans Supabase Dashboard : Settings > API > Project API keys > `anon` `public`
   - Cliquez sur "Add secret"

### Vérification

Après avoir ajouté les secrets :

1. **Redéployez la fonction Edge** :
   - Allez sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions
   - Cliquez sur `send-invoice-email`
   - Cliquez sur "Deploy" ou "Redeploy"

2. **Testez l'envoi d'email** :
   - Rafraîchissez votre application
   - Allez sur la page Factures
   - Cliquez sur le bouton "Mail"
   - L'erreur 401 devrait être résolue

### Logs pour déboguer

Si l'erreur persiste, vérifiez les logs de la fonction :
- https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions/send-invoice-email/logs

Les logs afficheront maintenant des messages détaillés si les variables sont manquantes ou si l'authentification échoue.

## Secrets déjà configurés

- ✅ `RESEND_API_KEY` - Clé API Resend avec permissions complètes

## Secrets à ajouter

- ⚠️ `SUPABASE_URL` - URL de votre projet Supabase
- ⚠️ `SUPABASE_ANON_KEY` - Clé publique Supabase (anon key)

