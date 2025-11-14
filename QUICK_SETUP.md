# 🚀 Guide de Setup Rapide - Jardin Chef

Ce guide vous permet de configurer rapidement votre base de données Supabase en appliquant toutes les migrations nécessaires.

---

## ⚠️ Erreur "Could not find the table" ?

Si vous voyez cette erreur :
```
Error upserting company profile: {code: 'PGRST205', details: null, hint: "Perhaps you meant the table 'public.profiles'", message: "Could not find the table 'public.company_profile' in the schema cache"}
```

C'est normal ! Vous devez d'abord appliquer les migrations SQL dans Supabase.

---

## 📋 Prérequis

- ✅ Compte Supabase créé
- ✅ Projet Supabase créé
- ✅ Application déployée sur Vercel (ou en local)

---

## 🗄️ Étape 1 : Appliquer les Migrations SQL

### Option A : Via le Dashboard Supabase (RECOMMANDÉ)

1. **Connectez-vous sur** [supabase.com](https://supabase.com)

2. **Sélectionnez votre projet** (ex: `jardin-chef-production`)

3. **Cliquez sur "SQL Editor"** dans la sidebar gauche

4. **Cliquez sur "+ New query"**

5. **Copiez-collez ce SQL complet** (toutes les migrations en une fois) :

```sql
-- =====================================================
-- MIGRATION 1: Materials Inventory
-- =====================================================

-- Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(10,2) DEFAULT 0,
  unit_price NUMERIC(10,2) DEFAULT 0,
  supplier TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create material_movements table
CREATE TABLE IF NOT EXISTS public.material_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(10,2) NOT NULL,
  reason TEXT,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for materials
CREATE POLICY "Users can view their own materials"
  ON public.materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials"
  ON public.materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
  ON public.materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
  ON public.materials FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for material_movements
CREATE POLICY "Users can view their own material movements"
  ON public.material_movements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.materials
    WHERE materials.id = material_movements.material_id
    AND materials.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own material movements"
  ON public.material_movements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.materials
    WHERE materials.id = material_movements.material_id
    AND materials.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_material_movements_material_id ON public.material_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_site_id ON public.material_movements(site_id);

-- =====================================================
-- MIGRATION 2: Site Materials
-- =====================================================

-- Create site_materials table (matériaux utilisés sur les chantiers)
CREATE TABLE IF NOT EXISTS public.site_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  used_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own site materials"
  ON public.site_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own site materials"
  ON public.site_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own site materials"
  ON public.site_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own site materials"
  ON public.site_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_materials_site_id ON public.site_materials(site_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_material_id ON public.site_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_user_id ON public.site_materials(user_id);

-- Function to automatically deduct stock when site materials are added
CREATE OR REPLACE FUNCTION update_material_stock_on_site_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct quantity from materials table
  UPDATE public.materials
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.material_id;
  
  -- Create a movement record
  INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
  VALUES (NEW.material_id, 'out', NEW.quantity, 'Utilisé sur chantier', NEW.site_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore stock when site materials are removed
CREATE OR REPLACE FUNCTION restore_material_stock_on_site_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- Add quantity back to materials table
  UPDATE public.materials
  SET quantity = quantity + OLD.quantity
  WHERE id = OLD.material_id;
  
  -- Create a movement record
  INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
  VALUES (OLD.material_id, 'in', OLD.quantity, 'Retour de chantier', OLD.site_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to adjust stock when site materials quantity changes
CREATE OR REPLACE FUNCTION adjust_material_stock_on_site_update()
RETURNS TRIGGER AS $$
DECLARE
  quantity_diff NUMERIC(10,2);
BEGIN
  -- Calculate the difference
  quantity_diff := NEW.quantity - OLD.quantity;
  
  -- Update materials stock
  UPDATE public.materials
  SET quantity = quantity - quantity_diff
  WHERE id = NEW.material_id;
  
  -- Create a movement record
  IF quantity_diff > 0 THEN
    INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
    VALUES (NEW.material_id, 'out', quantity_diff, 'Ajustement chantier', NEW.site_id);
  ELSIF quantity_diff < 0 THEN
    INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
    VALUES (NEW.material_id, 'in', ABS(quantity_diff), 'Ajustement chantier', NEW.site_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_stock_on_site_usage ON public.site_materials;
CREATE TRIGGER trigger_update_stock_on_site_usage
  AFTER INSERT ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_material_stock_on_site_usage();

DROP TRIGGER IF EXISTS trigger_restore_stock_on_site_removal ON public.site_materials;
CREATE TRIGGER trigger_restore_stock_on_site_removal
  AFTER DELETE ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION restore_material_stock_on_site_removal();

DROP TRIGGER IF EXISTS trigger_adjust_stock_on_site_update ON public.site_materials;
CREATE TRIGGER trigger_adjust_stock_on_site_update
  AFTER UPDATE OF quantity ON public.site_materials
  FOR EACH ROW
  WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
  EXECUTE FUNCTION adjust_material_stock_on_site_update();

-- =====================================================
-- MIGRATION 3: Company Profile
-- =====================================================

-- Create company_profile table
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Company information
    company_name TEXT NOT NULL,
    siret TEXT,
    tva_number TEXT,
    is_auto_entrepreneur BOOLEAN DEFAULT false,
    
    -- Address
    address TEXT,
    address_complement TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'France',
    
    -- Contact information
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Owner information
    first_name TEXT,
    last_name TEXT,
    
    -- Branding
    logo_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own company profile"
    ON public.company_profile
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own company profile"
    ON public.company_profile
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own company profile"
    ON public.company_profile
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own company profile"
    ON public.company_profile
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_company_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_company_profile_updated_at ON public.company_profile;
CREATE TRIGGER update_company_profile_updated_at
    BEFORE UPDATE ON public.company_profile
    FOR EACH ROW
    EXECUTE FUNCTION public.update_company_profile_updated_at();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_profile_user_id ON public.company_profile(user_id);

-- Grant permissions
GRANT ALL ON public.company_profile TO authenticated;
GRANT ALL ON public.company_profile TO service_role;

-- Add comment
COMMENT ON TABLE public.company_profile IS 'Store company profile information for document generation';

-- =====================================================
-- FIN DES MIGRATIONS
-- =====================================================
```

6. **Cliquez sur "Run"** (ou `F5`)

7. **Attendez ~10 secondes** que tout s'exécute

8. **Vérifiez qu'il n'y a pas d'erreur** en bas de la page

---

## ✅ Étape 2 : Vérifier que tout fonctionne

### Vérification des tables créées

1. Allez dans **"Table Editor"** (sidebar gauche)

2. Vous devriez voir ces nouvelles tables :
   - ✅ `materials`
   - ✅ `material_movements`
   - ✅ `site_materials`
   - ✅ `company_profile`

### Test de l'application

1. **Rechargez votre application** (F5 dans le navigateur)

2. **Testez chaque fonctionnalité** :
   - [ ] Profil d'entreprise (Menu Plus > Profil)
   - [ ] Gestion des stocks (Menu Plus > Gestion des stocks)
   - [ ] Matériaux sur chantiers (Chantiers > Modifier > Section Matériaux)

3. **Vérifiez qu'il n'y a plus d'erreur** dans la console du navigateur

---

## 🐛 En cas de problème

### Erreur : "relation already exists"

**Normal !** Cela signifie que cette table existe déjà. Vous pouvez ignorer cette erreur.

### Erreur : "permission denied"

**Solution** : Vérifiez que vous êtes bien connecté en tant qu'administrateur dans Supabase.

### Erreur : "foreign key constraint"

**Solution** : Assurez-vous que les tables de base existent (`sites`, `auth.users`, etc.)

### L'application affiche toujours l'erreur

**Solution** :
1. Videz le cache du navigateur (`Ctrl+Shift+Delete`)
2. Rechargez l'application (`Ctrl+F5`)
3. Vérifiez la console pour voir les erreurs

---

## 📊 Tables Créées

Après l'exécution, voici ce qui est créé :

| Table | Description | Lignes |
|-------|-------------|--------|
| `materials` | Stock des matériaux | ~0 initialement |
| `material_movements` | Historique mouvements stock | ~0 initialement |
| `site_materials` | Matériaux par chantier | ~0 initialement |
| `company_profile` | Profil entreprise | ~0 initialement |

---

## 🎯 Prochaines Étapes

Une fois les migrations appliquées :

1. ✅ **Remplir votre profil d'entreprise**
   - Menu Plus > Profil d'entreprise
   - Remplir tous les champs
   - Sauvegarder

2. ✅ **Ajouter des matériaux**
   - Menu Plus > Gestion des stocks
   - Créer vos premiers matériaux

3. ✅ **Tester les exports PDF**
   - Dashboard > Documents à envoyer
   - Télécharger une facture PDF
   - Vérifier que les infos de l'entreprise apparaissent

---

## 🆘 Besoin d'aide ?

Si vous rencontrez toujours des problèmes :

1. **Vérifiez les logs Supabase** :
   - Supabase Dashboard > Logs > API Logs

2. **Vérifiez la console du navigateur** :
   - F12 > Console
   - Cherchez les erreurs en rouge

3. **Vérifiez que RLS est activé** :
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public'
   AND tablename IN ('materials', 'site_materials', 'company_profile');
   ```

---

## ✅ Checklist de Setup

- [ ] Migrations SQL appliquées
- [ ] Tables visibles dans Table Editor
- [ ] Application rechargée
- [ ] Profil d'entreprise rempli
- [ ] Matériaux créés (optionnel)
- [ ] Export PDF testé
- [ ] Aucune erreur dans la console

---

**Félicitations ! 🎉 Votre base de données est maintenant configurée !**

**Dernière mise à jour** : Janvier 2025

