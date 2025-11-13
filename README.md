# Jardin Chef Mobile 🌳

Application mobile de gestion complète pour paysagistes. Gérez vos clients, devis, chantiers, paiements, employés et heures travaillées depuis votre smartphone ou tablette.

## ✨ Fonctionnalités

- 👥 **Gestion des clients** - Ajoutez, modifiez et gérez vos clients avec leurs coordonnées
- 📄 **Gestion des devis** - Créez des devis avec statuts (brouillon, envoyé, accepté, refusé) et calcul d'acomptes
- 🏗️ **Gestion des chantiers** - Suivez vos chantiers actifs avec progression des paiements
- 💰 **Gestion des paiements** - Gérez les acomptes, avancements et soldes par chantier
- 👷 **Gestion des employés** - Enregistrez vos employés avec leurs taux horaires
- ⏰ **Feuilles de temps** - Saisissez et suivez les heures travaillées par employé
- 📊 **Tableau de bord** - Vue d'ensemble avec statistiques en temps réel

## 🚀 Technologies utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : shadcn/ui + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth)
- **State Management** : TanStack Query (React Query)
- **Forms** : React Hook Form + Zod
- **Routing** : React Router v6
- **Icons** : Lucide React

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un compte Supabase avec un projet créé

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone git@github.com:gardeauarbres/jardin-chef-mobile.git
cd jardin-chef-mobile
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon
```

4. **Exécuter les migrations SQL**

Exécutez les migrations SQL dans votre projet Supabase :
- `supabase/migrations/20251112102256_19ad6ba6-236e-4462-bffb-9f6e8aeaf4ec.sql`
- `supabase/migrations/20250113000001_complete_schema.sql`

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur http://localhost:8080

## 📱 Utilisation

### Première connexion

1. Allez sur `/auth`
2. Créez un compte avec votre email et mot de passe
3. Connectez-vous

### Workflow typique

1. **Ajouter des clients** - `/clients`
2. **Créer des devis** - `/quotes`
3. **Créer des chantiers** - À partir des devis acceptés
4. **Gérer les paiements** - `/payments`
5. **Gérer les employés** - `/employees`
6. **Saisir les heures** - `/employees`

## 🏗️ Structure du projet

```
jardin-chef-mobile/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── hooks/         # Hooks personnalisés (useAuth, useSupabaseQuery)
│   ├── integrations/  # Configuration Supabase
│   ├── lib/           # Utilitaires et validations
│   ├── pages/         # Pages de l'application
│   └── types/         # Types TypeScript
├── supabase/
│   └── migrations/    # Migrations SQL
└── public/            # Fichiers statiques
```

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- Chaque utilisateur ne voit que ses propres données
- Authentification sécurisée via Supabase Auth
- Variables d'environnement pour les clés API

## 📦 Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

## 🎯 Optimisations

L'application est optimisée avec :
- ✅ Code splitting (chargement à la demande des pages)
- ✅ Cache React Query (5 minutes staleTime)
- ✅ Skeleton loaders pour une meilleure UX
- ✅ Optimisation des re-renders (useMemo, useCallback)
- ✅ Build optimisé avec chunks séparés par vendor

Voir `OPTIMIZATIONS.md` pour plus de détails.

## 📚 Documentation

- `SETUP.md` - Guide de configuration détaillé
- `NEXT_STEPS.md` - Prochaines étapes après installation
- `OPTIMIZATIONS.md` - Détails des optimisations
- `LOVABLE_FILES.md` - Liste des fichiers liés à Lovable (nettoyés)

## 🤝 Contribution

Ce projet est privé. Pour toute question ou suggestion, contactez le propriétaire du repository.

## 📄 Licence

Propriétaire - Tous droits réservés

## 🔗 Liens utiles

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

Développé avec ❤️ pour les paysagistes
