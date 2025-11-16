# Configuration du Profil d'Entreprise

Ce guide explique comment activer la fonctionnalité de **Profil d'Entreprise** qui permet de personnaliser automatiquement tous les documents générés (factures, devis, fiches de paie PDF).

## 📋 Prérequis

- Accès à la console Supabase
- Migration SQL à appliquer

## 🚀 Installation

### Étape 1 : Appliquer la migration SQL

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet `jardin-chef-mobile`
3. Dans le menu latéral, cliquez sur **SQL Editor**
4. Cliquez sur **New query**
5. Copiez et collez le contenu du fichier `supabase/migrations/20250114000002_add_company_profile.sql`
6. Cliquez sur **Run** (ou `Ctrl+Enter`)

### Étape 2 : Vérification

Vérifiez que la table a été créée :

```sql
SELECT * FROM company_profile;
```

Vous devriez voir une table vide (c'est normal).

## 📝 Utilisation

### Accéder à la page Profil

1. **Via le menu "Plus"** :
   - Ouvrez l'application
   - Cliquez sur l'icône **Plus** (⋮) dans la barre de navigation en bas
   - Cliquez sur **"Profil d'entreprise"** (première option)

2. **Via URL directe** :
   - Allez sur : `/profile`

### Remplir le profil

Remplissez les informations suivantes :

#### 🏢 Informations de l'entreprise
- **Nom de l'entreprise*** (requis) : Ex: "Jardin Chef"
- **Numéro SIRET** : 123 456 789 00012
- **Numéro de TVA** : FR12345678901
- **Auto-entrepreneur** : Cochez si vous êtes en régime auto-entrepreneur (désactive le champ TVA)

#### 📍 Adresse
- **Adresse** : 123 Rue des Jardins
- **Complément d'adresse** : Bâtiment A, Porte 2
- **Code postal** : 75001
- **Ville** : Paris
- **Pays** : France

#### 📞 Contact
- **Email** : contact@jardinchef.fr
- **Téléphone** : 06 12 34 56 78
- **Site web** : https://www.jardinchef.fr

#### 👤 Gérant
- **Prénom** : Jean
- **Nom** : Dupont

### Sauvegarder

Cliquez sur **Enregistrer** pour sauvegarder vos informations.

## 🎨 Impact sur les documents

Une fois le profil rempli, **tous les PDF générés** (factures, devis, fiches de paie) utiliseront automatiquement vos informations :

### Avant (sans profil)
```
JARDIN CHEF
Gestion pour Paysagistes
```

### Après (avec profil)
```
NOM DE VOTRE ENTREPRISE
123 Rue des Jardins, 75001, Paris

                        SIRET: 123 456 789 00012
                        TVA: FR12345678901
                        contact@jardinchef.fr
                        06 12 34 56 78
```

## 📄 Documents impactés

Les documents suivants seront personnalisés :

✅ **Factures** (section "Documents à envoyer" du Dashboard)
✅ **Fiches de paie** (section "Documents à envoyer" du Dashboard)
✅ **Devis** (exports futurs)
✅ **Emails** (templates d'emails)

## 🔐 Sécurité

- **Row Level Security (RLS)** : Activé
- Chaque utilisateur ne peut voir et modifier que **son propre profil**
- Les données sont stockées de manière sécurisée dans Supabase

## 🆘 Dépannage

### Le profil ne se sauvegarde pas

1. Vérifiez que vous êtes bien connecté
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Assurez-vous que la migration SQL a été appliquée correctement

### Les PDF ne montrent pas les nouvelles informations

1. Assurez-vous d'avoir **sauvegardé** le profil
2. Rechargez la page
3. Régénérez le PDF

### J'ai une erreur "User not authenticated"

1. Déconnectez-vous et reconnectez-vous
2. Videz le cache du navigateur
3. Vérifiez que votre session Supabase est valide

## 📚 Fichiers concernés

### Backend
- `supabase/migrations/20250114000002_add_company_profile.sql` - Migration SQL

### Frontend
- `src/hooks/useCompanyProfile.ts` - Hook React Query
- `src/pages/Profile.tsx` - Page de profil
- `src/lib/pdfExport.ts` - Fonctions d'export PDF mises à jour
- `src/pages/Dashboard.tsx` - Utilisation du profil
- `src/pages/More.tsx` - Lien vers le profil
- `src/App.tsx` - Route ajoutée

## 🎯 Prochaines étapes

Une fois le profil configuré, vous pouvez :

1. Générer des factures avec vos informations
2. Télécharger des fiches de paie personnalisées
3. Envoyer des emails avec signature professionnelle
4. Exporter des devis avec votre logo (à venir)

---

**Besoin d'aide ?** Contactez le support ou consultez la documentation Supabase.

