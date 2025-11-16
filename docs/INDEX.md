# 📚 Documentation Jardin Chef

Bienvenue dans la documentation complète de Jardin Chef !

---

## 🚀 Démarrage Rapide

Pour commencer avec Jardin Chef, consultez :
- [README principal](../README.md) - Vue d'ensemble du projet
- [Guide de déploiement](../DEPLOY.md) - Déployer l'application

---

## 📖 Table des Matières

### 🔧 Setup & Installation

Guides d'installation et de configuration initiale :

- **[Quick Setup](setup/QUICK_SETUP.md)** - Configuration rapide de la base de données
- **[Inventory Setup](setup/INVENTORY_SETUP.md)** - Configuration de la gestion des stocks
- **[Inventory Integration](setup/INVENTORY_INTEGRATION_SETUP.md)** - Intégration stocks/chantiers

### ✨ Fonctionnalités

Documentation des fonctionnalités spécifiques :

- **[Legal System](features/LEGAL_SYSTEM_SETUP.md)** - Système légal gamifié (RGPD, CGU, mentions légales)
- **[Email Setup](features/EMAIL_SETUP_GUIDE.md)** - Configuration des emails (Resend, SendGrid)
- **[Profile Setup](features/PROFILE_SETUP.md)** - Profil d'entreprise

### 👨‍💻 Développement

Guides pour les développeurs :

- **[Architecture](development/ARCHITECTURE.md)** - Architecture de l'application
- **[Performance](development/PERFORMANCE.md)** - Optimisations et performances
- **[Contributing](development/CONTRIBUTING.md)** - Guide de contribution

### 🚀 Déploiement

Guides de déploiement et production :

- **[Deployment Guide](deployment/DEPLOYMENT.md)** - Déploiement complet (Vercel + Supabase)

---

## 📂 Structure de la Documentation

```
docs/
├── INDEX.md                          # Ce fichier
├── setup/                            # Guides d'installation
│   ├── QUICK_SETUP.md
│   ├── INVENTORY_SETUP.md
│   └── INVENTORY_INTEGRATION_SETUP.md
├── features/                         # Fonctionnalités
│   ├── LEGAL_SYSTEM_SETUP.md
│   ├── EMAIL_SETUP_GUIDE.md
│   └── PROFILE_SETUP.md
├── development/                      # Développement
│   ├── ARCHITECTURE.md
│   ├── PERFORMANCE.md
│   └── CONTRIBUTING.md
└── deployment/                       # Déploiement
    └── DEPLOYMENT.md
```

---

## 🔍 Guide par Besoin

### "Je veux installer l'application"
1. [README](../README.md) - Installation de base
2. [Quick Setup](setup/QUICK_SETUP.md) - Configuration base de données
3. [Deployment Guide](deployment/DEPLOYMENT.md) - Déploiement production

### "Je veux configurer une fonctionnalité"
- **Emails** → [Email Setup](features/EMAIL_SETUP_GUIDE.md)
- **Documents légaux** → [Legal System](features/LEGAL_SYSTEM_SETUP.md)
- **Profil entreprise** → [Profile Setup](features/PROFILE_SETUP.md)
- **Gestion stocks** → [Inventory Setup](setup/INVENTORY_SETUP.md)

### "Je veux contribuer au projet"
1. [Contributing](development/CONTRIBUTING.md) - Guide de contribution
2. [Architecture](development/ARCHITECTURE.md) - Comprendre l'architecture
3. [Performance](development/PERFORMANCE.md) - Bonnes pratiques

### "Je veux déployer en production"
1. [Deployment Guide](deployment/DEPLOYMENT.md) - Guide complet
2. [Email Setup](features/EMAIL_SETUP_GUIDE.md) - Configuration emails
3. [Legal System](features/LEGAL_SYSTEM_SETUP.md) - Documents légaux

---

## 🆘 Support

### Besoin d'aide ?

- **FAQ** : Consultez la [FAQ intégrée](../src/pages/FAQPage.tsx) dans l'application
- **Assistant IA** : Utilisez le bouton ✨ Sparkles dans l'app
- **Email** : alain@gardeauarbres.fr
- **Issues GitHub** : [Ouvrir une issue](https://github.com/gardeauarbres/jardin-chef-mobile/issues)

---

## 📝 Notes Importantes

### ⚠️ Avant Production

- [ ] Configurer les emails (Resend/SendGrid)
- [ ] Activer la confirmation email dans Supabase
- [ ] Personnaliser les mentions légales
- [ ] Appliquer toutes les migrations SQL
- [ ] Tester tous les flux utilisateur
- [ ] Configurer les variables d'environnement

### 🔒 Sécurité

- Toutes les clés API doivent être en variables d'environnement
- Ne jamais commit les fichiers `.env`
- Activer RLS (Row Level Security) sur toutes les tables
- HTTPS obligatoire en production

---

## 🎯 Raccourcis Rapides

| Besoin | Documentation |
|--------|--------------|
| Installation | [Quick Setup](setup/QUICK_SETUP.md) |
| Déploiement | [Deployment](deployment/DEPLOYMENT.md) |
| Emails | [Email Setup](features/EMAIL_SETUP_GUIDE.md) |
| Légal | [Legal System](features/LEGAL_SYSTEM_SETUP.md) |
| Architecture | [Architecture](development/ARCHITECTURE.md) |
| Performance | [Performance](development/PERFORMANCE.md) |

---

## 📅 Dernière Mise à Jour

**Date** : Novembre 2025  
**Version** : 1.0

---

**🌿 Jardin Chef - Application de gestion pour professionnels du paysage**

*Développé par l'Association Gard Eau Arbres*

