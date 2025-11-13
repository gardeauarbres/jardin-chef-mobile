# Configuration de l'envoi d'emails avec Resend

## 📧 Introduction

L'application utilise **Resend** pour envoyer des factures par email aux clients. Resend est un service moderne et fiable pour l'envoi d'emails transactionnels.

## 🔑 Configuration

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit (100 emails/jour en version gratuite)
3. Vérifiez votre email

### 2. Obtenir votre clé API

1. Une fois connecté, allez dans **API Keys** dans le menu
2. Cliquez sur **Create API Key**
3. Donnez un nom à votre clé (ex: "Jardin Chef Production")
4. Copiez la clé API (elle commence par `re_`)

⚠️ **Important** : Ne partagez jamais votre clé API publiquement !

### 3. Configurer le domaine (optionnel mais recommandé)

Pour envoyer des emails depuis votre propre domaine (ex: `factures@votre-domaine.fr`) :

1. Allez dans **Domains** dans le menu Resend
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `votre-domaine.fr`)
4. Suivez les instructions pour ajouter les enregistrements DNS :
   - Un enregistrement TXT pour la vérification
   - Un enregistrement SPF
   - Un enregistrement DKIM
5. Une fois vérifié, vous pouvez utiliser `factures@votre-domaine.fr` comme adresse d'expéditeur

### 4. Ajouter la clé API dans votre application

1. Ouvrez le fichier `.env` à la racine du projet
2. Ajoutez la ligne suivante :

```env
VITE_RESEND_API_KEY=re_votre_cle_api_ici
```

3. Remplacez `re_votre_cle_api_ici` par votre vraie clé API
4. Sauvegardez le fichier

### 5. Redémarrer l'application

Après avoir ajouté la clé API, redémarrez votre serveur de développement :

```bash
npm run dev
```

## 📝 Utilisation

Une fois configuré, vous pouvez envoyer des factures par email directement depuis la page **Factures** :

1. Allez sur la page **Factures** (`/invoices`)
2. Pour chaque facture, vous verrez un bouton avec l'icône 📧 (enveloppe)
3. Cliquez sur ce bouton pour envoyer la facture par email au client
4. Le PDF de la facture sera automatiquement joint à l'email
5. Le statut de la facture sera mis à jour à "Envoyée" et la date d'envoi sera enregistrée

## ⚠️ Notes importantes

- **Le client doit avoir un email** : Le bouton d'envoi par email n'apparaît que si le client a une adresse email renseignée
- **Format de l'email** : L'email est envoyé en HTML avec un design professionnel
- **Pièce jointe** : Le PDF de la facture est automatiquement joint à l'email
- **Statut automatique** : Après l'envoi, le statut de la facture passe à "sent" et la date d'envoi est enregistrée

## 🐛 Dépannage

### Erreur : "VITE_RESEND_API_KEY n'est pas configurée"

**Solution** : Vérifiez que vous avez bien ajouté la clé API dans le fichier `.env` et redémarré l'application.

### Erreur : "Unauthorized" ou "Invalid API key"

**Solution** : Vérifiez que votre clé API est correcte et qu'elle n'a pas été révoquée dans Resend.

### Erreur : "Domain not verified"

**Solution** : Si vous utilisez un domaine personnalisé, assurez-vous qu'il est bien vérifié dans Resend. En attendant, vous pouvez utiliser l'adresse par défaut de Resend (qui sera mise à jour dans le code).

### Les emails ne sont pas reçus

**Vérifications** :
1. Vérifiez les spams/courrier indésirable
2. Vérifiez que l'adresse email du client est correcte
3. Consultez les logs dans Resend pour voir le statut de l'envoi

## 💰 Tarification

- **Plan gratuit** : 100 emails/jour, 3 000 emails/mois
- **Plan Pro** : À partir de 20$/mois pour plus d'emails
- Consultez [https://resend.com/pricing](https://resend.com/pricing) pour plus d'informations

## 🔒 Sécurité

- Ne commitez jamais votre fichier `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Ne partagez jamais votre clé API publiquement
- Si votre clé API est compromise, révoquez-la immédiatement dans Resend et créez-en une nouvelle

