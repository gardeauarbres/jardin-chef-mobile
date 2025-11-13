# Guide des Migrations SQL Supabase

## ⚠️ IMPORTANT : Exécuter les migrations

Les erreurs 404 pour les tables `sites` et `payments` indiquent que ces tables n'existent pas encore dans votre base de données Supabase.

## 📋 Migrations à exécuter

Vous devez exécuter les migrations SQL suivantes dans l'ordre dans votre projet Supabase :

### 1. Migration initiale (si pas déjà fait)
**Fichier** : `supabase/migrations/20251112102256_19ad6ba6-236e-4462-bffb-9f6e8aeaf4ec.sql`

Cette migration crée les tables de base :
- `profiles`
- `clients`
- `quotes`

### 2. Migration complète (RECOMMANDÉE)
**Fichier** : `supabase/migrations/20250113000001_complete_schema.sql`

Cette migration crée **toutes** les tables nécessaires :
- `sites`
- `payments`
- `employees`
- `timesheets`

Et configure toutes les politiques RLS (Row Level Security).

## 🚀 Comment exécuter les migrations

### Option 1 : Via l'interface Supabase (Recommandé)

1. Allez sur votre projet Supabase : https://qppuntwgpglsbdppejhw.supabase.co
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Ouvrez le fichier `supabase/migrations/20250113000001_complete_schema.sql`
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** (ou Ctrl+Enter)

### Option 2 : Via Supabase CLI

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref qppuntwgpglsbdppejhw

# Appliquer les migrations
supabase db push
```

## ✅ Vérification

Après avoir exécuté les migrations, vérifiez que les tables existent :

1. Allez dans **Table Editor** dans Supabase
2. Vous devriez voir les tables suivantes :
   - ✅ `profiles`
   - ✅ `clients`
   - ✅ `quotes`
   - ✅ `sites`
   - ✅ `payments`
   - ✅ `employees`
   - ✅ `timesheets`

## 🔧 En cas d'erreur

Si vous obtenez une erreur lors de l'exécution des migrations :

1. Vérifiez que les tables `clients` et `quotes` existent déjà
2. Si elles existent, la migration `20250113000001_complete_schema.sql` utilisera `IF NOT EXISTS` pour éviter les erreurs
3. Si vous avez des erreurs de contraintes, vous pouvez les ignorer (elles sont déjà créées)

## 📝 Note

L'application fonctionnera même si certaines tables n'existent pas encore (elles retourneront des tableaux vides), mais pour utiliser toutes les fonctionnalités, vous devez exécuter toutes les migrations.

