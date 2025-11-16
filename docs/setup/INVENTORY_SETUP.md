# 📦 Configuration de la Gestion des Stocks

## Migration de la base de données

Pour activer la fonctionnalité de gestion des stocks, vous devez appliquer la migration SQL à votre base de données Supabase.

### Étape 1 : Accéder au Dashboard Supabase

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** dans le menu de gauche

### Étape 2 : Exécuter la migration

1. Cliquez sur **+ New query**
2. Copiez et collez le contenu du fichier `supabase/migrations/20250114000000_add_materials_inventory.sql`
3. Cliquez sur **Run** pour exécuter la migration

### Étape 3 : Vérifier l'installation

Vous pouvez vérifier que les tables ont été créées correctement en allant dans **Table Editor** et en cherchant les tables suivantes :

- ✅ `materials` - Table des matériaux
- ✅ `material_movements` - Historique des mouvements de stock

## Fonctionnalités disponibles

Une fois la migration appliquée, vous aurez accès à :

### 📊 Gestion des matériaux
- Créer, modifier et supprimer des matériaux
- Catégories : Plantes, Outils, Produits, Équipements, Autres
- Suivi des quantités en stock
- Alertes de stock faible
- Prix unitaire et valorisation du stock
- Fournisseurs et emplacements

### 📈 Mouvements de stock
- **Entrées** : Achats, réapprovisionnements
- **Sorties** : Utilisation sur chantiers
- **Ajustements** : Corrections d'inventaire
- Historique complet avec dates et raisons
- Association possible avec les chantiers

### 📋 Statistiques
- Nombre total d'articles
- Articles en stock faible
- Valeur totale du stock
- Filtrage par catégorie
- Recherche par nom ou description

## Accès à la fonctionnalité

Une fois la migration appliquée, vous pouvez accéder à la gestion des stocks via :

1. **Dashboard** : Carte "Gestion des stocks" → Bouton "Accéder aux stocks"
2. **URL directe** : `/inventory`

## Exemple d'utilisation

### Ajouter un matériau

1. Cliquez sur "Nouveau matériau"
2. Renseignez :
   - Nom (ex: "Terreau universel")
   - Catégorie (ex: "Produit")
   - Quantité initiale (ex: 50)
   - Unité (ex: "sac")
   - Quantité minimum pour alerte (ex: 10)
   - Prix unitaire (ex: 15.00€)
3. Cliquez sur "Créer"

### Enregistrer un mouvement

1. Sur la carte du matériau, cliquez sur "Mouvement"
2. Choisissez le type :
   - **Entrée** : Achat de 20 sacs
   - **Sortie** : Utilisation de 5 sacs sur un chantier
   - **Ajustement** : Correction après inventaire
3. Renseignez la quantité et la raison
4. Pour une sortie, vous pouvez associer un chantier
5. Cliquez sur "Enregistrer"

### Consulter l'historique

1. Cliquez sur l'icône "Historique" (horloge) sur la carte du matériau
2. Visualisez tous les mouvements avec :
   - Type et quantité
   - Date et heure
   - Raison du mouvement
   - Chantier associé (si applicable)

## Structure des données

### Table `materials`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | Propriétaire |
| name | TEXT | Nom du matériau |
| description | TEXT | Description (optionnel) |
| category | TEXT | plant, tool, product, equipment, other |
| quantity | NUMERIC | Quantité en stock |
| unit | TEXT | Unité de mesure |
| min_quantity | NUMERIC | Seuil d'alerte |
| unit_price | NUMERIC | Prix unitaire |
| supplier | TEXT | Fournisseur (optionnel) |
| location | TEXT | Emplacement (optionnel) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

### Table `material_movements`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | Propriétaire |
| material_id | UUID | Référence au matériau |
| type | TEXT | in, out, adjustment |
| quantity | NUMERIC | Quantité du mouvement |
| reason | TEXT | Raison/notes (optionnel) |
| site_id | UUID | Chantier associé (optionnel) |
| created_at | TIMESTAMP | Date du mouvement |

## Support

Si vous rencontrez des problèmes lors de l'application de la migration, vérifiez :

1. Que vous avez les droits d'administrateur sur le projet Supabase
2. Que la migration n'a pas déjà été appliquée
3. Les logs d'erreur dans le SQL Editor

En cas d'erreur, vous pouvez supprimer les tables et réexécuter la migration :

```sql
DROP TABLE IF EXISTS public.material_movements CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
```

Puis réexécutez la migration complète.

