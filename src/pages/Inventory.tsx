import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  ArrowUpDown,
  Search,
  History,
  Leaf,
  Wrench,
  Droplet,
  Hammer,
  MoreHorizontal,
} from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { 
  useMaterials, 
  useCreateMaterial, 
  useUpdateMaterial, 
  useDeleteMaterial,
  useCreateMovement,
  useMaterialMovements,
  Material,
  CreateMaterialInput,
} from '@/hooks/useMaterials';
import { useSites } from '@/hooks/useSupabaseQuery';
import { toast } from 'sonner';

const Inventory = () => {
  const { data: materials = [], isLoading } = useMaterials();
  const { data: sites = [] } = useSites();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const createMovement = useCreateMovement();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<CreateMaterialInput>({
    name: '',
    description: '',
    category: 'plant',
    quantity: 0,
    unit: 'unit',
    min_quantity: 0,
    unit_price: 0,
    supplier: '',
    location: '',
  });

  // État du mouvement
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    site_id: '',
  });

  const { data: movements = [] } = useMaterialMovements(selectedMaterial?.id);

  // Filtrer les matériaux
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Statistiques
  const lowStockCount = materials.filter(m => m.quantity <= m.min_quantity).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.unit_price), 0);
  const totalItems = materials.length;

  const getCategoryIcon = (category: Material['category']) => {
    switch (category) {
      case 'plant':
        return <Leaf className="h-4 w-4" />;
      case 'tool':
        return <Wrench className="h-4 w-4" />;
      case 'product':
        return <Droplet className="h-4 w-4" />;
      case 'equipment':
        return <Hammer className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: Material['category']) => {
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

  const handleCreate = async () => {
    try {
      await createMaterial.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur création:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMaterial) return;
    try {
      await updateMaterial.mutateAsync({ id: selectedMaterial.id, ...formData });
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      resetForm();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleMovement = async () => {
    if (!selectedMaterial) return;
    
    if (movementData.quantity <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    try {
      await createMovement.mutateAsync({
        material_id: selectedMaterial.id,
        ...movementData,
        site_id: movementData.site_id || undefined,
      });
      setIsMovementDialogOpen(false);
      setMovementData({
        type: 'in',
        quantity: 0,
        reason: '',
        site_id: '',
      });
    } catch (error) {
      console.error('Erreur mouvement:', error);
    }
  };

  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      category: material.category,
      quantity: material.quantity,
      unit: material.unit,
      min_quantity: material.min_quantity,
      unit_price: material.unit_price,
      supplier: material.supplier || '',
      location: material.location || '',
    });
    setIsEditDialogOpen(true);
  };

  const openMovementDialog = (material: Material) => {
    setSelectedMaterial(material);
    setMovementData({
      type: 'in',
      quantity: 0,
      reason: '',
      site_id: '',
    });
    setIsMovementDialogOpen(true);
  };

  const openHistoryDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsHistoryDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'plant',
      quantity: 0,
      unit: 'unit',
      min_quantity: 0,
      unit_price: 0,
      supplier: '',
      location: '',
    });
  };

  return (
    <div className="container mx-auto p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          Gestion des stocks
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos matériaux, plantes, outils et produits
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">articles en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Stock faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">articles à réapprovisionner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Valeur totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">valeur du stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un matériau..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="plant">Plantes</SelectItem>
            <SelectItem value="tool">Outils</SelectItem>
            <SelectItem value="product">Produits</SelectItem>
            <SelectItem value="equipment">Équipements</SelectItem>
            <SelectItem value="other">Autres</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau matériau
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un matériau</DialogTitle>
              <DialogDescription>
                Renseignez les informations du nouveau matériau
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Nom *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Terreau universel"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du matériau..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Material['category']) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plant">Plante</SelectItem>
                      <SelectItem value="tool">Outil</SelectItem>
                      <SelectItem value="product">Produit</SelectItem>
                      <SelectItem value="equipment">Équipement</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Unité *</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ex: unité, kg, L"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quantité initiale</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quantité minimum</label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Prix unitaire (€)</label>
                  <Input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Fournisseur</label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nom du fournisseur"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Emplacement</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Où est stocké le matériau"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog d'édition (identique au dialog de création) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le matériau</DialogTitle>
            <DialogDescription>
              Modifiez les informations du matériau
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Terreau universel"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du matériau..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Material['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plant">Plante</SelectItem>
                    <SelectItem value="tool">Outil</SelectItem>
                    <SelectItem value="product">Produit</SelectItem>
                    <SelectItem value="equipment">Équipement</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Unité *</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ex: unité, kg, L"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quantité minimum</label>
                <Input
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Prix unitaire (€)</label>
                <Input
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fournisseur</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Emplacement</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Où est stocké le matériau"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={!formData.name}>
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de mouvement de stock */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mouvement de stock</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.name} - Stock actuel: {selectedMaterial?.quantity} {selectedMaterial?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de mouvement</label>
              <Select
                value={movementData.type}
                onValueChange={(value: 'in' | 'out' | 'adjustment') =>
                  setMovementData({ ...movementData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Entrée (ajout au stock)
                    </div>
                  </SelectItem>
                  <SelectItem value="out">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Sortie (utilisation)
                    </div>
                  </SelectItem>
                  <SelectItem value="adjustment">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Ajustement (correction)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {movementData.type === 'adjustment' ? 'Nouvelle quantité' : 'Quantité'}
              </label>
              <Input
                type="number"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
              {movementData.type !== 'adjustment' && selectedMaterial && (
                <p className="text-xs text-muted-foreground mt-1">
                  {movementData.type === 'in'
                    ? `Nouveau stock: ${selectedMaterial.quantity + movementData.quantity} ${selectedMaterial.unit}`
                    : `Nouveau stock: ${Math.max(0, selectedMaterial.quantity - movementData.quantity)} ${selectedMaterial.unit}`
                  }
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Raison / Notes</label>
              <Textarea
                value={movementData.reason}
                onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                placeholder="Ex: Achat, Utilisation chantier, Inventaire..."
                rows={2}
              />
            </div>

            {movementData.type === 'out' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Chantier (optionnel)</label>
                <Select
                  value={movementData.site_id}
                  onValueChange={(value) => setMovementData({ ...movementData, site_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un chantier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {sites.map((site: any) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleMovement} disabled={movementData.quantity <= 0}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog historique */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des mouvements</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun mouvement enregistré
              </p>
            ) : (
              movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {movement.type === 'in' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {movement.type === 'out' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {movement.type === 'adjustment' && <ArrowUpDown className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">
                        {movement.type === 'in' && 'Entrée'}
                        {movement.type === 'out' && 'Sortie'}
                        {movement.type === 'adjustment' && 'Ajustement'}
                        {' '}de {movement.quantity} {selectedMaterial?.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(movement.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {movement.reason && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {movement.reason}
                        </div>
                      )}
                      {movement.sites && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {movement.sites.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Liste des matériaux */}
      {isLoading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">Aucun matériau trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onMovement={openMovementDialog}
              onHistory={openHistoryDialog}
              getCategoryIcon={getCategoryIcon}
              getCategoryLabel={getCategoryLabel}
            />
          ))}
        </div>
      )}

      <MobileNav />
    </div>
  );
};

// Composant carte matériau
interface MaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
  onMovement: (material: Material) => void;
  onHistory: (material: Material) => void;
  getCategoryIcon: (category: Material['category']) => JSX.Element;
  getCategoryLabel: (category: Material['category']) => string;
}

const MaterialCard = ({
  material,
  onEdit,
  onDelete,
  onMovement,
  onHistory,
  getCategoryIcon,
  getCategoryLabel,
}: MaterialCardProps) => {
  const isLowStock = material.quantity <= material.min_quantity;
  const stockPercentage = material.min_quantity > 0 
    ? (material.quantity / material.min_quantity) * 100 
    : 100;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isLowStock ? 'border-orange-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {getCategoryIcon(material.category)}
              {material.name}
              {isLowStock && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Stock faible
                </Badge>
              )}
            </CardTitle>
            <Badge variant="secondary" className="mt-2 text-xs">
              {getCategoryLabel(material.category)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {material.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {material.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantité</span>
            <span className="font-semibold">
              {material.quantity} {material.unit}
            </span>
          </div>

          {material.min_quantity > 0 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Minimum</span>
              <span>{material.min_quantity} {material.unit}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valeur unitaire</span>
            <span className="font-semibold">{material.unit_price.toFixed(2)}€</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valeur totale</span>
            <span className="font-semibold text-primary">
              {(material.quantity * material.unit_price).toFixed(2)}€
            </span>
          </div>

          {material.location && (
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Emplacement</span>
              <span>{material.location}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMovement(material)}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Mouvement
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onHistory(material)}
          >
            <History className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(material)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer "{material.name}" ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(material.id)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default Inventory;

