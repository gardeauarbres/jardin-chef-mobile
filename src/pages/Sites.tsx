import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import MobileNav from '@/components/MobileNav';
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
  };
}

const Sites = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

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
        <h1 className="text-2xl font-bold">Chantiers</h1>
        <p className="text-sm opacity-90 mt-1">{sites.length} chantier{sites.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="p-4 space-y-3">
        {sites.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucun chantier en cours</p>
              <p className="text-xs text-muted-foreground mt-2">
                Les chantiers sont créés à partir des devis acceptés
              </p>
            </CardContent>
          </Card>
        ) : (
          sites.map((site) => {
            const progress = calculateProgress(site.paid_amount, site.total_amount);
            const remainingAmount = site.total_amount - site.paid_amount;

            return (
              <Card key={site.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{site.title}</h3>
                      <p className="text-sm text-muted-foreground">{getClientName(site)}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      {getStatusBadge(site.status)}
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
