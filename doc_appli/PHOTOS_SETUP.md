# Configuration de la Galerie Photo

## 📋 Prérequis

Pour utiliser la fonctionnalité de galerie photo, vous devez :

1. ✅ Exécuter la migration SQL pour créer la table `photos`
2. ✅ Créer un bucket Supabase Storage nommé `photos`
3. ✅ Configurer les politiques de sécurité du bucket

## 🗄️ Étape 1 : Migration SQL

Exécutez la migration suivante dans votre projet Supabase :

**Fichier** : `supabase/migrations/20250114000000_add_photos_table.sql`

1. Allez sur https://supabase.com/dashboard/project/qppuntwgpglsbdppejhw/editor
2. Cliquez sur **SQL Editor**
3. Copiez le contenu du fichier de migration
4. Collez-le dans l'éditeur et cliquez sur **Run**

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

Après avoir créé le bucket, configurez les politiques RLS :

### Politique 1 : Les utilisateurs peuvent uploader leurs propres photos

```sql
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Politique 2 : Les utilisateurs peuvent voir leurs propres photos

```sql
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Politique 3 : Les utilisateurs peuvent supprimer leurs propres photos

```sql
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Politique 4 : Les photos sont publiques en lecture (pour l'affichage)

```sql
CREATE POLICY "Photos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
```

## 📝 Comment appliquer les politiques

1. Allez sur **Storage** → **Policies** dans Supabase
2. Sélectionnez le bucket `photos`
3. Cliquez sur **New Policy**
4. Pour chaque politique :
   - Choisissez le type (INSERT, SELECT, DELETE)
   - Copiez le SQL correspondant ci-dessus
   - Cliquez sur **Review** puis **Save policy**

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

