# 📧 Configuration Email pour Supabase - Guide Complet

## 🎯 Problème

L'erreur **"Error sending confirmation email"** survient car Supabase n'a pas de configuration email par défaut pour l'environnement de production.

---

## ✅ SOLUTION 1 : Désactiver la confirmation email (Développement)

### Pour tester rapidement sans configuration email

1. **Ouvrez votre Supabase Dashboard**
   - URL : https://app.supabase.com

2. **Naviguez vers Authentication**
   - Menu de gauche → **Authentication**
   - Puis **Providers**

3. **Configurez Email Provider**
   - Cliquez sur **Email** dans la liste des providers
   - Trouvez la section **"Email confirmations"**
   - **Décochez** : ✅ "Enable email confirmations"
   - **Sauvegardez** les modifications

4. **Testez l'inscription**
   - Créez un nouveau compte
   - ✅ L'utilisateur est créé immédiatement
   - ✅ Pas d'email de confirmation nécessaire

### ⚠️ Attention
- Cette solution est **uniquement pour le développement**
- En production, vous devriez **toujours activer** la confirmation email pour éviter les faux comptes

---

## 🚀 SOLUTION 2 : Configurer Resend (Recommandé pour Production)

### Étape 1 : Créer un compte Resend

1. Allez sur **https://resend.com**
2. Créez un compte gratuit
   - **Plan gratuit** : 3 000 emails/mois
   - **Plan Pro** : 50 000 emails/mois à 20$/mois

### Étape 2 : Ajouter votre domaine

1. Dans Resend Dashboard → **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `jardinchef.com`)
4. Ajoutez les **enregistrements DNS** fournis par Resend :

```dns
Type: MX
Host: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10

Type: TXT
Host: @
Value: "v=spf1 include:amazonses.com ~all"

Type: CNAME
Host: resend._domainkey
Value: resend._domainkey.resend.com
```

5. Attendez la vérification (5-30 min)

### Étape 3 : Obtenir la clé API

1. Dans Resend → **API Keys**
2. Cliquez sur **Create API Key**
3. Nom : `Supabase Auth Emails`
4. Permissions : **Full Access** ou **Sending Access**
5. **Copiez la clé** (format: `re_xxxxxxxxxxxxx`)

### Étape 4 : Configurer Supabase

1. **Ouvrez votre Supabase Dashboard**
2. **Project Settings** → **Auth** → **SMTP Settings**

3. **Remplissez les champs** :

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.resend.com
SMTP Port: 465 (ou 587)
SMTP User: resend
SMTP Pass: [Votre clé API Resend - re_xxxxxxxxxxxxx]
SMTP Sender Email: noreply@jardinchef.com (ou votre domaine vérifié)
SMTP Sender Name: Jardin Chef
```

4. **Sauvegardez**

### Étape 5 : Personnaliser les Templates Email (Optionnel)

1. Dans Supabase → **Authentication** → **Email Templates**
2. Personnalisez :
   - **Confirm signup** (Confirmation d'inscription)
   - **Invite user** (Invitation)
   - **Magic Link** (Connexion sans mot de passe)
   - **Change Email Address** (Changement d'email)
   - **Reset Password** (Réinitialisation mot de passe)

#### Template de Confirmation (Exemple) :

```html
<h2>Bienvenue sur Jardin Chef ! 🌿</h2>

<p>Bonjour,</p>

<p>Merci de vous être inscrit sur Jardin Chef, l'application de gestion pour les professionnels du paysage.</p>

<p>Pour confirmer votre adresse email, cliquez sur le lien ci-dessous :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Confirmer mon email
  </a>
</p>

<p>Ou copiez ce lien dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>

<p>Ce lien expire dans 24 heures.</p>

<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

<p>À très bientôt,<br>
L'équipe Jardin Chef 🌿</p>
```

### Étape 6 : Tester

1. **Créez un nouveau compte** dans l'application
2. **Vérifiez votre boîte email**
3. Cliquez sur le lien de confirmation
4. ✅ Compte activé !

---

## 🔧 SOLUTION 3 : SendGrid (Alternative)

### Si vous préférez SendGrid à Resend

1. **Créez un compte SendGrid**
   - https://sendgrid.com
   - Plan gratuit : 100 emails/jour

2. **Vérifiez votre domaine** dans SendGrid

3. **Créez une API Key** :
   - Settings → API Keys → Create API Key
   - Name : `Supabase Auth`
   - Permissions : **Full Access** ou **Mail Send**

4. **Configurez Supabase SMTP** :

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Votre API Key SendGrid - SG.xxxxxxxxxxxxx]
SMTP Sender Email: noreply@jardinchef.com
SMTP Sender Name: Jardin Chef
```

---

## 🛠️ Dépannage

### Problème : Emails non reçus

**Solution 1** : Vérifiez les spams
- Les emails peuvent arriver dans les spams au début

**Solution 2** : Vérifiez les logs Supabase
- Dashboard → Logs → Auth Logs
- Cherchez les erreurs d'envoi

**Solution 3** : Vérifiez Resend Dashboard
- Dashboard → Logs
- Vérifiez le statut d'envoi

### Problème : "SMTP connection failed"

**Cause** : Mauvaise configuration

**Solutions** :
1. Vérifiez que la clé API est correcte
2. Vérifiez le port (465 ou 587)
3. Vérifiez que le domaine est vérifié dans Resend

### Problème : "Sender domain not verified"

**Cause** : Domaine non vérifié dans Resend

**Solution** :
1. Allez dans Resend → Domains
2. Ajoutez les enregistrements DNS manquants
3. Attendez la vérification

---

## 📊 Comparaison des Solutions

| Solution | Coût | Complexité | Production |
|----------|------|------------|------------|
| **Désactiver confirmation** | Gratuit | ⭐ Facile | ❌ Non recommandé |
| **Resend** | Gratuit (3k/mois) | ⭐⭐ Moyen | ✅ Recommandé |
| **SendGrid** | Gratuit (100/jour) | ⭐⭐⭐ Moyen | ✅ OK |
| **SMTP perso** | Variable | ⭐⭐⭐⭐ Complexe | ✅ OK |

---

## 🎯 Recommandation

Pour **Jardin Chef**, nous recommandons :

1. **Développement** : Désactiver la confirmation email
2. **Production** : Utiliser **Resend** (gratuit, simple, fiable)

---

## ✅ Checklist

- [ ] Compte Resend créé
- [ ] Domaine ajouté et vérifié
- [ ] Clé API générée
- [ ] Supabase SMTP configuré
- [ ] Templates email personnalisés
- [ ] Test d'inscription effectué
- [ ] Email de confirmation reçu

---

## 📞 Support

Si vous avez des questions :
- **Resend Docs** : https://resend.com/docs
- **Supabase Auth Docs** : https://supabase.com/docs/guides/auth
- **SendGrid Docs** : https://docs.sendgrid.com

---

**✨ Une fois configuré, vos utilisateurs recevront des emails de confirmation professionnels ! ✨**

