# Configuration de la Edge Function pour l'envoi d'emails

## 📧 Problème résolu

L'erreur CORS lors de l'envoi d'emails depuis le navigateur est résolue en utilisant une **Supabase Edge Function** qui fait l'appel à Resend API côté serveur.

## 🔧 Configuration requise

### 1. Déployer la Edge Function dans Supabase

1. **Allez sur votre projet Supabase** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

2. **Créez une nouvelle fonction** :
   - Cliquez sur "Create a new function"
   - Nom : `send-invoice-email`
   - Copiez le contenu du fichier `supabase/functions/send-invoice-email/index.ts`

3. **Déployez la fonction** :
   - Cliquez sur "Deploy function"

### 2. Configurer le secret Resend dans Supabase

1. **Allez dans les paramètres du projet** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets

2. **Ajoutez le secret** :
   - Cliquez sur "Add secret"
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF`
   - Cliquez sur "Save"

### 3. Méthode alternative : Via Supabase CLI

Si vous avez Supabase CLI installé :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref qppuntwgpglsbdppejhw

# Déployer la fonction
supabase functions deploy send-invoice-email

# Ajouter le secret
supabase secrets set RESEND_API_KEY=re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF
```

## ✅ Vérification

Une fois la fonction déployée et le secret configuré :

1. Testez l'envoi d'email depuis l'application
2. Vérifiez les logs dans Supabase Dashboard → Functions → send-invoice-email → Logs
3. L'email devrait être envoyé sans erreur CORS

## 🔒 Sécurité

- La clé API Resend est maintenant stockée côté serveur (Supabase secrets)
- Elle n'est plus exposée dans le code client
- L'authentification est vérifiée avant chaque envoi d'email

## 📝 Notes

- La fonction utilise `onboarding@resend.dev` comme adresse d'expéditeur par défaut
- Pour utiliser votre propre domaine, configurez-le dans Resend et modifiez l'adresse dans la fonction
- Les logs de la fonction sont disponibles dans Supabase Dashboard

