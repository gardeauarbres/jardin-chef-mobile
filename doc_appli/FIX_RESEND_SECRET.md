# 🔧 Correction de l'erreur "restricted_api_key"

## 🐛 Problème

L'erreur `restricted_api_key` avec le statut 401 indique que la clé API Resend dans Supabase secrets n'est pas correctement configurée ou n'est pas accessible.

## ✅ Solution

### Étape 1 : Vérifier le secret dans Supabase

1. **Allez sur** : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets

2. **Vérifiez que le secret existe** :
   - Cherchez `RESEND_API_KEY` dans la liste
   - Si il n'existe pas, créez-le (voir étape 2)
   - Si il existe, vérifiez que la valeur est correcte

### Étape 2 : Créer/Mettre à jour le secret

1. **Cliquez sur "Add secret"** ou sélectionnez `RESEND_API_KEY` pour le modifier

2. **Remplissez** :
   - **Name** : `RESEND_API_KEY` (exactement comme ça, en majuscules)
   - **Value** : `re_PNLKd9EJ_LUChaxHJCfwKGUxXPutBRHhF`

3. **Cliquez sur "Save"**

### Étape 3 : Redéployer la fonction (si nécessaire)

Si vous avez modifié le secret, vous devrez peut-être redéployer la fonction :

1. **Allez sur** : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions

2. **Cliquez sur** `send-invoice-email`

3. **Cliquez sur "Redeploy"** ou faites une petite modification et redéployez

### Étape 4 : Vérifier les logs

1. **Allez sur** : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions/send-invoice-email/logs

2. **Testez l'envoi d'email** depuis l'application

3. **Vérifiez les logs** pour voir si l'erreur persiste

## 🔍 Vérification

Pour vérifier que le secret est bien configuré, vous pouvez tester la fonction directement :

1. Allez sur la fonction dans Supabase
2. Cliquez sur "Invoke function"
3. Utilisez ce body de test :
```json
{
  "to": "votre-email@test.com",
  "invoiceNumber": "TEST-001",
  "clientName": "Test Client",
  "pdfBase64": "dGVzdA==",
  "pdfFileName": "test.pdf",
  "amount": 100,
  "dueDate": "2024-12-31"
}
```

## 📝 Note importante

Si l'erreur persiste après avoir vérifié le secret, il se peut que :
- La clé API Resend soit vraiment restreinte et ne fonctionne pas depuis Supabase
- Dans ce cas, créez une nouvelle clé API dans Resend avec "Full access"

## 🔑 Créer une nouvelle clé API Resend (si nécessaire)

1. Allez sur https://resend.com/api-keys
2. Cliquez sur "Create API Key"
3. Nom : "Supabase Full Access"
4. Permissions : Sélectionnez "Full access" (pas seulement "Send emails")
5. Copiez la nouvelle clé
6. Mettez à jour le secret dans Supabase avec cette nouvelle clé

