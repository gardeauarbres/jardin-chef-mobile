# 📜 Système de Documents Légaux - Documentation

## 🎯 Vue d'ensemble

Le système de documents légaux de Jardin Chef propose une approche **ludique et moderne** pour gérer l'acceptation des documents légaux par les utilisateurs. Conforme au **RGPD** et aux réglementations françaises.

---

## ✨ Fonctionnalités

### 1. **Onboarding Gamifié** 🎮

- **Design moderne** avec animations et transitions
- **Progression visuelle** (étape par étape)
- **TL;DR** (résumés courts) pour chaque document
- **Confettis** 🎉 à la validation finale
- **Badge de validation** après acceptation
- **Interface mobile-first** responsive

### 2. **Documents Légaux Complets** 📄

Quatre types de documents :
- ✅ **Politique de confidentialité** (obligatoire)
- ✅ **Mentions légales** (obligatoire)
- ✅ **Conditions Générales d'Utilisation (CGU)** (obligatoire)
- ⚪ **Conditions Générales de Vente (CGV)** (optionnel)

### 3. **Hub Centralisé** 🏠

- Page dédiée `/legal` pour consulter tous les documents
- Statut d'acceptation visible (accepté/en attente)
- Dates d'acceptation affichées
- Accès rapide depuis le menu "Plus"

### 4. **Traçabilité RGPD** 🔒

Enregistrement sécurisé :
- Date et heure d'acceptation
- Version du document accepté
- Adresse IP (anonymisée)
- User-Agent (navigateur)

---

## 🚀 Installation

### Étape 1 : Appliquer la Migration SQL

1. Ouvrez votre **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `fix_legal_acceptances.sql`
4. Exécutez le script
5. ✅ Vérifiez que la table `legal_acceptances` est créée

```sql
-- Vérifier la création
SELECT * FROM pg_tables WHERE tablename = 'legal_acceptances';
```

### Étape 2 : Vérifier l'Installation

```bash
# Les packages sont déjà installés :
# - canvas-confetti (confettis)
# - framer-motion (animations)
```

### Étape 3 : Tester

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** avec un compte
3. **L'onboarding légal** devrait s'afficher automatiquement
4. Acceptez les 3 documents obligatoires
5. 🎉 **Confettis !** Votre compte est prêt

---

## 📂 Structure des Fichiers

```
src/
├── components/
│   ├── LegalOnboarding.tsx           # Onboarding gamifié
│   └── LegalOnboardingWrapper.tsx    # Wrapper pour afficher l'onboarding
├── hooks/
│   └── useLegalAcceptances.ts        # Hook pour gérer les acceptations
├── pages/
│   └── legal/
│       ├── LegalHub.tsx              # Hub central des documents
│       ├── PrivacyPolicy.tsx         # Politique de confidentialité
│       ├── LegalNotice.tsx           # Mentions légales
│       └── TermsOfService.tsx        # CGU
supabase/migrations/
└── 20250116000000_add_legal_acceptances.sql
```

---

## 🎨 Personnalisation

### Modifier les Documents Légaux

#### **Politique de confidentialité**
Fichier : `src/pages/legal/PrivacyPolicy.tsx`

Personnalisez les sections selon votre entreprise :
- Données collectées
- Utilisation des données
- Durée de conservation
- Contact (email)

#### **Mentions légales**
Fichier : `src/pages/legal/LegalNotice.tsx`

**À MODIFIER OBLIGATOIREMENT** :
```tsx
<p><strong>Éditeur :</strong> [Nom de votre société]</p>
<p><strong>SIRET :</strong> [Votre SIRET]</p>
<p><strong>Adresse :</strong> [Votre adresse]</p>
```

#### **CGU**
Fichier : `src/pages/legal/TermsOfService.tsx`

Personnalisez :
- Tarification
- Services proposés
- Conditions de résiliation

### Changer les Couleurs

```tsx
// Dans LegalOnboarding.tsx
const steps = [
  {
    color: 'text-blue-500',    // Changer la couleur
    bgColor: 'bg-blue-500/10', // Changer le fond
  }
];
```

---

## 🔧 Utilisation Avancée

### Forcer l'Onboarding

Si vous voulez que l'utilisateur accepte à nouveau les documents :

```sql
-- Réinitialiser les acceptations d'un utilisateur
UPDATE legal_acceptances
SET privacy_policy_accepted = false,
    legal_notice_accepted = false,
    terms_of_service_accepted = false
WHERE user_id = 'USER_UUID';
```

### Vérifier les Acceptations

