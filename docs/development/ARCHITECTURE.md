# 🏗️ Architecture de Jardin Chef

Ce document décrit l'architecture technique de l'application Jardin Chef, ses composants principaux, et les décisions de conception.

## 📐 Vue d'Ensemble

### Stack Technique

```
┌─────────────────────────────────────────────┐
│          Frontend (React + TypeScript)       │
├─────────────────────────────────────────────┤
│  • React 18 + TypeScript                    │
│  • Vite (Build Tool)                        │
│  • React Router (Routing)                   │
│  • TanStack Query (State Management)        │
│  • Tailwind CSS (Styling)                   │
│  • Shadcn UI (Component Library)            │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│         Backend (Supabase)                   │
├─────────────────────────────────────────────┤
│  • PostgreSQL (Database)                    │
│  • Row Level Security (RLS)                 │
│  • Auth (Email + Magic Link)                │
│  • Storage (Photos/Documents)               │
│  • Realtime (Optional)                      │
└─────────────────────────────────────────────┘
```

---

## 📂 Structure des Dossiers

```
jardin-chef-mobile/
├── src/
│   ├── components/           # Composants réutilisables
│   │   ├── ui/              # Composants UI de base (Shadcn)
│   │   ├── forms/           # Formulaires complexes
│   │   ├── AdvancedStats.tsx
│   │   ├── EmailTemplates.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── LazyImage.tsx
│   │   ├── MobileNav.tsx
│   │   ├── NavigationDialog.tsx
│   │   ├── Notifications.tsx
│   │   ├── ReminderSystem.tsx
│   │   └── SiteMaterialsManager.tsx
│   │
│   ├── pages/               # Pages principales (routes)
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Quotes.tsx
│   │   ├── Invoices.tsx
│   │   ├── Sites.tsx
│   │   ├── Employees.tsx
│   │   ├── Payments.tsx
│   │   ├── Calendar.tsx
│   │   ├── Inventory.tsx
│   │   ├── Reminders.tsx
│   │   ├── EmailTemplatesPage.tsx
│   │   ├── Profile.tsx
│   │   ├── More.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/               # React hooks personnalisés
│   │   ├── useSupabaseQuery.ts    # Hook générique pour Supabase
│   │   ├── useInvoices.ts         # Hooks spécifiques invoices
│   │   ├── useMaterials.ts        # Hooks inventaire
│   │   ├── useSiteMaterials.ts    # Hooks matériaux/chantiers
│   │   ├── useCompanyProfile.ts   # Hook profil entreprise
│   │   └── useGemini.ts           # Hook IA Gemini
│   │
│   ├── lib/                 # Utilitaires et services
│   │   ├── dataExport.ts    # Export Excel/CSV
│   │   ├── dataImport.ts    # Import Excel/CSV
│   │   ├── pdfExport.ts     # Export PDF
│   │   ├── emailService.ts  # Gestion emails
│   │   ├── gemini.ts        # Service IA
│   │   └── validations.ts   # Schémas Zod
│   │
│   ├── integrations/        # Intégrations externes
│   │   └── supabase/
│   │       ├── client.ts    # Client Supabase
│   │       └── types.ts     # Types générés
│   │
│   ├── App.tsx              # Composant racine + routing
│   ├── main.tsx             # Point d'entrée React
│   └── index.css            # Styles globaux
│
├── supabase/
│   └── migrations/          # Migrations SQL
│       ├── 20250114000000_add_materials_inventory.sql
│       ├── 20250114000001_add_site_materials.sql
│       └── 20250114000002_add_company_profile.sql
│
├── public/                  # Assets statiques
├── docs/                    # Documentation supplémentaire
├── README.md
├── ARCHITECTURE.md          # Ce fichier
├── CONTRIBUTING.md
├── PERFORMANCE.md
└── package.json
```

---

## 🔄 Flux de Données

### 1. Authentification

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │─────▶│  Supabase │─────▶│ Database │
│          │ Login │   Auth    │ JWT  │          │
└──────────┘      └──────────┘      └──────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ localStorage │
                  │  (session)   │
                  └──────────────┘
```

### 2. Gestion des Données (React Query)

```
┌─────────────┐
│   Component │
└──────┬──────┘
       │
       ▼
┌─────────────────┐         ┌──────────────┐
│  useSupabaseQuery│────────▶│ React Query  │
│                  │         │    Cache     │
└─────────┬────────┘         └──────────────┘
          │                         ▲
          │                         │ Cache Hit
          ▼                         │
┌─────────────────┐                 │
│ Supabase Client │─────────────────┘
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

**Avantages** :
- ✅ Cache automatique (5 min par défaut)
- ✅ Réduction des requêtes réseau
- ✅ Optimistic updates
- ✅ Background refetch
- ✅ Retry logic intelligent

