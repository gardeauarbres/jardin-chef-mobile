# 🔒 Correctifs de Sécurité

## 🐛 Problème : Function search_path Non Fixé

### Description du Problème

Le linter Supabase a détecté que la fonction `update_legal_acceptances_updated_at()` n'avait pas de `search_path` fixé. Cela représente un risque de sécurité important.

### Pourquoi C'est Dangereux

1. **Escalade de privilèges** : Un attaquant peut modifier le `search_path` de sa session
2. **Résolution d'objets malveillants** : La fonction peut résoudre vers des tables/fonctions inattendues
3. **Comportement non déterministe** : Le comportement change selon l'environnement
4. **Injection SQL** : Possible si le `search_path` n'est pas contrôlé

### Exemple d'Attaque

```sql
-- Un attaquant crée un schéma malveillant
CREATE SCHEMA evil;
CREATE TABLE evil.legal_acceptances (...);

-- Modifie son search_path
SET search_path = evil, public;

-- La fonction trigger va maintenant travailler sur la mauvaise table !
UPDATE legal_acceptances SET ... ;
```

---

## ✅ Solution Appliquée

### Correctifs Mis en Place

1. **`SET search_path = public, pg_catalog`** : Force la résolution vers les bons schémas
2. **`SECURITY INVOKER`** : Utilise les privilèges de l'appelant (plus sûr)
3. **Documentation** : Commentaires explicites dans le code

### Code Corrigé

```sql
CREATE OR REPLACE FUNCTION public.update_legal_acceptances_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER                      -- ✅ Privilèges de l'appelant
SET search_path = public, pg_catalog  -- ✅ search_path fixé
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

---

## 🔧 Application du Correctif

### Méthode 1 : Script Dédié (Recommandé pour Prod)

Si votre base de données existe déjà :

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Exécutez** : `fix_legal_function_security.sql`

```sql
-- Le script :
-- 1. Supprime l'ancienne fonction (CASCADE pour supprimer le trigger)
-- 2. Recrée la fonction avec search_path fixé
-- 3. Recrée le trigger
-- 4. Affiche les informations de sécurité
```

3. **Vérifiez** : Le script affiche :
   ```
   ✅ Fonction update_legal_acceptances_updated_at sécurisée avec succès !
   ✅ search_path fixé à: public, pg_catalog
   ✅ SECURITY INVOKER activé
   ```

### Méthode 2 : Migration Corrigée (Pour Nouvelles Installs)

Pour les nouvelles installations, la migration a été corrigée :
- `supabase/migrations/20250116000000_add_legal_acceptances.sql` ✅ Corrigé
- `fix_legal_acceptances.sql` ✅ Corrigé

---

## 🧪 Vérification

### Vérifier que le Correctif est Appliqué

```sql
-- Vérifier les paramètres de sécurité de la fonction
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER ⚠️'
        WHEN false THEN 'SECURITY INVOKER ✅'
    END AS security_type,
    p.proconfig AS config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_legal_acceptances_updated_at';
```

**Résultat attendu** :
```
schema | function_name                            | security_type      | config_settings
-------|------------------------------------------|--------------------|---------------------------
public | update_legal_acceptances_updated_at     | SECURITY INVOKER ✅ | {"search_path=public, pg_catalog"}
```

### Test Fonctionnel

```sql
-- 1. Mettre à jour un enregistrement
UPDATE legal_acceptances 
SET privacy_policy_accepted = true 
WHERE user_id = auth.uid();

-- 2. Vérifier que updated_at a été mis à jour
SELECT 
    id,
    updated_at,
    updated_at > (NOW() - INTERVAL '10 seconds') AS recently_updated
FROM legal_acceptances 
WHERE user_id = auth.uid();
```

**Résultat attendu** : `recently_updated = true`

---

## 📚 Bonnes Pratiques de Sécurité

### Pour Toutes les Fonctions SQL

1. **Toujours fixer le search_path**
   ```sql
   SET search_path = public, pg_catalog
   ```

2. **Qualifier les noms d'objets**
   ```sql
   -- ❌ Mauvais
   SELECT * FROM users;
   
   -- ✅ Bon
   SELECT * FROM public.users;
   ```

3. **Utiliser SECURITY INVOKER par défaut**
   ```sql
   CREATE FUNCTION ... SECURITY INVOKER ...
   ```

4. **SECURITY DEFINER : Seulement si nécessaire**
   ```sql
   -- Si vous devez utiliser SECURITY DEFINER :
   CREATE FUNCTION ... 
   SECURITY DEFINER
   SET search_path = public, pg_catalog
   AS $$
   BEGIN
       -- Valider toutes les entrées !
       -- Utiliser des noms qualifiés !
   END;
   $$;
   
   -- Restreindre l'exécution
   REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC;
   GRANT EXECUTE ON FUNCTION ... TO authenticated;
   ```

### Checklist de Sécurité

Avant de créer une fonction SQL :

- [ ] `SET search_path = public, pg_catalog` défini
- [ ] Tous les noms d'objets sont qualifiés (`public.table_name`)
- [ ] `SECURITY INVOKER` utilisé (sauf besoin spécifique)
- [ ] Si `SECURITY DEFINER` : privilèges minimaux + validation des entrées
- [ ] Pas d'injection SQL possible
- [ ] Droits d'exécution restreints si nécessaire

---

## 🔍 Audit de Sécurité

### Trouver Toutes les Fonctions Non Sécurisées

```sql
-- Lister toutes les fonctions sans search_path fixé
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    CASE 
        WHEN p.proconfig IS NULL THEN '❌ PAS DE CONFIG'
        WHEN NOT 'search_path' = ANY(
            SELECT split_part(unnest(p.proconfig), '=', 1)
        ) THEN '⚠️ search_path NON DÉFINI'
        ELSE '✅ OK'
    END AS search_path_status,
    CASE p.prosecdef
        WHEN true THEN '⚠️ SECURITY DEFINER'
        WHEN false THEN '✅ SECURITY INVOKER'
    END AS security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'  -- Functions only (not procedures)
ORDER BY search_path_status DESC, function_name;
```

### Corriger les Fonctions Détectées

Pour chaque fonction avec `❌` ou `⚠️`, appliquez le même correctif :

```sql
CREATE OR REPLACE FUNCTION public.nom_fonction(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Code de la fonction
END;
$$;
```

---

## 📖 Ressources

- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/security)
- [SQL Injection via search_path](https://www.cybertec-postgresql.com/en/abusing-security-definer-functions/)

---

## ✅ Statut Actuel

| Fonction | Statut | search_path | Security Type |
|----------|--------|-------------|---------------|
| `update_legal_acceptances_updated_at` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `update_company_profile_updated_at` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `update_material_stock_on_site_usage` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `restore_material_stock_on_site_removal` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `adjust_material_stock_on_site_update` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `update_updated_at_column` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `generate_invoice_number` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `create_material_movement_for_site` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |
| `restore_material_on_delete` | ✅ **SÉCURISÉ** | `public, pg_catalog` | `SECURITY INVOKER` |

### 🎯 Résultat : **10/10 Fonctions Sécurisées** ✅

---

**🔒 Sécurité : Priorité #1 pour Jardin Chef**

*Dernière mise à jour : Novembre 2025*

