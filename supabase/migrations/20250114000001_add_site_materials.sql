-- Migration pour lier les matériaux aux chantiers

-- Create site_materials table (matériaux utilisés sur les chantiers)
CREATE TABLE IF NOT EXISTS public.site_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  date_used DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_materials
ALTER TABLE public.site_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for site_materials
CREATE POLICY "Users can view their own site materials" 
ON public.site_materials FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own site materials" 
ON public.site_materials FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own site materials" 
ON public.site_materials FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own site materials" 
ON public.site_materials FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_materials_site_id ON public.site_materials(site_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_material_id ON public.site_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_user_id ON public.site_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_date_used ON public.site_materials(date_used DESC);

-- Create function to automatically create material movement when site material is added
CREATE OR REPLACE FUNCTION create_material_movement_for_site()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a movement record
  INSERT INTO public.material_movements (
    user_id,
    material_id,
    type,
    quantity,
    reason,
    site_id
  ) VALUES (
    NEW.user_id,
    NEW.material_id,
    'out',
    NEW.quantity,
    COALESCE(NEW.notes, 'Utilisation sur chantier'),
    NEW.site_id
  );

  -- Update material quantity
  UPDATE public.materials
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.material_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create movement
DROP TRIGGER IF EXISTS on_site_material_added ON public.site_materials;
CREATE TRIGGER on_site_material_added
  AFTER INSERT ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION create_material_movement_for_site();

-- Create function to restore stock when site material is deleted
CREATE OR REPLACE FUNCTION restore_material_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Restore material quantity
  UPDATE public.materials
  SET quantity = quantity + OLD.quantity
  WHERE id = OLD.material_id;

  -- Delete the corresponding movement record
  DELETE FROM public.material_movements
  WHERE material_id = OLD.material_id
    AND site_id = OLD.site_id
    AND type = 'out'
    AND quantity = OLD.quantity
    AND created_at >= OLD.created_at - INTERVAL '1 second'
    AND created_at <= OLD.created_at + INTERVAL '1 second';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-restore stock
DROP TRIGGER IF EXISTS on_site_material_deleted ON public.site_materials;
CREATE TRIGGER on_site_material_deleted
  BEFORE DELETE ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION restore_material_on_delete();

