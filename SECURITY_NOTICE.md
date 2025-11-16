# 🔒 Notice de Sécurité

## ⚠️ Fichiers Protégés

Par mesure de sécurité, certains fichiers ont été **retirés de GitHub** et ne sont disponibles que **localement** pour les développeurs autorisés.

---

## 📋 Liste des Fichiers Protégés

### **Scripts SQL**
- `_archived_scripts/` (tout le dossier)
- `docs/setup/setup_database.sql`
- `docs/setup/setup_database_clean.sql`

### **Documentation Sensible**
- `docs/features/EMAIL_SETUP_GUIDE.md`
- `docs/features/RESEND_DNS_SETUP.md`

---

## ✅ Ces Fichiers Restent Disponibles

### **En Local**
Si vous avez cloné le repository **avant** cette protection, vous avez toujours accès à ces fichiers sur votre machine.

### **Sur GitHub**
- ❌ Non accessibles dans les nouveaux commits
- ⚠️ Toujours présents dans l'historique Git

---

## 🔐 Comment Obtenir les Fichiers Protégés ?

### **Option 1 : Vous êtes membre de l'équipe**
1. Les fichiers sont disponibles dans votre clone local
2. Vérifiez le dossier `_archived_scripts/`
3. Vérifiez `docs/setup/` et `docs/features/`

### **Option 2 : Utilisateur externe**
1. Contactez : **chantiers@gardeauarbres.fr**
2. Fournissez une raison valide pour l'accès
3. Nous vous fournirons les fichiers nécessaires

### **Option 3 : Alternative publique**
Utilisez les alternatives disponibles publiquement :
- **SQL** : Contenu inline dans `docs/setup/QUICK_SETUP.md`
- **Email** : Documentation générique Resend disponible sur [resend.com/docs](https://resend.com/docs)

---

## 🛡️ Pourquoi Cette Protection ?

### **Raisons**
1. **Scripts SQL** : Éviter l'exposition de la structure de base de données
2. **Configuration email** : Protéger les informations de configuration SMTP
3. **Sécurité** : Réduire la surface d'attaque potentielle

### **Ce Qui Est Vraiment Sensible**
- ✅ `.env` (déjà protégé par `.gitignore`)
- ✅ Clés API (jamais dans le code)
- ✅ Mots de passe (jamais dans le code)

### **Ce Qui N'Est PAS dans le Code**
- ❌ Clés Supabase
- ❌ Clés Gemini
- ❌ Clés Resend
- ❌ Mots de passe

---

## 📊 État de Sécurité Actuel

| Élément | État | Détails |
|---------|------|---------|
| **Clés API** | ✅ Sécurisées | Dans `.env` (ignoré par Git) |
| **Scripts SQL** | 🔒 Protégés | Retirés de GitHub |
| **Documentation Email** | 🔒 Protégée | Retirée de GitHub |
| **Code Source** | ✅ Public | Pas de secrets |
| **Repository GitHub** | ⚠️ Public | Considérez de le rendre privé |

---

## 🚨 RECOMMANDATION IMPORTANTE

### **Rendre le Repository Privé**

Pour une **sécurité maximale**, nous recommandons de **rendre le repository GitHub privé** :

1. Allez sur [github.com/gardeauarbres/jardin-chef-mobile/settings](https://github.com/gardeauarbres/jardin-chef-mobile/settings)
2. Scrollez jusqu'à **Danger Zone**
3. Cliquez sur **Change visibility**
4. Sélectionnez **Make private**
5. Confirmez

**Avantages** :
- ✅ Contrôle total sur qui peut voir le code
- ✅ Pas besoin de cacher des fichiers
- ✅ Historique Git complètement privé
- ✅ Collaboration sécurisée

---

## 📞 Contact

Pour toute question concernant la sécurité ou l'accès aux fichiers :
- **Email** : chantiers@gardeauarbres.fr
- **Urgence** : Utilisez le même email avec [URGENT] dans l'objet

---

## 📅 Historique

- **16 Novembre 2025** : Protection initiale mise en place
  - Ajout de `_archived_scripts/` au `.gitignore`
  - Ajout des scripts SQL au `.gitignore`
  - Ajout de la documentation email au `.gitignore`
  - Suppression du tracking Git (fichiers restent localement)

---

**🔒 La sécurité est notre priorité. Merci de respecter ces mesures de protection.**

