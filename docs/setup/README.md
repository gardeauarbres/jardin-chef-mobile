# 🔧 Setup & Configuration

Ce dossier contient tous les guides et scripts nécessaires pour configurer l'application Jardin Chef.

---

## 📋 Guides Disponibles

### **[QUICK_SETUP.md](QUICK_SETUP.md)** ⚡
**Guide de démarrage rapide** pour configurer la base de données Supabase.

**Contenu** :
- ✅ SQL inline complet (toutes les migrations)
- ✅ Instructions pas-à-pas
- ✅ Résolution des erreurs courantes

**Utiliser ce guide si** :
- 🆕 Première installation
- 🔄 Reset de la base de données
- 🐛 Table manquante

---

### **[INVENTORY_SETUP.md](INVENTORY_SETUP.md)** 📦
**Guide de configuration** pour la gestion des stocks (inventaire).

**Contenu** :
- ✅ Tables `materials` et `material_movements`
- ✅ Policies RLS
- ✅ Intégration frontend

**Utiliser ce guide si** :
- 📦 Setup de la fonctionnalité stocks
- 🔧 Personnalisation de l'inventaire

---

### **[INVENTORY_INTEGRATION_SETUP.md](INVENTORY_INTEGRATION_SETUP.md)** 🔗
**Guide d'intégration** entre les stocks et les chantiers.

**Contenu** :
- ✅ Table `site_materials`
- ✅ Triggers automatiques
- ✅ Déduction automatique des stocks

**Utiliser ce guide si** :
- 🔗 Intégration stocks ↔ chantiers
- 🤖 Automatisation des mouvements

---

## 🗄️ Scripts SQL

### **[setup_database.sql](setup_database.sql)** 📄
**Script complet** de création de toutes les tables.

**Contenu** :
- Materials + Material Movements
- Site Materials + Triggers
- Company Profile
- Legal Acceptances
- Toutes les RLS policies

**⚠️ Attention** : Peut générer des erreurs si les tables existent déjà.

---

### **[setup_database_clean.sql](setup_database_clean.sql)** ✨
**Script nettoyé** avec gestion des duplications.

**Contenu** :
- Mêmes tables que `setup_database.sql`
- ✅ `DROP POLICY IF EXISTS` pour éviter les erreurs
- ✅ Vérifications d'existence

**👍 Recommandé** : Utiliser celui-ci pour éviter les erreurs de duplication.

---

## 🚀 Démarrage Rapide

### Étape 1 : Choisir votre méthode

**Option A : Via le Dashboard Supabase** (Recommandé)
1. Allez sur [supabase.com](https://supabase.com)
2. SQL Editor → New query
3. Copiez le contenu de `QUICK_SETUP.md` (SQL inline)
4. Run

**Option B : Script SQL séparé**
1. Téléchargez `setup_database_clean.sql`
2. SQL Editor → New query
3. Copiez-collez le contenu
4. Run

---

## 🛠️ Résolution de Problèmes

### Erreur : "Table already exists"
**Solution** : Utilisez `setup_database_clean.sql` au lieu de `setup_database.sql`

### Erreur : "Could not find the table"
**Solution** : La table n'existe pas, suivez [QUICK_SETUP.md](QUICK_SETUP.md)

### Erreur : "Policy already exists"
**Solution** :
1. Supprimez manuellement la policy dans Supabase
2. OU utilisez `setup_database_clean.sql`

---

## 📚 Documentation Complète

Pour plus d'informations :
- **[Index Documentation](../INDEX.md)** - Vue d'ensemble
- **[Architecture](../development/ARCHITECTURE.md)** - Structure de l'app
- **[Déploiement](../deployment/DEPLOYMENT.md)** - Guide production

---

## 📞 Support

Besoin d'aide ?
- **Email** : chantiers@gardeauarbres.fr
- **FAQ** : `/faq` dans l'application
- **Assistant IA** : Bouton ✨ Sparkles

---

*Dernière mise à jour : Novembre 2025*

