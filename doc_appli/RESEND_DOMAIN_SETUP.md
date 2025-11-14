# Configuration d'un domaine Resend pour l'envoi d'emails

## Problème actuel

Resend limite l'envoi d'emails aux adresses de test tant qu'aucun domaine n'est vérifié. Vous pouvez uniquement envoyer des emails à votre propre adresse email (gard.eau.arbres@gmail.com).

## Solution : Vérifier un domaine dans Resend

### Option 1 : Utiliser votre domaine personnalisé (recommandé pour la production)

1. **Allez sur Resend Domains** :
   - https://resend.com/domains

2. **Ajoutez votre domaine** :
   - Cliquez sur "Add Domain"
   - Entrez votre domaine (ex: `jardinchef.fr` ou `votre-domaine.com`)
   - Cliquez sur "Add"

3. **Configurez les enregistrements DNS** :
   - Resend vous donnera des enregistrements DNS à ajouter dans votre gestionnaire de domaine
   - Types d'enregistrements nécessaires :
     - **SPF** : `v=spf1 include:resend.com ~all`
     - **DKIM** : Clés fournies par Resend
     - **DMARC** : `v=DMARC1; p=none; rua=mailto:dmarc@votre-domaine.com`

4. **Vérifiez le domaine** :
   - Une fois les DNS configurés, Resend vérifiera automatiquement le domaine
   - Cela peut prendre quelques minutes à quelques heures

5. **Mettez à jour le secret dans Supabase** :
   - Allez sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets
   - Ajoutez ou modifiez le secret `RESEND_FROM_EMAIL`
   - Valeur : `Jardin Chef <noreply@votre-domaine.com>` (remplacez par votre domaine vérifié)

### Option 2 : Solution temporaire pour les tests

Si vous voulez tester immédiatement sans configurer de domaine :

1. **Mettez à jour le secret `RESEND_FROM_EMAIL` dans Supabase** :
   - Allez sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/secrets
   - Ajoutez le secret `RESEND_FROM_EMAIL`
   - Valeur : `Jardin Chef <gard.eau.arbres@gmail.com>`
   - ⚠️ **Note** : Vous ne pourrez toujours envoyer qu'à votre propre adresse email avec cette configuration

2. **Redéployez la fonction Edge** :
   - Allez sur : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions
   - Cliquez sur `send-invoice-email`
   - Cliquez sur "Deploy"

## Configuration des secrets Supabase

### Secrets requis

1. ✅ `RESEND_API_KEY` - Clé API Resend avec permissions complètes
2. ✅ `RESEND_SUPABASE_URL` - URL de votre projet Supabase
3. ✅ `SUPABASE_ANON_KEY` - Clé publique Supabase
4. ⚠️ `RESEND_FROM_EMAIL` - Adresse email d'expéditeur (à configurer)

### Valeurs recommandées pour `RESEND_FROM_EMAIL`

**Pour les tests (domaine non vérifié)** :
```
Jardin Chef <gard.eau.arbres@gmail.com>
```

**Pour la production (domaine vérifié)** :
```
Jardin Chef <noreply@votre-domaine.com>
```
ou
```
Jardin Chef <factures@votre-domaine.com>
```

## Étapes après configuration

1. Ajoutez le secret `RESEND_FROM_EMAIL` dans Supabase
2. Redéployez la fonction Edge `send-invoice-email`
3. Testez l'envoi d'email depuis l'application
4. Vérifiez les logs si nécessaire : https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/functions/send-invoice-email/logs

## Ressources

- Documentation Resend Domains : https://resend.com/docs/dashboard/domains/introduction
- Guide de configuration DNS : https://resend.com/docs/dashboard/domains/verify-a-domain

