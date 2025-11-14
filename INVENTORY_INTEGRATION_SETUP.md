# 🔗 Intégration Stocks - Chantiers

## Migration SQL Complémentaire

Pour activer l'intégration automatique entre les stocks et les chantiers, vous devez appliquer une seconde migration SQL.

### Étape 1 : Accéder au Dashboard Supabase

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** dans le menu de gauche

### Étape 2 : Exécuter la migration

1. **D'abord**, appliquez la migration des stocks si ce n'est pas déjà fait :
   - Fichier : `supabase/migrations/20250114000000_add_materials_inventory.sql`

2. **Ensuite**, appliquez la migration d'intégration :
   - Fichier : `supabase/migrations/20250114000001_add_site_materials.sql`

> ⚠️ **Important** : Les deux migrations doivent être appliquées dans l'ordre !

### Étape 3 : Vérifier l'installation

Dans **Table Editor**, vérifiez que la nouvelle table a été créée :
- ✅ `site_materials` - Liaison matériaux-chantiers

Dans **Database** → **Functions**, vérifiez les fonctions automatiques :
- ✅ `create_material_movement_for_site()` - Déduit automatiquement le stock
- ✅ `restore_material_on_delete()` - Restaure le stock si on retire un matériau

## Fonctionnement Automatique

Une fois la migration appliquée, le système gère **automatiquement** les stocks :

### ✨ Ajout d'un matériau à un chantier

Quand vous ajoutez un matériau à un chantier :

1. 🔍 **Vérification** du stock disponible
2. ➖ **Déduction automatique** de la quantité du stock général
3. 📝 **Création automatique** d'un mouvement de sortie dans l'historique
4. 🔗 **Association** au chantier dans la table `site_materials`

**Exemple** :
- Stock initial de "Terreau" : 50 sacs
- Ajout de 10 sacs au chantier "Jardin Dupont"
- ✅ Stock restant : 40 sacs
- ✅ Mouvement créé : "Sortie - 10 sacs - Utilisation sur chantier"
- ✅ Coût calculé automatiquement

### 🔄 Retrait d'un matériau d'un chantier

Si vous retirez un matériau d'un chantier (erreur, changement de plan) :

1. ➕ **Restauration automatique** du stock
2. 🗑️ **Suppression** du mouvement correspondant
3. 🔗 **Suppression** de la liaison chantier-matériau

**Exemple** :
- Retrait des 10 sacs du chantier "Jardin Dupont"
- ✅ Stock restauré : 50 sacs
- ✅ Mouvement supprimé de l'historique

### 📊 Calculs Automatiques

Pour chaque chantier, le système calcule automatiquement :
- **Coût total des matériaux** utilisés
- **Liste détaillée** des matériaux avec quantités et dates
- **Traçabilité complète** via l'historique des mouvements

## Utilisation dans l'Application

### Dans la page Chantier

1. **Créez ou éditez un chantier**
2. Descendez jusqu'à la section **"Matériaux utilisés"**
3. Cliquez sur **"Ajouter"**
4. Sélectionnez le matériau et la quantité
5. Le stock est déduit automatiquement ! ✨

### Alertes Intelligentes

Le système vous avertit si :
- ⚠️ Le stock est faible (proche du minimum)
- 🚫 La quantité demandée dépasse le stock disponible
- 💰 Affiche le coût estimé en temps réel

### Visualisation

Sur chaque chantier, vous voyez :
- Liste des matériaux utilisés avec quantités
- Coût unitaire et total par matériau
- Date d'utilisation
- Notes optionnelles
- **Coût total des matériaux du chantier**

## Gestion des Stocks

### Dans la page Inventaire (`/inventory`)

Vous pouvez voir :
- ✅ Tous vos matériaux en stock
- 📊 Statistiques générales
- 📈 Historique complet des mouvements
- 🔍 Filtrage par catégorie
- 🔔 Alertes de stock faible

### Historique des Mouvements

