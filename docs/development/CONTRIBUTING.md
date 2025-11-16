# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à Jardin Chef ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Tests](#tests)

---

## 📜 Code de conduite

En participant à ce projet, vous vous engagez à maintenir un environnement respectueux et inclusif pour tous.

### Nos engagements

- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur ce qui est le mieux pour la communauté

---

## 🎯 Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/gardeauarbres/jardin-chef-mobile/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du bug
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version)

### Proposer une fonctionnalité

1. Vérifiez la [Roadmap](README.md#-roadmap) et les issues existantes
2. Créez une issue avec le template "Feature Request"
3. Décrivez :
   - Le problème que ça résout
   - La solution proposée
   - Des alternatives considérées
   - Mockups/exemples si pertinent

### Corriger un bug ou ajouter une fonctionnalité

1. Commentez sur l'issue pour indiquer que vous travaillez dessus
2. Forkez le repository
3. Créez une branche depuis `main`
4. Faites vos modifications
5. Soumettez une Pull Request

---

## 🛠️ Configuration de l'environnement

### Prérequis

```bash
Node.js >= 18.x
npm >= 9.x
Git
```

### Installation

```bash
# 1. Fork et clone
git clone https://github.com/VOTRE-USERNAME/jardin-chef-mobile.git
cd jardin-chef-mobile

# 2. Ajouter l'upstream
git remote add upstream https://github.com/gardeauarbres/jardin-chef-mobile.git

# 3. Installer les dépendances
npm install

# 4. Copier l'environnement
cp .env.example .env.local

# 5. Configurer Supabase
# Voir README.md pour les instructions

# 6. Lancer le dev
npm run dev
```

### Synchroniser avec l'upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## 🔄 Processus de développement

### 1. Créer une branche

```bash
# Feature
git checkout -b feature/ma-fonctionnalite

# Bug fix
git checkout -b fix/mon-bug

# Refactor
git checkout -b refactor/mon-refactor

# Documentation
git checkout -b docs/ma-doc
```

### 2. Développer

- Écrivez du code propre et lisible
- Commentez les parties complexes
- Suivez les [standards de code](#standards-de-code)
- Testez vos modifications

### 3. Commit

```bash
git add .
git commit -m "feat: ajouter la fonctionnalité X"
```

Voir [section Commits](#commits) pour les conventions

### 4. Push

```bash
git push origin feature/ma-fonctionnalite
```

### 5. Pull Request

Voir [section Pull Requests](#pull-requests)

---

## 📐 Standards de code

### TypeScript

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
}

const getUser = (id: string): User => {
  // ...
};

// ❌ Mauvais
const getUser = (id: any): any => {
  // ...
};
```

### React Composants

```typescript
// ✅ Bon - Composant fonctionnel avec types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// ❌ Mauvais - Sans types
export const Button = ({ label, onClick, disabled }) => {
  // ...
};
```

### Hooks personnalisés

```typescript
// ✅ Bon
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ...
  
  return { clients, isLoading };
};

// Nommage: toujours commencer par "use"
```

### Nommage

```typescript
// Composants: PascalCase
MyComponent.tsx

// Hooks: camelCase avec "use"
useMyHook.ts

// Utilitaires: camelCase
myUtil.ts

// Constants: UPPER_SNAKE_CASE
const MAX_ITEMS = 100;

// Variables/fonctions: camelCase
const userName = 'John';
const getUserName = () => {};
```

### Imports

```typescript
// ✅ Bon - Ordre: React, libs externes, internal, types, styles
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import type { Client } from '@/types';
import './styles.css';

// ❌ Mauvais - Désorganisé
import './styles.css';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
```

### Tailwind CSS

```tsx
// ✅ Bon - Classes groupées logiquement
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// ❌ Mauvais - Classes désorganisées
<div className="p-4 flex shadow-md rounded-lg bg-white items-center justify-between">
```

### Commentaires

```typescript
// ✅ Bon - Explique le "pourquoi"
// Désactiver temporairement la validation pour les comptes legacy
if (user.isLegacy) {
  skipValidation = true;
}

// ❌ Mauvais - Explique le "quoi" (évident)
// Mettre skipValidation à true
skipValidation = true;
```

---

## 💬 Commits

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactorisation (pas de changement fonctionnel)
- `style`: Formatage, points-virgules manquants, etc.
- `docs`: Documentation uniquement
- `test`: Ajout ou modification de tests
- `chore`: Maintenance (dépendances, config, etc.)
- `perf`: Amélioration de performance

### Exemples

```bash
# Feature
git commit -m "feat(clients): ajouter export Excel"

# Bug fix
git commit -m "fix(invoices): corriger calcul TVA"

# Refactor
git commit -m "refactor(hooks): extraire useAuth dans fichier séparé"

# Documentation
git commit -m "docs: ajouter guide de contribution"

# Avec body
git commit -m "feat(dashboard): ajouter widget statistiques

- Ajouter composant StatsWidget
- Intégrer dans Dashboard
- Ajouter tests unitaires

Closes #123"
```

### Règles

- Utiliser l'impératif présent ("ajouter" pas "ajouté")
- Pas de point à la fin du sujet
- Corps et footer optionnels
- Référencer les issues (Closes #123, Fixes #456)
- Maximum 72 caractères pour le sujet

---

## 🔀 Pull Requests

### Avant de soumettre

- [ ] Le code compile sans erreur (`npm run build`)
- [ ] Tous les tests passent (`npm run test`)
- [ ] Le linter ne signale pas d'erreurs (`npm run lint`)
- [ ] Les types sont corrects (`npm run type-check`)
- [ ] La documentation est à jour
- [ ] Les commits suivent les conventions

### Template

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
Décrivez les tests effectués

## Checklist
- [ ] Code self-reviewed
- [ ] Commentaires ajoutés si nécessaire
- [ ] Documentation mise à jour
- [ ] Pas de warnings
- [ ] Tests ajoutés si applicable
- [ ] Tests passent

## Screenshots (si applicable)
[Ajoutez des screenshots]

## Issues liées
Closes #issue_number
```

### Revue de code

- Soyez constructif et respectueux
- Expliquez le "pourquoi" de vos suggestions
- Utilisez des suggestions de code GitHub quand possible
- Approuvez si tout est bon 👍

---

## 🧪 Tests

### Structure

```typescript
// src/hooks/__tests__/useClients.test.ts
import { renderHook } from '@testing-library/react';
import { useClients } from '../useClients';

describe('useClients', () => {
  it('should return empty array initially', () => {
    const { result } = renderHook(() => useClients());
    expect(result.current.clients).toEqual([]);
  });

  it('should load clients on mount', async () => {
    // Test implementation
  });
});
```

### Lancer les tests

```bash
# Tous les tests
npm run test

# Mode watch
npm run test:watch

# Couverture
npm run test:coverage

# Fichier spécifique
npm run test -- useClients.test.ts
```

---

## 🎨 Design

### Principes

1. **Mobile First** - Concevoir d'abord pour mobile
2. **Accessibilité** - WCAG 2.1 niveau AA minimum
3. **Cohérence** - Utiliser le design system existant
4. **Performance** - Optimiser images et animations

### Couleurs

```typescript
// Utiliser les classes Tailwind du thème
<div className="bg-primary text-primary-foreground">
<div className="bg-secondary text-secondary-foreground">
<div className="bg-muted text-muted-foreground">
```

### Composants

- Utiliser Shadcn UI quand possible
- Créer des composants réutilisables
- Documenter les props avec JSDoc

---

## ❓ Questions

Si vous avez des questions :

- 💬 Ouvrez une [Discussion](https://github.com/gardeauarbres/jardin-chef-mobile/discussions)
- 📧 Envoyez un email à support@jardinchef.fr
- 🐛 Créez une [Issue](https://github.com/gardeauarbres/jardin-chef-mobile/issues)

---

## 🙏 Merci !

Votre contribution aide à rendre Jardin Chef meilleur pour tous les paysagistes ! 🌿

---

**Happy Coding! 🚀**
