# Configuration de l'application Jardin Chef Mobile

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un compte Supabase avec un projet créé

## Étapes de configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine du projet (copiez `.env.example`)

2. Récupérez vos clés Supabase :
   - Allez sur https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/settings/api
   - Copiez l'URL du projet (déjà remplie dans `.env.example`)
   - Copiez la clé "anon" ou "public" (pas la service_role)

3. Modifiez le fichier `.env` avec vos valeurs :

```env
VITE_SUPABASE_URL=https://qppuntwgpglsbdppejhw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon-ici
```

### 3. Exécuter les migrations SQL ✅ (FAIT)

Les migrations SQL ont été exécutées avec succès dans votre base de données Supabase.

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:8080

## Structure de la base de données

L'application utilise les tables suivantes :

- `profiles` - Profils utilisateurs
- `clients` - Clients
- `quotes` - Devis
- `sites` - Chantiers
- `payments` - Paiements
- `employees` - Employés
- `timesheets` - Feuilles de temps

Toutes les tables utilisent Row Level Security (RLS) pour isoler les données par utilisateur.

## Fonctionnalités

- ✅ Authentification (inscription/connexion)
- ✅ Gestion des clients
- ✅ Gestion des devis
- ✅ Gestion des chantiers
- ✅ Gestion des paiements
- ✅ Gestion des employés et heures
- ✅ Tableau de bord avec statistiques

## Notes importantes

- Les données sont stockées dans Supabase (cloud)
- Chaque utilisateur ne voit que ses propres données grâce à RLS
- L'application est optimisée pour mobile avec navigation en bas d'écran

