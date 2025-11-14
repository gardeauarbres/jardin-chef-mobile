# 🚀 Guide de déploiement de la Edge Function pour l'envoi d'emails

## 📋 Problème résolu

L'erreur CORS est résolue en utilisant une **Supabase Edge Function** qui fait l'appel à Resend API côté serveur, au lieu d'appeler directement depuis le navigateur.

## 🔧 Étapes de déploiement

### Option 1 : Via l'interface web Supabase (Recommandé)

#### Étape 1 : Créer la fonction

1. **Allez sur votre projet Supabase** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

2. **Créez une nouvelle fonction** :
   - Cliquez sur **"Create a new function"**
   - **Function name** : `send-invoice-email`
   - **Template** : Laissez vide ou sélectionnez "Hello World"

3. **Copiez le code** :
   - Ouvrez le fichier `supabase/functions/send-invoice-email/index.ts` dans votre éditeur
   - Copiez tout le contenu
   - Collez-le dans l'éditeur de la fonction Supabase
   - Cliquez sur **"Deploy function"**

#### Étape 2 : Configurer le secret Resend

1. **Allez dans les paramètres** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets

2. **Ajoutez le secret** :
   - Cliquez sur **"Add secret"** ou **"New secret"**
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF`
   - Cliquez sur **"Save"**

#### Étape 3 : Vérifier le déploiement

1. **Vérifiez que la fonction est déployée** :
   - Retournez sur la page Functions
   - Vous devriez voir `send-invoice-email` dans la liste
   - Le statut doit être "Active"

2. **Testez depuis l'application** :
   - Allez sur la page Factures
   - Cliquez sur "Envoyer par email"
   - L'email devrait être envoyé sans erreur CORS

### Option 2 : Via Supabase CLI (Avancé)

Si vous avez Supabase CLI installé :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref qppuntwgpglsbdppejhw

# Déployer la fonction
supabase functions deploy send-invoice-email

# Ajouter le secret Resend
supabase secrets set RESEND_API_KEY=re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF
```

## 📝 Code de la fonction

Le code complet de la fonction se trouve dans :
- `supabase/functions/send-invoice-email/index.ts`

## ✅ Vérification

Une fois déployé :

1. **Testez l'envoi d'email** depuis l'application
2. **Vérifiez les logs** :
   - Allez sur Functions → `send-invoice-email` → Logs
   - Vous devriez voir les logs d'exécution
3. **Vérifiez les emails** :
   - L'email devrait arriver dans la boîte de réception du client

## 🔒 Sécurité

- ✅ La clé API Resend est stockée côté serveur (Supabase secrets)
- ✅ Elle n'est plus exposée dans le code client
- ✅ L'authentification est vérifiée avant chaque envoi
- ✅ Pas d'erreur CORS car l'appel se fait côté serveur

## 🐛 Dépannage

### Erreur : "Function not found"
- Vérifiez que la fonction est bien déployée
- Vérifiez le nom de la fonction : `send-invoice-email`

### Erreur : "RESEND_API_KEY not configured"
- Vérifiez que le secret est bien configuré dans Supabase
- Le nom doit être exactement : `RESEND_API_KEY`

### Erreur : "Non autorisé"
- Vérifiez que vous êtes bien connecté dans l'application
- Vérifiez que le token d'authentification est valide

## 📚 Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentation Resend API](https://resend.com/docs)