### 3. Mutations

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ useSupabaseMutation │
└──────┬───────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Supabase Client │─────▶│  PostgreSQL  │
└─────────────────┘      └──────┬───────┘
       │                         │ Success
       ▼                         │
┌─────────────────┐              │
│ Query Invalidate │◀─────────────┘
│  (Cache Refresh) │
└──────────────────┘
```

---

## 🗄️ Schéma de Base de Données

### Tables Principales

```sql
-- Utilisateurs (Supabase Auth)
auth.users
  ├── id (UUID, PK)
  ├── email
  ├── created_at
  └── metadata

-- Clients
public.clients
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── first_name
  ├── last_name
  ├── email
  ├── phone
  ├── address
  └── created_at

-- Devis
public.quotes
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── client_id (UUID, FK → clients)
  ├── amount
  ├── status ('draft' | 'sent' | 'accepted' | 'rejected')
  ├── description
  └── created_at

-- Factures
public.invoices
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── client_id (UUID, FK → clients)
  ├── quote_id (UUID, FK → quotes, nullable)
  ├── amount
  ├── status ('draft' | 'sent' | 'paid' | 'overdue')
  ├── due_date
  └── created_at

-- Chantiers
public.sites
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── client_id (UUID, FK → clients)
  ├── name
  ├── status ('active' | 'completed' | 'paused')
  ├── progress (0-100)
  ├── total_amount
  ├── paid_amount
  └── created_at

-- Photos (Storage)
storage.photos
  ├── site_id (FK → sites)
  ├── path (string)
  └── uploaded_at

-- Employés
public.employees
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── first_name
  ├── last_name
  ├── hourly_rate
  └── created_at

-- Feuilles de temps
public.timesheets
  ├── id (UUID, PK)
  ├── employee_id (UUID, FK → employees)
  ├── hours_worked
  ├── work_date
  ├── status ('pending' | 'paid')
  └── created_at

-- Paiements
public.payments
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── invoice_id (UUID, FK → invoices, nullable)
  ├── amount
  ├── status ('pending' | 'paid' | 'cancelled')
  ├── method ('cash' | 'card' | 'transfer' | 'check')
  ├── paid_date
  └── created_at

-- Matériaux
public.materials
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── name
  ├── description
  ├── category
  ├── unit
  ├── quantity
  ├── min_quantity
  ├── unit_price
  ├── supplier
  └── location

-- Mouvements de stock
public.material_movements
  ├── id (UUID, PK)
  ├── material_id (UUID, FK → materials)
  ├── type ('in' | 'out' | 'adjustment')
  ├── quantity
  ├── reason
  ├── site_id (UUID, FK → sites, nullable)
  └── created_at

-- Matériaux par chantier
public.site_materials
  ├── id (UUID, PK)
  ├── site_id (UUID, FK → sites)
  ├── material_id (UUID, FK → materials)
  ├── quantity
  ├── used_date
  └── notes

-- Profil entreprise
public.company_profile
  ├── id (UUID, PK)
  ├── user_id (UUID, FK → auth.users)
  ├── company_name
  ├── siret
  ├── tva_number
  ├── address
  ├── email
  ├── phone
  ├── is_auto_entrepreneur
  ├── first_name
  └── last_name
```

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS pour garantir que :
- ✅ Les utilisateurs ne voient que leurs propres données
- ✅ Pas d'accès cross-user
- ✅ Sécurité au niveau de la base de données

**Exemple de politique RLS** :
```sql
CREATE POLICY "Users can only access their own clients"
  ON public.clients
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🎨 Architecture des Composants

### Hiérarchie

```
App (Router + QueryClient)
├── Auth (Login/Signup)
└── Protected Routes
    ├── MobileNav (Navigation)
    ├── GlobalSearch (Search Bar)
    ├── Notifications (Bell Icon)
    └── Pages
        ├── Dashboard
        │   ├── AdvancedStats
        │   ├── ReminderSystem
        │   └── Documents à envoyer
        ├── Clients
        │   ├── ClientForm
        │   └── NavigationDialog
        ├── Quotes → QuoteForm
        ├── Invoices → InvoiceForm
        ├── Sites
        │   ├── SiteForm
        │   ├── SiteMaterialsManager
        │   ├── PhotoGallery
        │   └── NavigationDialog
        ├── Employees → TimesheetForm
        ├── Payments → PaymentForm
        ├── Calendar (FullCalendar)
        ├── Inventory
        ├── Reminders
        ├── EmailTemplatesPage
        ├── Profile
        └── More (Menu)
```

### Patterns de Composants

#### 1. Container/Presentational Pattern

**Container** (Smart Component) :
- Gère la logique métier
- Fetch les données
- Gère les états

