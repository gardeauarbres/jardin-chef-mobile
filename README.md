# 🌿 Jardin Chef - Application de Gestion pour Paysagistes

Une application web moderne et complète pour la gestion d'entreprise de paysagisme, construite avec React, TypeScript, et Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

---

## 📚 Documentation Complète

👉 **[Consultez l'index complet de la documentation](docs/INDEX.md)** pour tous les guides détaillés

- 🔧 [Guides d'installation](docs/setup/)
- ✨ [Fonctionnalités](docs/features/)
- 👨‍💻 [Développement](docs/development/)
- 🚀 [Déploiement](docs/deployment/)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Développement](#-développement)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [License](#-license)

---

## ✨ Fonctionnalités

### 🎯 Gestion Complète

#### 👥 **Clients**
- Création et gestion des fiches clients
- Historique des factures par client
- Export Excel/CSV
- Import massif depuis fichiers
- Navigation GPS vers les chantiers (Google Maps, Waze, Apple Maps)

#### 📄 **Devis**
- Création de devis personnalisés
- Suivi des statuts (Brouillon, Envoyé, Accepté, Refusé)
- Conversion automatique en facture
- Export PDF professionnel
- Export/Import Excel/CSV

#### 🏗️ **Chantiers**
- Gestion des projets en cours
- Statuts : Actif, Terminé, En pause
- Suivi de l'avancement (0-100%)
- Galerie photos par chantier
- Gestion des matériaux utilisés
- Itinéraire vers le chantier

#### 💰 **Paiements**
- Enregistrement des paiements
- Suivi des paiements en attente
- Export Excel/CSV
- Import massif

#### 🧾 **Factures**
- Génération automatique de factures
- Export PDF personnalisé avec informations de l'entreprise
- Envoi par email (intégration future)
- Suivi des factures payées/impayées
- Export/Import Excel/CSV

#### 👷 **Employés**
- Gestion des fiches employés
- Saisie des heures travaillées
- Calcul automatique des salaires
- Historique des paiements
- Export PDF des fiches de paie
- Export/Import Excel/CSV

#### 📅 **Calendrier**
- Vue calendrier des interventions
- Planification des chantiers
- Gestion des rendez-vous

#### 📦 **Gestion des stocks**
- Inventaire des matériaux
- Suivi des mouvements de stock
- Stock minimum avec alertes
- Déduction automatique lors de l'utilisation sur chantiers
- Catégorisation et localisation

#### 📊 **Statistiques avancées**
- Graphiques interactifs (Recharts)
- KPIs en temps réel
- Taux de conversion devis → chantiers
- Revenus mensuels
- Analyse par période (6 mois, 12 mois, 2 ans)

#### 🔔 **Rappels automatiques**
- Relances automatiques pour factures impayées
- Templates d'emails personnalisables
- Historique des envois

#### ✉️ **Templates d'emails**
- Bibliothèque de templates réutilisables
- Variables dynamiques (nom client, montant, etc.)
- Catégories : Factures, Devis, Rappels
- Prévisualisation en temps réel

#### 🏢 **Profil d'entreprise**
- Informations complètes de l'entreprise
- SIRET, TVA, adresse
- Support auto-entrepreneur
- Personnalisation automatique des documents PDF

#### 🔐 **Authentification**
- Connexion sécurisée via Supabase Auth
- Gestion de session
- Protection des routes

---

## 🛠️ Technologies

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn UI** - Composants UI modernes
- **React Router** - Navigation
- **React Query** - Gestion du cache et des requêtes
- **Recharts** - Graphiques et visualisations
- **jsPDF** - Génération de PDF
- **xlsx** - Export/Import Excel
- **date-fns** - Manipulation de dates
- **Lucide React** - Icônes

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Storage (photos)

### Outils de développement
- **ESLint** - Linter JavaScript/TypeScript
- **Prettier** - Formateur de code
- **Git** - Contrôle de version

---

## 📦 Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x ou **yarn** >= 1.22
- **Git**
- Compte **Supabase** (gratuit)

### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/gardeauarbres/jardin-chef-mobile.git
cd jardin-chef-mobile

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer les variables d'environnement (voir section Configuration)
nano .env.local

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optionnel
VITE_APP_NAME=Jardin Chef
```

### Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com/)
2. Récupérez votre URL et clé API dans `Project Settings` > `API`
3. Appliquez les migrations SQL dans l'ordre :
   - `supabase/migrations/[timestamp]_initial_schema.sql`
   - `supabase/migrations/20250114000000_add_materials_inventory.sql`
   - `supabase/migrations/20250114000001_add_site_materials.sql`
   - `supabase/migrations/20250114000002_add_company_profile.sql`

4. Activez le Storage pour les photos :
   - Créez un bucket `site-photos`
   - Configurez les politiques RLS

Consultez les fichiers de documentation dans le dossier racine :
- `INVENTORY_SETUP.md`
- `INVENTORY_INTEGRATION_SETUP.md`
- `PROFILE_SETUP.md`

---

## 🚀 Utilisation

### Première connexion

1. Créez un compte via la page `/auth`
2. Complétez votre profil d'entreprise dans **Plus** > **Profil d'entreprise**
3. Ajoutez vos premiers clients dans **Clients**
4. Créez vos premiers devis dans **Devis**

### Workflow typique

```
1. Créer un CLIENT
   ↓
2. Créer un DEVIS
   ↓
3. Convertir en CHANTIER (si accepté)
   ↓
4. Gérer les matériaux utilisés
   ↓
5. Générer une FACTURE
   ↓
6. Enregistrer le PAIEMENT
```

### Raccourcis clavier

- `Cmd/Ctrl + K` - Recherche globale
- `Alt + T` - Ouvrir les notifications

---

## 📁 Structure du projet

```
jardin-chef-mobile/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Composants UI (Shadcn)
│   │   ├── AdvancedStats.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── DataExport.tsx
│   │   ├── EmailTemplates.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── MobileNav.tsx
│   │   ├── NavigationDialog.tsx
│   │   ├── Notifications.tsx
│   │   ├── Pagination.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── ReminderSystem.tsx
│   │   ├── SiteMaterialsManager.tsx
│   │   └── ...
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.tsx
│   │   ├── useClients.ts
│   │   ├── useCompanyProfile.ts
│   │   ├── useInvoices.ts
│   │   ├── useMaterials.ts
│   │   ├── usePDFExport.ts
│   │   ├── useSiteMaterials.ts
│   │   ├── useSupabaseQuery.ts
│   │   └── ...
│   ├── lib/                 # Utilitaires et helpers
│   │   ├── dataExport.ts    # Export Excel/CSV
│   │   ├── dataImport.ts    # Import Excel/CSV
│   │   ├── emailService.ts  # Service d'emails
│   │   ├── pdfExport.ts     # Génération PDF
│   │   ├── supabase.ts      # Client Supabase
│   │   ├── utils.ts         # Fonctions utilitaires
│   │   └── validations.ts   # Schémas de validation Zod
│   ├── pages/               # Pages de l'application
│   │   ├── Auth.tsx
│   │   ├── Calendar.tsx
│   │   ├── Clients.tsx
│   │   ├── ClientForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EmailTemplatesPage.tsx
│   │   ├── Employees.tsx
│   │   ├── Inventory.tsx
│   │   ├── Invoices.tsx
│   │   ├── More.tsx
│   │   ├── NotFound.tsx
│   │   ├── Payments.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── Profile.tsx
│   │   ├── Quotes.tsx
│   │   ├── QuoteForm.tsx
│   │   ├── Reminders.tsx
│   │   ├── Sites.tsx
│   │   ├── SiteForm.tsx
│   │   └── ...
│   ├── integrations/        # Intégrations tierces
│   │   └── supabase/
│   │       └── client.ts
│   ├── App.tsx              # Composant racine
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── supabase/
│   └── migrations/          # Migrations SQL
├── public/                  # Assets statiques
├── .env.local               # Variables d'environnement (à créer)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🔧 Développement

### Scripts disponibles

```bash
# Développement
npm run dev              # Lance le serveur de développement

# Build
npm run build            # Crée un build de production
npm run preview          # Prévisualise le build

# Qualité du code
npm run lint             # Vérifie le code avec ESLint
npm run type-check       # Vérifie les types TypeScript

# Nettoyage
npm run clean            # Supprime node_modules et réinstalle
```

### Conventions de code

- **Nommage** :
  - Composants : PascalCase (`MyComponent.tsx`)
  - Hooks : camelCase avec préfixe `use` (`useMyHook.ts`)
  - Utilitaires : camelCase (`myUtil.ts`)
  - Types/Interfaces : PascalCase (`MyInterface`)

- **Structure des composants** :
  ```tsx
  // 1. Imports
  import { useState } from 'react';
  
  // 2. Types/Interfaces
  interface MyComponentProps {
    title: string;
  }
  
  // 3. Composant
  export const MyComponent = ({ title }: MyComponentProps) => {
    // 4. Hooks
    const [state, setState] = useState();
    
    // 5. Handlers
    const handleClick = () => {};
    
    // 6. Render
    return <div>{title}</div>;
  };
  ```

- **Commits** :
  - `feat: nouvelle fonctionnalité`
  - `fix: correction de bug`
  - `refactor: refactorisation`
  - `docs: documentation`
  - `style: formatage`
  - `test: tests`

---

## 🧪 Tests

### Tests unitaires (à venir)

```bash
npm run test              # Lance les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Couverture de code
```

---

## 🚢 Déploiement

### Vercel (recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Configurer les variables d'environnement dans le dashboard Vercel
```

### Netlify

```bash
# 1. Build
npm run build

# 2. Déployer le dossier dist/
netlify deploy --prod --dir=dist
```

### Docker (optionnel)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Respectez les conventions de code
- Ajoutez des tests si applicable
- Mettez à jour la documentation
- Vérifiez que le build passe (`npm run build`)

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteur

**Gard Eau Arbres**
- GitHub: [@gardeauarbres](https://github.com/gardeauarbres)

---

## 🙏 Remerciements

- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Support

Pour obtenir de l'aide :
- 📧 Email : support@jardinchef.fr
- 🐛 Issues : [GitHub Issues](https://github.com/gardeauarbres/jardin-chef-mobile/issues)
- 📖 Documentation : Consultez les fichiers `.md` dans le projet

---

## 🗺️ Roadmap

### Version 1.1 (En cours)
- [x] Export/Import Excel
- [x] Gestion des stocks
- [x] Statistiques avancées
- [x] Rappels automatiques
- [x] Templates d'emails
- [x] Profil d'entreprise
- [x] Navigation GPS

### Version 2.0 (À venir)
- [ ] Multi-utilisateurs avec rôles
- [ ] Application mobile native (React Native)
- [ ] Mode hors-ligne
- [ ] Signature électronique
- [ ] Génération automatique de devis
- [ ] Intégration comptabilité
- [ ] API REST publique

---

**Made with ❤️ for landscape professionals**
