import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { getSites, getClients, deleteSite } from '@/lib/storage';
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

const Sites = () => {
  const [sites, setSites] = useState(getSites());
  const [clients] = useState(getClients());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      active: { variant: 'default', label: 'En cours' },
      completed: { variant: 'secondary', label: 'Terminé' },
      paused: { variant: 'outline', label: 'En pause' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = (paidAmount: number, totalAmount: number) => {
    return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  };

  const handleDeleteClick = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (siteToDelete) {
      deleteSite(siteToDelete);
      setSites(getSites());
      toast.success('Chantier supprimé');
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    }
  };

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
            const progress = calculateProgress(site.paidAmount, site.totalAmount);
            const remainingAmount = site.totalAmount - site.paidAmount;

            return (
              <Card key={site.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{site.title}</h3>
                      <p className="text-sm text-muted-foreground">{getClientName(site.clientId)}</p>
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
                        {site.paidAmount.toFixed(0)}€ / {site.totalAmount.toFixed(0)}€
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% payé</span>
                      <span>Reste: {remainingAmount.toFixed(0)}€</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                    <span>Début: {new Date(site.startDate).toLocaleDateString('fr-FR')}</span>
                    {site.endDate && (
                      <span>Fin: {new Date(site.endDate).toLocaleDateString('fr-FR')}</span>
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};

export default Sites;
