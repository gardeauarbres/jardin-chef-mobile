# 🚀 Guide pas à pas : Déployer la Edge Function dans Supabase

## ⚠️ IMPORTANT : Ce n'est PAS une requête SQL !

La Edge Function est du code TypeScript/Deno, **PAS du SQL**. Ne l'exécutez pas dans l'éditeur SQL de Supabase.

## 📋 Étapes détaillées

### Étape 1 : Accéder aux Edge Functions

1. **Allez sur votre projet Supabase** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

2. **Si vous ne voyez pas "Functions" dans le menu** :
   - Cliquez sur "Edge Functions" dans le menu de gauche
   - Ou allez directement sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

### Étape 2 : Créer une nouvelle fonction

1. **Cliquez sur le bouton "Create a new function"** (ou "New function")
2. **Remplissez le formulaire** :
   - **Function name** : `send-invoice-email`
   - **Template** : Laissez "Empty function" ou sélectionnez "Hello World"
   - Cliquez sur "Create function"

### Étape 3 : Copier le code

1. **Ouvrez le fichier** `supabase/functions/send-invoice-email/index.ts` dans votre éditeur de code
2. **Sélectionnez tout le contenu** (Ctrl+A)
3. **Copiez** (Ctrl+C)

### Étape 4 : Coller le code dans Supabase

1. **Dans l'éditeur de fonction Supabase**, supprimez tout le code existant
2. **Collez le code** que vous avez copié (Ctrl+V)
3. **Vérifiez** que le code est bien collé

### Étape 5 : Déployer la fonction

1. **Cliquez sur le bouton "Deploy"** (en haut à droite de l'éditeur)
2. **Attendez** que le déploiement se termine
3. **Vous devriez voir** "Function deployed successfully"

### Étape 6 : Configurer le secret Resend

1. **Allez dans Settings** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets

2. **Cliquez sur "Add secret"** ou "New secret"

3. **Remplissez** :
   - **Name** : `RESEND_API_KEY` (exactement comme ça, en majuscules)
   - **Value** : `re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF`

4. **Cliquez sur "Save"**

### Étape 7 : Vérifier

1. **Retournez sur Functions** :
   - https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

2. **Vous devriez voir** `send-invoice-email` dans la liste avec le statut "Active"

3. **Testez depuis l'application** :
   - Allez sur la page Factures
   - Cliquez sur "Envoyer par email"
   - Ça devrait fonctionner sans erreur CORS !

## 🎯 Résumé visuel

```
Supabase Dashboard
  └─ Edge Functions (menu de gauche)
      └─ Create a new function
          └─ Nom : send-invoice-email
              └─ Coller le code de index.ts
                  └─ Deploy
                      └─ Settings → Secrets
                          └─ Ajouter RESEND_API_KEY
```

## ❌ Ce qu'il NE faut PAS faire

- ❌ Ne pas aller dans "SQL Editor"
- ❌ Ne pas exécuter le code comme une requête SQL
- ❌ Ne pas utiliser l'éditeur SQL pour créer la fonction

## ✅ Ce qu'il faut faire

- ✅ Aller dans "Edge Functions"
- ✅ Créer une nouvelle fonction via l'interface
- ✅ Coller le code TypeScript dans l'éditeur de fonction
- ✅ Déployer via le bouton "Deploy"

## 🐛 Si vous ne trouvez pas "Edge Functions"

Si l'option "Edge Functions" n'apparaît pas dans le menu :

1. Vérifiez que vous êtes sur le bon projet
2. Vérifiez que votre projet Supabase supporte les Edge Functions (tous les projets les supportent)
3. Essayez d'aller directement sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

## 📞 Besoin d'aide ?

Si vous avez des difficultés, dites-moi à quelle étape vous êtes bloqué et je vous aiderai !

