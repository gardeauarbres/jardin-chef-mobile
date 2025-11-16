# 🔧 Configuration DNS Resend sur LWS - Guide Complet

## 📋 Enregistrements à Ajouter

### ✅ Déjà Configurés (À Vérifier)

| Type | Nom | Valeur | Priorité | Statut |
|------|-----|--------|----------|--------|
| TXT | @ | `v=spf1 include:amazonses.com ~all` | - | ✅ Déjà fait |
| TXT | _dmarc | `v=DMARC1; p=none;` | - | ✅ Déjà fait |
| MX | @ | `inbound-smtp.eu-west-1.amazonaws.com` | 9 | ✅ Déjà fait |

### 🆕 À Ajouter Maintenant

#### 1. DKIM (Authentification des emails)

```
Type: TXT
Nom: resend._domainkey
Valeur: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdfMNSuBigr9/rTxX1OxMUHh4+/fToSEQQJMx87yRjpBgI5yDFJT7aeiLPDJg5Q1gtAddZ1t3K6I1hCxSmXJPV2QRhd4cpdbeFUyv2ANfjOIBkyu7lD0MHqmC4zzQewCAj+MuyGQpT2s6rg263h/lwxigZbddsreXytgaxd6iu6QIDAQAB
TTL: 3600
```

**⚠️ IMPORTANT** : Copiez la valeur SANS espaces, en un seul bloc.

#### 2. SPF "send" (Sous-domaine d'envoi)

```
Type: TXT
Nom: send
Valeur: v=spf1 include:amazonses.com ~all
TTL: 3600
```

#### 3. MX "send" (Routage emails)

```
Type: MX
Nom: send
Priorité: 10
Valeur: feedback-smtp.eu-west-1.amazonses.com
TTL: 3600
```

---

## 🖥️ Procédure dans le Panel LWS

### Étape 1 : Accéder à la Gestion DNS

1. **Connectez-vous** à votre panel LWS
2. **Cliquez** sur votre domaine `gardeauarbres.fr`
3. **Menu** : DNS ou "Gérer la zone DNS"

### Étape 2 : Ajouter DKIM (TXT)

1. **Cliquez** sur "Ajouter un enregistrement"
2. **Type** : Sélectionnez `TXT`
3. **Nom** : `resend._domainkey`
4. **Valeur** : Collez toute la clé publique (le long texte `p=MIG...`)
5. **TTL** : `3600` (ou 6 heures)
6. **Validez**

**💡 Astuce** : Si LWS ajoute automatiquement ".gardeauarbres.fr" au nom, mettez juste `resend._domainkey` (sans le domaine).

### Étape 3 : Ajouter SPF "send" (TXT)

1. **Cliquez** sur "Ajouter un enregistrement"
2. **Type** : `TXT`
3. **Nom** : `send`
4. **Valeur** : `v=spf1 include:amazonses.com ~all`
5. **TTL** : `3600`
6. **Validez**

### Étape 4 : Ajouter MX "send"

1. **Cliquez** sur "Ajouter un enregistrement"
2. **Type** : `MX`
3. **Nom** : `send`
4. **Priorité** : `10`
5. **Valeur** : `feedback-smtp.eu-west-1.amazonses.com`
6. **TTL** : `3600`
7. **Validez**

---

## ⏱️ Propagation DNS

- **Temps de propagation** : 5 minutes à 48 heures
- **En moyenne** : 1-2 heures

### Vérifier la Propagation

**Option 1 : MXToolbox**
1. Allez sur https://mxtoolbox.com/SuperTool.aspx
2. Tapez : `resend._domainkey.gardeauarbres.fr`
3. Type : `TXT Lookup`
4. Si la clé publique s'affiche → ✅ Propagé !

**Option 2 : Google DNS**
1. Allez sur https://dns.google/
2. Cherchez : `resend._domainkey.gardeauarbres.fr`
3. Type : `TXT`

**Option 3 : Ligne de commande**

```bash
# Windows PowerShell
nslookup -type=TXT resend._domainkey.gardeauarbres.fr

# Vérifier MX send
nslookup -type=MX send.gardeauarbres.fr
```

---

## ✅ Validation dans Resend

### Étape 1 : Retour sur Resend Dashboard

1. **Connectez-vous** à https://resend.com
2. **Dashboard** → **Domains**
3. **Sélectionnez** `gardeauarbres.fr`

### Étape 2 : Vérifier le Statut

Resend affiche le statut de chaque enregistrement :

```
✅ DKIM: Verified
✅ SPF: Verified
✅ MX: Verified
```

**⏳ Si "Pending"** : Attendez la propagation DNS (15-30 min en général)

### Étape 3 : Cliquez sur "Verify Domain"

Une fois tous les enregistrements propagés, cliquez sur le bouton **"Verify Domain"**.

**✅ Statut "Verified"** = Prêt à envoyer des emails !

---

## 🔑 Obtenir l'API Key Resend

### Étape 1 : Créer une API Key

1. **Resend Dashboard** → **API Keys**
2. **Cliquez** sur "Create API Key"
3. **Nom** : `Jardin Chef - Supabase Auth`
4. **Permissions** : `Sending access` ou `Full access`
5. **Domaine** (optionnel) : `gardeauarbres.fr`
6. **Cliquez** sur "Create"

### Étape 2 : Copier la Clé

