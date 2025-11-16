# 🚀 Déploiement & Production

Ce dossier contient tous les guides pour déployer Jardin Chef en production.

---

## 📋 Guides Disponibles

### **[DEPLOY.md](DEPLOY.md)** 🚀
**Guide complet de déploiement** de l'application en production.

**Contenu** :
- ✅ Déploiement sur Vercel
- ✅ Configuration Supabase
- ✅ Variables d'environnement
- ✅ DNS & Domaine personnalisé
- ✅ Vérifications post-déploiement

**Utiliser ce guide si** :
- 🆕 Premier déploiement
- 🔧 Reconfiguration
- 🐛 Problèmes en production

---

### **[DEPLOYMENT.md](DEPLOYMENT.md)** 📖
**Guide détaillé étape par étape** avec captures d'écran.

**Contenu** :
- ✅ Setup Vercel complet
- ✅ Intégration GitHub
- ✅ Configuration environnements
- ✅ Monitoring & Analytics

**Utiliser ce guide si** :
- 📚 Première fois avec Vercel
- 🔍 Besoin de détails visuels
- 🎓 Formation d'équipe

---

## 🎯 Choix du Guide

| Besoin | Guide à utiliser |
|--------|-----------------|
| **Déploiement rapide** | [DEPLOY.md](DEPLOY.md) |
| **Guide détaillé avec captures** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Configuration emails** | [Email Setup](../features/EMAIL_SETUP_GUIDE.md) |
| **Documents légaux** | [Legal System](../features/LEGAL_SYSTEM_SETUP.md) |

---

## 🚀 Démarrage Rapide

### Prérequis

- ✅ Compte GitHub
- ✅ Compte Vercel
- ✅ Projet Supabase configuré
- ✅ Code sur GitHub

### Étapes Minimales

1. **Connectez Vercel à GitHub**
   - [vercel.com](https://vercel.com) → Import Project

2. **Configurez les variables d'environnement**
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   VITE_GEMINI_API_KEY=AIzaSyxxx...
   ```

3. **Déployez**
   - Vercel déploie automatiquement

4. **Vérifiez**
   - Testez l'accès à l'application
   - Vérifiez la connexion Supabase

---

## ⚠️ Checklist Avant Production

### Base de Données
- [ ] Toutes les migrations SQL appliquées
- [ ] RLS activé sur toutes les tables
- [ ] Backup configuré

### Configuration
- [ ] Variables d'environnement définies
- [ ] DNS configuré (si domaine personnalisé)
- [ ] Emails configurés (Resend/SendGrid)

### Sécurité
- [ ] HTTPS activé
- [ ] Clés API en environnement seulement
- [ ] Confirmation email activée
- [ ] Documents légaux personnalisés

### Monitoring
- [ ] Vercel Analytics activé
- [ ] Speed Insights activé
- [ ] Logs vérifiés

---

## 🔧 Configuration Avancée

### Domaine Personnalisé
1. Achetez un domaine
2. Ajoutez-le dans Vercel
3. Configurez les DNS
4. Attendez la propagation (24-48h)

### Emails Production
1. Configurez Resend/SendGrid
2. Ajoutez les enregistrements DNS
3. Configurez SMTP dans Supabase
4. Testez l'envoi d'emails

### Monitoring
1. Activez Vercel Analytics
2. Configurez les alertes
3. Surveillez les performances
4. Analysez les logs

---

## 🛠️ Résolution de Problèmes

### Erreur : "Build Failed"
**Cause** : Erreur TypeScript ou dépendances manquantes  
**Solution** :
1. Vérifiez `npm run build` en local
2. Corrigez les erreurs TypeScript
3. Redéployez

### Erreur : "API Error 401"
**Cause** : Clés Supabase incorrectes  
**Solution** :
1. Vérifiez les variables d'environnement
2. Régénérez les clés si nécessaire
3. Redéployez

### Erreur : "Could not find table"
**Cause** : Migrations SQL non appliquées  
**Solution** :
1. Consultez [QUICK_SETUP.md](../setup/QUICK_SETUP.md)
2. Appliquez les migrations
3. Rechargez l'application

### Problème : Lenteur
**Solution** :
1. Vérifiez [Performance Guide](../development/PERFORMANCE.md)
2. Activez Speed Insights
3. Optimisez les requêtes

---

## 📚 Documentation Complète

Pour plus d'informations :
- **[Index Documentation](../INDEX.md)** - Vue d'ensemble
- **[Architecture](../development/ARCHITECTURE.md)** - Structure
- **[Email Setup](../features/EMAIL_SETUP_GUIDE.md)** - Configuration emails
- **[Legal System](../features/LEGAL_SYSTEM_SETUP.md)** - Documents légaux

---

## 📞 Support

Besoin d'aide pour le déploiement ?
- **Email** : chantiers@gardeauarbres.fr
- **FAQ** : `/faq` dans l'application
- **Assistant IA** : Bouton ✨ Sparkles
- **Vercel Support** : [vercel.com/support](https://vercel.com/support)

---

## 🎉 Après le Déploiement

Une fois déployé :
1. ✅ Testez tous les flux utilisateur
2. ✅ Vérifiez les emails
3. ✅ Testez sur mobile
4. ✅ Partagez avec votre équipe
5. ✅ Configurez le monitoring

---

*Dernière mise à jour : Novembre 2025*