Pour chaque matériau, l'historique affiche :
- **Entrées** (achats, réapprovisionnements)
- **Sorties** (utilisations sur chantiers) avec le nom du chantier
- **Ajustements** (corrections d'inventaire)

## Structure des Données

### Table `site_materials`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | Propriétaire |
| site_id | UUID | Référence au chantier |
| material_id | UUID | Référence au matériau |
| quantity | NUMERIC | Quantité utilisée |
| date_used | DATE | Date d'utilisation |
| notes | TEXT | Notes optionnelles |
| created_at | TIMESTAMP | Date d'enregistrement |

### Flux de Données Automatique

```
┌─────────────────────────────────────────────────────────┐
│ AJOUT MATERIAU AU CHANTIER                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User ajoute 10 sacs de terreau au chantier        │
│     ↓                                                   │
│  2. INSERT dans site_materials                         │
│     ↓                                                   │
│  3. TRIGGER: create_material_movement_for_site()       │
│     │                                                   │
│     ├─→ INSERT dans material_movements (type: 'out')  │
│     │                                                   │
│     └─→ UPDATE materials SET quantity = quantity - 10  │
│                                                         │
│  ✅ Stock mis à jour automatiquement !                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RETRAIT MATERIAU DU CHANTIER                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User retire les 10 sacs du chantier               │
│     ↓                                                   │
│  2. DELETE dans site_materials                         │
│     ↓                                                   │
│  3. TRIGGER: restore_material_on_delete()              │
│     │                                                   │
│     ├─→ UPDATE materials SET quantity = quantity + 10  │
│     │                                                   │
│     └─→ DELETE le mouvement correspondant              │
│                                                         │
│  ✅ Stock restauré automatiquement !                   │
└─────────────────────────────────────────────────────────┘
```

## Exemples d'Utilisation

### Scénario 1 : Nouveau Chantier

1. Créez un chantier "Jardin Martin"
2. Ajoutez les matériaux :
   - 15 sacs de terreau (15€/sac)
   - 20 plants de lavande (8€/plant)
   - 5L d'engrais (12€/L)
3. ✅ Stock automatiquement déduit
4. ✅ Coût total matériaux : 445€
5. ✅ Historique complet dans l'inventaire

### Scénario 2 : Correction d'Erreur

1. Vous avez ajouté 20 sacs par erreur (au lieu de 10)
2. Retirez le matériau du chantier
3. ✅ Les 20 sacs sont restaurés dans le stock
4. Ajoutez à nouveau avec la bonne quantité (10 sacs)
5. ✅ Historique propre et cohérent

### Scénario 3 : Suivi des Coûts

1. En fin de chantier, consultez la section "Matériaux utilisés"
2. Voyez le coût total des matériaux : 445€
3. Comparez avec le montant total du chantier : 1500€
4. ✅ Marge brute : 1500€ - 445€ = 1055€

## Protection des Données

Le système inclut des protections automatiques :

### Vérifications avant ajout :
- ✅ Stock suffisant
- ✅ Matériau existe
- ✅ Quantité positive
- ✅ Utilisateur authentifié

### Rollback automatique :
- Si l'ajout échoue, aucune donnée n'est modifiée
- Les transactions SQL garantissent la cohérence

### Row Level Security (RLS) :
- Chaque utilisateur ne voit que ses propres données
- Impossible d'accéder aux matériaux d'autres utilisateurs

## Dépannage

### "Stock insuffisant" lors de l'ajout

**Cause** : La quantité demandée dépasse le stock disponible

**Solution** :
1. Vérifiez le stock actuel dans l'inventaire
2. Réapprovisionnez si nécessaire
3. Ou ajustez la quantité demandée

### Le stock ne se met pas à jour

**Vérification** :
1. Assurez-vous que les deux migrations sont appliquées
2. Dans SQL Editor, testez :
   ```sql
   SELECT * FROM site_materials LIMIT 1;
   ```
3. Vérifiez que les triggers existent :
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE event_object_table = 'site_materials';
   ```

### Réinitialisation complète

Si vous rencontrez des problèmes, vous pouvez réinitialiser :

```sql
-- Supprimer toutes les liaisons
DELETE FROM site_materials;

-- Optionnel : réinitialiser les stocks
UPDATE materials SET quantity = 0;
DELETE FROM material_movements;
```

## Support

Pour toute question ou problème :
1. Vérifiez que les deux migrations sont bien appliquées
2. Consultez les logs dans Supabase Dashboard → Logs
3. Testez avec un matériau et un chantier de test

---

**Note** : Cette intégration automatique vous fait gagner un temps considérable et élimine les erreurs de saisie manuelle ! 🚀

