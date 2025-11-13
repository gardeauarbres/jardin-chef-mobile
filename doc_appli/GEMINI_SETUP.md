# Configuration Gemini AI 🤖

## Où configurer VITE_GEMINI_API_KEY

La clé API Gemini doit être définie dans le fichier **`.env`** à la racine du projet.

### Emplacement du fichier
```
jardin-chef-mobile/
├── .env          ← ICI
├── package.json
├── src/
└── ...
```

### Format du fichier .env

Le fichier `.env` doit contenir :

```env
VITE_SUPABASE_URL=https://qppuntwgpglsbdppejhw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-supabase
VITE_GEMINI_API_KEY=AIzaSyCVkbSXuTsdvbGHpiMZ_7AM2wDG_Xjo_L8
```

### ⚠️ IMPORTANT : Redémarrer le serveur

**Après avoir modifié le fichier `.env`, vous DEVEZ redémarrer le serveur de développement** pour que les changements soient pris en compte :

1. **Arrêtez le serveur** (Ctrl+C dans le terminal)
2. **Redémarrez-le** :
   ```bash
   npm run dev
   ```

### Vérification

Pour vérifier que la clé est bien chargée :

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Console"
3. Si vous voyez un avertissement `VITE_GEMINI_API_KEY n'est pas définie`, cela signifie que :
   - Soit la variable n'est pas dans le `.env`
   - Soit le serveur n'a pas été redémarré après l'ajout

### Format correct

Assurez-vous que :
- ✅ Pas d'espaces autour du `=`
- ✅ Pas de guillemets autour de la valeur (sauf si nécessaire)
- ✅ Pas de caractères invisibles
- ✅ Le nom de la variable commence par `VITE_` (obligatoire pour Vite)

### Exemple correct
```env
VITE_GEMINI_API_KEY=AIzaSyCVkbSXuTsdvbGHpiMZ_7AM2wDG_Xjo_L8
```

### Exemple incorrect
```env
VITE_GEMINI_API_KEY = AIzaSyCVkbSXuTsdvbGHpiMZ_7AM2wDG_Xjo_L8  ❌ (espaces)
VITE_GEMINI_API_KEY="AIzaSyCVkbSXuTsdvbGHpiMZ_7AM2wDG_Xjo_L8"  ❌ (guillemets inutiles)
GEMINI_API_KEY=AIzaSyCVkbSXuTsdvbGHpiMZ_7AM2wDG_Xjo_L8  ❌ (manque VITE_)
```

## Fonctionnalités disponibles avec Gemini

Une fois la clé configurée et le serveur redémarré :

- ✅ **Génération de descriptions** dans les formulaires de devis
- ✅ **Suggestions de prix** intelligentes
- ✅ **Suggestions d'acompte** automatiques
- ✅ **Assistant conversationnel** sur le Dashboard