```tsx
import { useLegalAcceptances, hasAcceptedAllLegal } from '@/hooks/useLegalAcceptances';

function MyComponent() {
  const { data: acceptances } = useLegalAcceptances();
  const allAccepted = hasAcceptedAllLegal(acceptances);
  
  return <div>{allAccepted ? 'Accepté ✅' : 'En attente ⏳'}</div>;
}
```

### Ajouter un Nouveau Document

1. **Ajoutez une colonne** dans `legal_acceptances` :

```sql
ALTER TABLE legal_acceptances
ADD COLUMN custom_doc_accepted BOOLEAN DEFAULT false,
ADD COLUMN custom_doc_version TEXT DEFAULT '1.0',
ADD COLUMN custom_doc_accepted_at TIMESTAMPTZ;
```

2. **Créez la page** : `src/pages/legal/CustomDoc.tsx`

3. **Ajoutez dans l'onboarding** : `LegalOnboarding.tsx`

---

## 🧪 Tests

### Test Manuel

1. **Nouveau utilisateur** : Créez un compte → L'onboarding s'affiche
2. **Utilisateur existant** : Connexion → Pas d'onboarding (déjà accepté)
3. **Navigation** : Menu Plus → Documents légaux → Tous visibles
4. **Statut** : Vérifiez les badges "Accepté" ✅

### Requête SQL de Vérification

```sql
-- Voir tous les utilisateurs et leur statut d'acceptation
SELECT 
  u.email,
  la.privacy_policy_accepted,
  la.legal_notice_accepted,
  la.terms_of_service_accepted,
  la.privacy_policy_accepted_at
FROM auth.users u
LEFT JOIN legal_acceptances la ON u.id = la.user_id
ORDER BY u.created_at DESC;
```

---

## 🛠️ Dépannage

### Problème : L'onboarding ne s'affiche pas

**Solution 1** : Vérifiez que la table existe
```sql
SELECT * FROM legal_acceptances;
```

**Solution 2** : Vérifiez les RLS policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'legal_acceptances';
```

**Solution 3** : Vérifiez dans la console
```js
// Console du navigateur
console.log(localStorage.getItem('supabase.auth.token'));
```

### Problème : Erreur 406 ou 400

**Cause** : La table n'existe pas encore

**Solution** : Appliquez `fix_legal_acceptances.sql` dans Supabase

---

## 📊 Statistiques

### Voir le Taux d'Acceptation

```sql
-- Taux d'acceptation des documents
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN privacy_policy_accepted THEN 1 END) as privacy_accepted,
  COUNT(CASE WHEN legal_notice_accepted THEN 1 END) as legal_accepted,
  COUNT(CASE WHEN terms_of_service_accepted THEN 1 END) as terms_accepted,
  ROUND(100.0 * COUNT(CASE WHEN 
    privacy_policy_accepted AND 
    legal_notice_accepted AND 
    terms_of_service_accepted 
  THEN 1 END) / NULLIF(COUNT(*), 0), 2) as full_compliance_rate
FROM legal_acceptances;
```

---

## 🎯 Conformité RGPD

Le système est **conforme au RGPD** :

✅ **Transparence** : Documents lisibles et accessibles  
✅ **Consentement éclairé** : Résumés TL;DR avant acceptation  
✅ **Traçabilité** : Dates, versions, IP enregistrées  
✅ **Droit d'accès** : Utilisateurs peuvent consulter leurs acceptations  
✅ **Versioning** : Gestion des versions de documents  
✅ **Sécurité** : RLS Supabase + HTTPS  

---

## 📞 Support

Pour toute question :
- **Email** : legal@jardinchef.com
- **FAQ** : `/faq` dans l'application
- **Assistant IA** : Bouton ✨ Sparkles

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Analytics** : Suivre le taux d'acceptation
2. **Notifications** : Alerter en cas de nouvelles versions
3. **Export PDF** : Générer un PDF des acceptations
4. **Signature électronique** : Ajouter une signature numérique
5. **Multi-langue** : Traduire en anglais, espagnol, etc.

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] ✅ Migration SQL appliquée
- [ ] ✅ Table `legal_acceptances` créée
- [ ] ✅ RLS policies activées
- [ ] ✅ Mentions légales personnalisées (SIRET, adresse, etc.)
- [ ] ✅ Emails de contact configurés
- [ ] ✅ Tests effectués (nouvel utilisateur + existant)
- [ ] ✅ Packages installés (`canvas-confetti`, `framer-motion`)
- [ ] ✅ Build réussi sans erreur
- [ ] ✅ Git push effectué

---

**🎉 Félicitations ! Votre système légal gamifié est prêt !**

*Version 1.0 - Janvier 2025*