**Presentational** (Dumb Component) :
- Affichage uniquement
- Props pures
- Pas de logique métier

**Exemple** :
```typescript
// Container
const ClientsPage = () => {
  const { data: clients, isLoading } = useClients();
  const { mutate: deleteClient } = useDeleteClient();
  
  return <ClientList clients={clients} onDelete={deleteClient} />;
};

// Presentational
const ClientList = ({ clients, onDelete }) => (
  <div>
    {clients.map(client => (
      <ClientCard key={client.id} client={client} onDelete={onDelete} />
    ))}
  </div>
);
```

#### 2. Custom Hooks Pattern

**Pourquoi** : Réutilisabilité, séparation des préoccupations

**Exemple** :
```typescript
// hooks/useClients.ts
export const useClients = () => {
  return useSupabaseQuery<Client>('clients');
};

export const useCreateClient = () => {
  return useSupabaseMutation<Client>('clients', 'insert');
};
```

#### 3. Compound Components Pattern

**Pourquoi** : API déclarative, flexibilité

**Exemple** :
```typescript
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>
```

---

## 🔐 Sécurité

### 1. Authentification

- **Méthode** : Supabase Auth (Email + Password)
- **Session** : JWT stocké dans localStorage
- **Expiration** : Refresh automatique
- **Protection routes** : HOC `ProtectedRoute`

### 2. Row Level Security (RLS)

Toutes les opérations CRUD sont sécurisées au niveau base de données :

```sql
-- Exemple : Clients
CREATE POLICY "Users can CRUD their own clients"
  ON clients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Validation des Données

**Côté Frontend** : Zod schemas
```typescript
const clientSchema = z.object({
  first_name: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^[0-9]{10}$/, "10 chiffres requis"),
});
```

**Côté Backend** : Constraints SQL + RLS

### 4. Protection CSRF

- ✅ Supabase gère automatiquement
- ✅ Headers sécurisés
- ✅ Same-origin policy

---

## ⚡ Performance

### 1. Code Splitting

- Routes lazy-loadées avec `React.lazy()`
- Vendors séparés (react, ui, form, query, supabase)
- Réduction du bundle initial de ~45%

### 2. React Query Caching

```typescript
{
  staleTime: 5 * 60 * 1000,  // 5 min de cache
  gcTime: 10 * 60 * 1000,     // 10 min avant garbage collection
  refetchOnWindowFocus: false,
  retry: 1,
}
```

### 3. Image Optimization

- Lazy loading avec Intersection Observer
- Skeleton loaders
- Fallback images
- Compression avant upload

### 4. Build Optimization

```typescript
// vite.config.ts
{
  minify: 'esbuild',       // Minification rapide
  target: 'es2020',        // Bundle moderne
  cssCodeSplit: true,      // CSS par chunk
  assetsInlineLimit: 4096, // Inline petits assets
}
```

**Résultats** :
- 📦 Bundle réduit de 15%
- ⚡ FCP < 1.5s
- 🎯 LCP < 2.0s
- ✅ Lighthouse score > 90

---

## 🧪 Tests (À implémenter)

### Structure Recommandée

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useClients.ts
│   └── useClients.test.ts
└── lib/
    ├── dataExport.ts
    └── dataExport.test.ts
```

### Stack de Test Suggérée

- **Unit** : Vitest
- **Integration** : React Testing Library
- **E2E** : Playwright
- **Coverage** : c8

---

## 📦 Déploiement

### Frontend (Vercel)

```bash
npm run build
# → dist/ (déployé sur Vercel)
```

### Backend (Supabase)

- **Database** : PostgreSQL hébergé
- **Auth** : Géré par Supabase
- **Storage** : Supabase Storage

**Voir** : `DEPLOYMENT.md` pour plus de détails

---

## 🔄 CI/CD (Optionnel)

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/actions@v1
```

---

## 🎯 Décisions d'Architecture

### Pourquoi React Query ?

- ✅ Cache intelligent
- ✅ Moins de code boilerplate
- ✅ Optimistic updates
- ✅ Background refetch
- ✅ DevTools puissants

### Pourquoi Supabase ?

- ✅ PostgreSQL complet
- ✅ Auth clé en main
- ✅ Storage intégré
- ✅ Realtime (optionnel)
- ✅ Row Level Security
- ✅ Migrations SQL

### Pourquoi Vite ?

- ✅ HMR ultra-rapide
- ✅ Build optimisé (esbuild)
- ✅ Support TypeScript natif
- ✅ Plugin ecosystem
- ✅ Config minimale

### Pourquoi Tailwind + Shadcn ?

- ✅ Utility-first CSS
- ✅ Composants accessibles
- ✅ Customisable
- ✅ Dark mode natif
- ✅ Pas de CSS-in-JS runtime

---

## 📚 Ressources

- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0

