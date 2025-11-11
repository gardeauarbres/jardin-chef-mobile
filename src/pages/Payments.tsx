import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPayments, getClients, getSites, deletePayment } from '@/lib/storage';
import MobileNav from '@/components/MobileNav';
import { Euro, Calendar, Trash2 } from 'lucide-react';
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

const Payments = () => {
  const [payments, setPayments] = useState(getPayments());
  const clients = useMemo(() => getClients(), []);
  const sites = useMemo(() => getSites(), []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (paymentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete);
      setPayments(getPayments());
      toast.success('Paiement supprimé');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

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
            <Card key={payment.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getSiteName(payment.siteId)}</h3>
                    <p className="text-sm text-muted-foreground">{getClientName(payment.clientId)}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right space-y-1">
                      {getTypeBadge(payment.type)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8"
                      onClick={(e) => handleDeleteClick(payment.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le paiement sera définitivement supprimé.
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

export default Payments;
