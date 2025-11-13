# Configuration de la Galerie Photo

## 📋 Prérequis

Pour utiliser la fonctionnalité de galerie photo, vous devez :

1. ✅ Exécuter la migration SQL pour créer la table `photos`
2. ✅ Créer un bucket Supabase Storage nommé `photos`
3. ✅ Configurer les politiques de sécurité du bucket

## 🗄️ Étape 1 : Migration SQL

Exécutez les migrations suivantes dans votre projet Supabase **dans l'ordre** :

### Migration 1 : Table photos
**Fichier** : `supabase/migrations/20250114000000_add_photos_table.sql`

1. Allez sur https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/editor
2. Cliquez sur **SQL Editor**
3. Copiez le contenu du fichier de migration
4. Collez-le dans l'éditeur et cliquez sur **Run**

### Migration 2 : Politiques Storage (IMPORTANT - après avoir créé le bucket)
**Fichier** : `supabase/migrations/20250114000001_setup_photos_storage.sql`

⚠️ **Exécutez cette migration APRÈS avoir créé le bucket Storage** (étape 2)

## 📦 Étape 2 : Créer le Bucket Storage

1. Allez sur **Storage** dans le menu de gauche de Supabase
2. Cliquez sur **New bucket**
3. Configurez le bucket :
   - **Name** : `photos`
   - **Public bucket** : ✅ Activé (pour que les photos soient accessibles publiquement)
   - **File size limit** : `10 MB` (ou plus selon vos besoins)
   - **Allowed MIME types** : `image/*` (pour accepter tous les formats d'image)

4. Cliquez sur **Create bucket**

## 🔒 Étape 3 : Configurer les Politiques de Sécurité

**IMPORTANT** : Exécutez la migration `20250114000001_setup_photos_storage.sql` qui configure automatiquement toutes les politiques nécessaires.

Cette migration configure :
- ✅ Les politiques RLS pour la table `photos`
- ✅ Les politiques Storage pour le bucket `photos`
- ✅ Les index pour optimiser les requêtes

**Alternative manuelle** : Si vous préférez configurer manuellement, allez sur **Storage** → **Policies** dans Supabase et créez les politiques une par une (voir le fichier de migration pour le SQL exact).

## ✅ Vérification

Après avoir configuré tout cela :

1. ✅ La table `photos` existe dans **Table Editor**
2. ✅ Le bucket `photos` existe dans **Storage**
3. ✅ Les politiques sont configurées dans **Storage** → **Policies**

## 🎯 Utilisation

Une fois configuré, vous pouvez :

1. **Ajouter des photos** : Dans le formulaire d'édition d'un chantier, cliquez sur "Ajouter une photo"
2. **Voir les photos** : Les photos s'affichent automatiquement dans la galerie
3. **Comparaison avant/après** : Si vous avez des photos "avant" et "après", un slider de comparaison apparaît automatiquement
4. **Supprimer des photos** : Survolez une photo et cliquez sur l'icône de suppression

## 🔧 Dépannage

### Erreur : "Bucket not found"
- Vérifiez que le bucket `photos` existe dans Supabase Storage
- Vérifiez que le nom est exactement `photos` (minuscules)

### Erreur : "Permission denied"
- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez que vous êtes connecté en tant qu'utilisateur authentifié

### Les photos ne s'affichent pas
- Vérifiez que la politique "Photos are publicly readable" est activée
- Vérifiez que l'URL de la photo est correcte dans la console du navigateur

## 📸 Formats supportés

- JPEG / JPG
- PNG
- WebP
- GIF

Les images sont automatiquement compressées si elles dépassent 2MB.

