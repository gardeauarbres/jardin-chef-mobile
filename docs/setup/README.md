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

### **Scripts SQL Sécurisés** 🔒

Les scripts SQL de configuration ont été **retirés de GitHub** pour des raisons de sécurité.

**Pour obtenir les scripts** :
- ✅ Utilisez le SQL inline dans **[QUICK_SETUP.md](QUICK_SETUP.md)**
- ✅ Ou contactez : **chantiers@gardeauarbres.fr**

**Scripts disponibles localement** (si vous avez cloné le projet) :
- `setup_database.sql` - Script complet
- `setup_database_clean.sql` - Script recommandé (avec gestion duplications)

---

## 🚀 Démarrage Rapide

### Étape 1 : Choisir votre méthode

**Méthode : Via le Dashboard Supabase** (Recommandé)
1. Allez sur [supabase.com](https://supabase.com)
2. SQL Editor → New query
3. Copiez le contenu SQL de `QUICK_SETUP.md`
4. Collez dans l'éditeur SQL
5. Cliquez sur "Run"

**Note** : Les scripts SQL séparés ont été retirés de GitHub pour la sécurité. Utilisez le SQL inline dans QUICK_SETUP.md.

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

