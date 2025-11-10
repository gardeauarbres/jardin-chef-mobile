import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSites, getClients } from '@/lib/storage';
import MobileNav from '@/components/MobileNav';

const Sites = () => {
  const sites = useMemo(() => getSites(), []);
  const clients = useMemo(() => getClients(), []);

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
              <Card key={site.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{site.title}</h3>
                      <p className="text-sm text-muted-foreground">{getClientName(site.clientId)}</p>
                    </div>
                    {getStatusBadge(site.status)}
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

      <MobileNav />
    </div>
  );
};

export default Sites;
