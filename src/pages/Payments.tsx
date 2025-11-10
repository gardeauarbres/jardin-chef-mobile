import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPayments, getClients, getSites } from '@/lib/storage';
import MobileNav from '@/components/MobileNav';
import { Euro, Calendar } from 'lucide-react';

const Payments = () => {
  const payments = useMemo(() => getPayments(), []);
  const clients = useMemo(() => getClients(), []);
  const sites = useMemo(() => getSites(), []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.title || 'Chantier inconnu';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string }> = {
      deposit: { label: 'Acompte' },
      progress: { label: 'Avancement' },
      final: { label: 'Solde' },
    };
    return <Badge variant="outline">{variants[type]?.label || type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge variant="default" className="bg-success">Payé</Badge>
    ) : (
      <Badge variant="secondary">En attente</Badge>
    );
  };

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      // Pending payments first
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      // Then by due date or creation date
      const dateA = a.dueDate || a.createdAt;
      const dateB = b.dueDate || b.createdAt;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [payments]);

  const pendingTotal = useMemo(() => {
    return payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <p className="text-sm opacity-90 mt-1">{payments.length} paiement{payments.length !== 1 ? 's' : ''}</p>
      </header>

      {pendingTotal > 0 && (
        <div className="p-4">
          <Card className="bg-warning/10 border-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-warning" />
                  <span className="font-medium">Total en attente</span>
                </div>
                <span className="text-2xl font-bold text-warning">{pendingTotal.toFixed(0)}€</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 space-y-3">
        {sortedPayments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucun paiement enregistré</p>
            </CardContent>
          </Card>
        ) : (
          sortedPayments.map((payment) => (
            <Card key={payment.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{getSiteName(payment.siteId)}</h3>
                    <p className="text-sm text-muted-foreground">{getClientName(payment.clientId)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {getTypeBadge(payment.type)}
                    {getStatusBadge(payment.status)}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {payment.status === 'paid' && payment.paidDate ? (
                      <span>Payé le {new Date(payment.paidDate).toLocaleDateString('fr-FR')}</span>
                    ) : payment.dueDate ? (
                      <span>Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}</span>
                    ) : (
                      <span>{new Date(payment.createdAt).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">{payment.amount.toFixed(2)}€</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Payments;
