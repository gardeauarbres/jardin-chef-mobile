import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useSiteMaterials, useAddSiteMaterial, useRemoveSiteMaterial, useSiteMaterialsCost } from '@/hooks/useSiteMaterials';
import { useMaterials } from '@/hooks/useMaterials';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface SiteMaterialsManagerProps {
  siteId: string;
}

export const SiteMaterialsManager = ({ siteId }: SiteMaterialsManagerProps) => {
  const { data: siteMaterials = [], isLoading } = useSiteMaterials(siteId);
  const { data: availableMaterials = [] } = useMaterials();
  const { data: totalCost = 0 } = useSiteMaterialsCost(siteId);
  const addMaterial = useAddSiteMaterial();
  const removeMaterial = useRemoveSiteMaterial();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    material_id: '',
    quantity: 0,
    date_used: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const selectedMaterial = availableMaterials.find(m => m.id === formData.material_id);

  const handleAdd = async () => {
    if (!formData.material_id || formData.quantity <= 0) {
      return;
    }

    try {
      await addMaterial.mutateAsync({
        site_id: siteId,
        ...formData,
      });
      setIsDialogOpen(false);
      setFormData({
        material_id: '',
        quantity: 0,
        date_used: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      console.error('Erreur ajout matériau:', error);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMaterial.mutateAsync(id);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Package className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'plant':
        return 'Plante';
      case 'tool':
        return 'Outil';
      case 'product':
        return 'Produit';
      case 'equipment':
        return 'Équipement';
      default:
        return 'Autre';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Matériaux utilisés
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un matériau</DialogTitle>
                <DialogDescription>
                  Le stock sera automatiquement déduit
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Matériau *</label>
                  <Select
                    value={formData.material_id}
                    onValueChange={(value) => setFormData({ ...formData, material_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{material.name}</span>
                            <span className="text-xs text-muted-foreground ml-4">
                              Stock: {material.quantity} {material.unit}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMaterial && selectedMaterial.quantity <= selectedMaterial.min_quantity && (
                  <div className="flex items-center gap-2 p-2 bg-orange-500/10 text-orange-600 rounded-md text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Stock faible ! Disponible: {selectedMaterial.quantity} {selectedMaterial.unit}</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Quantité *</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                  {selectedMaterial && formData.quantity > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coût: {(formData.quantity * selectedMaterial.unit_price).toFixed(2)}€
                      {formData.quantity > selectedMaterial.quantity && (
                        <span className="text-red-600 ml-2">⚠️ Quantité supérieure au stock !</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date d'utilisation</label>
                  <Input
                    type="date"
                    value={formData.date_used}
                    onChange={(e) => setFormData({ ...formData, date_used: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Zone nord, préparation du sol..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={!formData.material_id || formData.quantity <= 0}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : siteMaterials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Aucun matériau utilisé sur ce chantier</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteMaterials.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(item.materials?.category || '')}
                    <span className="font-medium">{item.materials?.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(item.materials?.category || '')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {item.quantity} {item.materials?.unit}
                    </span>
                    <span>•</span>
                    <span>
                      {(item.quantity * (item.materials?.unit_price || 0)).toFixed(2)}€
                    </span>
                    <span>•</span>
                    <span>
                      {format(new Date(item.date_used), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                  )}
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Retirer ce matériau ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le stock de "{item.materials?.name}" sera automatiquement restauré (+{item.quantity} {item.materials?.unit}).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(item.id)}>
                        Retirer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Coût total des matériaux :</span>
                <span className="text-lg text-primary">{totalCost.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

