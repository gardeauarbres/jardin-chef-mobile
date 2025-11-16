# 📦 Scripts SQL Archivés

Ce dossier contient les **scripts SQL de correction** qui ont déjà été appliqués en production.

---

## ⚠️ ATTENTION

Ces scripts ont **déjà été exécutés** sur la base de données Supabase.

**NE PAS RE-EXÉCUTER** sauf si vous êtes certain de ce que vous faites !

---

## 📋 Contenu

### Scripts de Sécurité (Appliqués)

| Fichier | Description | Date d'application |
|---------|-------------|-------------------|
| `fix_all_functions_security.sql` | Version 1 du correctif de sécurité | Nov 2025 (remplacé par v2) |
| `fix_all_functions_security_v2.sql` | Version 2 finale - 8 fonctions sécurisées | ✅ Nov 2025 |
| `fix_legal_function_security.sql` | Correctif fonction legal_acceptances | ✅ Nov 2025 |
| `fix_company_profile.sql` | Création table company_profile | ✅ Nov 2025 |
| `fix_material_movements.sql` | Ajout user_id à material_movements | ✅ Nov 2025 |
| `fix_legal_acceptances.sql` | Création table legal_acceptances | ✅ Nov 2025 |
| `MIGRATION_SQL_COMPLETE.sql` | Migration complète (archive) | Nov 2025 |

---

## ✅ État de la Base de Données

Toutes les corrections de sécurité sont appliquées :
- ✅ 10/10 fonctions sécurisées
- ✅ search_path fixé partout
- ✅ SECURITY INVOKER activé
- ✅ Score de sécurité : 100/100

---

## 📚 Documentation

Pour la documentation complète :
- **Guide de sécurité** : `docs/development/SECURITY_FIXES.md`
- **Rapport d'audit** : `docs/development/SECURITY_AUDIT_RESULTS.md`

---

## 🗑️ Supprimer ce dossier ?

Vous pouvez supprimer ce dossier en toute sécurité si :
- ✅ Tous les scripts ont été appliqués
- ✅ Vous n'avez plus besoin de référence historique
- ✅ La documentation principale suffit

**Recommandation** : Garder pour référence historique (poids négligeable).

---

*Archivé le : Novembre 2025*

