import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/Pagination';
import { SortableList, SortOption } from '@/components/SortableList';
import { DateRangeFilter } from '@/components/DateFilter';
import { Trash2, Plus, Search, Filter } from 'lucide-react';
import MobileNav from '@/components/MobileNav';
import { NavigationDialog } from '@/components/NavigationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useSites, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Site {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  paid_amount: number;
  client_id: string;
  clients?: {
    first_name: string;
    last_name: string;
    address: string;
  };
}

const ITEMS_PER_PAGE = 10;

const Sites = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Utiliser le hook optimisé avec cache
  const { data: sites = [], isLoading } = useSites();

  // Mutation optimisée pour la suppression
  const deleteMutation = useSupabaseMutation(
    async (siteId: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);
      
      if (error) throw error;
      return siteId;
    },
    [['sites', user?.id || '']],
    {
      onSuccess: () => {
        toast.success('Chantier supprimé');
        setDeleteDialogOpen(false);
        setSiteToDelete(null);
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
      },
    }
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Optimisation: useCallback pour éviter les re-créations
  const getClientName = useCallback((site: Site) => {
    if (site.clients) {
      return `${site.clients.first_name} ${site.clients.last_name}`;
    }
    return 'Client inconnu';
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      active: { variant: 'default', label: 'En cours' },
      completed: { variant: 'secondary', label: 'Terminé' },
      paused: { variant: 'outline', label: 'En pause' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, []);

  const calculateProgress = useCallback((paidAmount: number, totalAmount: number) => {
    return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  }, []);

  const handleDeleteClick = useCallback((siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!siteToDelete) return;
    deleteMutation.mutate(siteToDelete);
  }, [siteToDelete, deleteMutation]);

  // Filtrage et recherche
  const filteredSites = useMemo(() => {
    let filtered = sites;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        getClientName(s).toLowerCase().includes(term)
      );
    }

    // Filtre par date de début
    if (startDate || endDate) {
      filtered = filtered.filter(s => {
        const startDateObj = new Date(s.start_date);
        if (startDate && startDateObj < startDate) return false;
        if (endDate && startDateObj > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [sites, statusFilter, searchTerm, startDate, endDate, getClientName]);

  // Pagination
  const totalPages = Math.ceil(filteredSites.length / ITEMS_PER_PAGE);
  const paginatedSites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredSites.slice(start, end);
  }, [filteredSites, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-primary-foreground p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chantiers</h1>
            <p className="text-sm opacity-90 mt-1">{filteredSites.length} chantier{filteredSites.length !== 1 ? 's' : ''}{filteredSites.length !== sites.length ? ` sur ${sites.length}` : ''}</p>
          </div>
          <Button onClick={() => navigate('/sites/new')} size="icon" variant="secondary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {/* Barre de recherche et filtres */}
        {sites.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chantier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}

        <SortableList
          items={filteredSites}
          sortOptions={[
            { key: 'start_date', label: 'Date de début', getValue: (s) => new Date(s.start_date) },
            { key: 'created_at', label: 'Date de création', getValue: (s) => new Date((s as any).created_at || s.start_date) },
            { key: 'title', label: 'Titre' },
            { key: 'total_amount', label: 'Montant total', getValue: (s) => s.total_amount || 0 },
            { key: 'status', label: 'Statut' },
          ] as SortOption<Site>[]}
          defaultSort={{ key: 'start_date', direction: 'desc' }}
        >
          {(sortedSites) => {
            // Pagination sur les chantiers triés
            const totalPages = Math.ceil(sortedSites.length / ITEMS_PER_PAGE);
            const paginatedSites = useMemo(() => {
              const start = (currentPage - 1) * ITEMS_PER_PAGE;
              const end = start + ITEMS_PER_PAGE;
              return sortedSites.slice(start, end);
            }, [sortedSites, currentPage]);

            return (
              <>
                {paginatedSites.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucun chantier en cours</p>
              <p className="text-xs text-muted-foreground mt-2">
                Les chantiers peuvent être créés automatiquement depuis les devis acceptés ou manuellement
              </p>
              <Button onClick={() => navigate('/sites/new')} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un chantier
              </Button>
            </CardContent>
          </Card>
        ) : (
          paginatedSites.map((site) => {
            const progress = calculateProgress(site.paid_amount, site.total_amount);
            const remainingAmount = site.total_amount - site.paid_amount;

            return (
            <Card key={site.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in" onClick={() => navigate(`/sites/${site.id}`)}>
              <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{site.title}</h3>
                      <p className="text-sm text-muted-foreground">{getClientName(site)}</p>
                      {site.clients?.address && (
                        <p className="text-xs text-muted-foreground mt-1">{site.clients.address}</p>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      {getStatusBadge(site.status)}
                      {site.clients?.address && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <NavigationDialog
                            address={site.clients.address}
                            title=""
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            showIcon={true}
                          />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8"
                        onClick={(e) => handleDeleteClick(site.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paiement</span>
                      <span className="font-medium">
                        {site.paid_amount.toFixed(0)}€ / {site.total_amount.toFixed(0)}€
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% payé</span>
                      <span>Reste: {remainingAmount.toFixed(0)}€</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                    <span>Début: {new Date(site.start_date).toLocaleDateString('fr-FR')}</span>
                    {site.end_date && (
                      <span>Fin: {new Date(site.end_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </CardContent>
            </Card>
          );
        })
        )}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            );
          }}
        </SortableList>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le chantier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le chantier sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};

export default Sites;