```
re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT** : Copiez-la immédiatement, vous ne pourrez plus la voir !

---

## ⚙️ Configuration Supabase

### Étape 1 : Accéder aux Paramètres SMTP

1. **Supabase Dashboard** : https://app.supabase.com
2. **Votre projet** → **Project Settings**
3. **Authentication** → **SMTP Settings**

### Étape 2 : Configurer SMTP Resend

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP User: resend
SMTP Pass: [Votre API Key Resend - re_xxxxx]
SMTP Sender Email: noreply@gardeauarbres.fr
SMTP Sender Name: Jardin Chef
```

**💡 Note** : Le "SMTP User" est toujours `resend` (littéralement le mot "resend")

### Étape 3 : Sauvegarder

Cliquez sur **Save**.

---

## 📧 Réactiver la Confirmation Email

### Étape 1 : Activer la Confirmation

1. **Supabase Dashboard**
2. **Authentication** → **Providers** → **Email**
3. **Enable email confirmations** : ✅ ON
4. **Save**

### Étape 2 : Personnaliser les Templates (Optionnel)

1. **Authentication** → **Email Templates**
2. **Confirm signup** : Personnalisez le message
3. Variables disponibles :
   - `{{ .ConfirmationURL }}` - Lien de confirmation
   - `{{ .Token }}` - Token de confirmation
   - `{{ .SiteURL }}` - URL de votre site

**Exemple de template** :

```html
<h2>Bienvenue sur Jardin Chef ! 🌿</h2>

<p>Bonjour,</p>

<p>Merci de vous être inscrit sur Jardin Chef.</p>

<p>Pour confirmer votre adresse email, cliquez sur le lien ci-dessous :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Confirmer mon email
  </a>
</p>

<p>Ou copiez ce lien dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>

<p>Ce lien expire dans 24 heures.</p>

<p>À très bientôt,<br>
L'équipe Jardin Chef 🌿</p>
```

---

## 🧪 Tester l'Envoi d'Emails

### Test 1 : Invitation Utilisateur (Supabase)

1. **Supabase** → **Authentication** → **Users**
2. **Invite User**
3. **Email** : Votre adresse email
4. **Send Invite**
5. **Vérifiez** votre boîte mail

### Test 2 : Inscription dans l'Application

1. **Ouvrez** https://jardin-chef-mobile.vercel.app
2. **Déconnectez-vous** (si connecté)
3. **Créez un nouveau compte** avec un email test
4. **Vérifiez** votre boîte mail
5. **Cliquez** sur le lien de confirmation
6. ✅ **Compte activé** !

### Test 3 : Vérifier dans Resend Dashboard

1. **Resend** → **Logs** ou **Activity**
2. Vous devriez voir :
   - **Status** : `delivered` ✅
   - **Recipient** : Votre email
   - **Subject** : "Confirm Your Signup"

---

## 🔍 Dépannage

### ❌ Problème : Emails non reçus

**Solutions** :

1. **Vérifiez les spams** - Les emails peuvent arriver en spam au début
2. **Vérifiez Resend Logs** - Dashboard → Logs
3. **Vérifiez Supabase Auth Logs** - Dashboard → Logs → Auth
4. **Vérifiez les DNS** - MXToolbox ou Google DNS
5. **Attendez 1-2h** - Propagation DNS peut prendre du temps

### ❌ Problème : "Domain not verified"

**Solutions** :

1. **Vérifiez la propagation DNS** - MXToolbox
2. **Vérifiez les enregistrements** - Panel LWS
3. **Cliquez sur "Verify Domain"** - Resend Dashboard
4. **Attendez 30 min** - Puis réessayez

### ❌ Problème : "SMTP connection failed"

**Solutions** :

1. **Vérifiez l'API Key** - Copiée correctement ?
2. **SMTP User = "resend"** - Pas votre email, le mot "resend"
3. **Port = 465** - Pas 587
4. **Régénérez l'API Key** - Si nécessaire

### ❌ Problème : Emails en spam

**Solutions** :

1. **Attendez quelques jours** - La réputation se construit
2. **Configurez DMARC en "quarantine"** ou "reject" (plus tard)
3. **Ajoutez un logo** - Dans les emails (improve trust)
4. **Évitez les mots spam** - "URGENT", "GRATUIT", etc.

---

## 📊 Limites Resend

### Plan Gratuit

- ✅ **3 000 emails/mois** gratuits
- ✅ **100 emails/jour** max
- ✅ Tous les domaines
- ✅ Logs 30 jours
- ✅ Support email

### Plan Pro (20$/mois)

- ✅ **50 000 emails/mois**
- ✅ **1 000 emails/jour**
- ✅ Logs 90 jours
- ✅ Support prioritaire

**Pour Jardin Chef** : Le plan gratuit devrait suffire largement ! 🎉

---

## ✅ Checklist Complète

```
Configuration Resend
├─ ✅ Compte Resend créé
├─ ⏳ DNS DKIM ajouté (resend._domainkey)
├─ ⏳ DNS SPF "send" ajouté
├─ ⏳ DNS MX "send" ajouté
├─ ⏳ Attendre propagation DNS (1-2h)
├─ ⏳ Vérifier domaine dans Resend
├─ ⏳ Créer API Key Resend
├─ ⏳ Configurer SMTP dans Supabase
├─ ⏳ Réactiver confirmation email
└─ ⏳ Tester l'envoi d'emails
```

---

## 📞 Support

- **Resend Docs** : https://resend.com/docs
- **Resend Status** : https://status.resend.com
- **Supabase SMTP Docs** : https://supabase.com/docs/guides/auth/auth-smtp

---

**🌿 Une fois configuré, vos utilisateurs recevront des emails de confirmation professionnels ! 🌿**

*Configuration DNS : 10 min | Propagation : 1-2h | Tests : 5 min*

