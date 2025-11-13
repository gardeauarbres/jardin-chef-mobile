import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string;
  site_id: string;
  client_id: string;
  amount: number;
  type: string;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  sites?: {
    title: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

const Payments = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        sites (
          title
        ),
        clients (
          first_name,
          last_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des paiements");
    } else {
      setPayments(data || []);
    }
  };

  const getClientName = (payment: Payment) => {
    if (payment.clients) {
      return `${payment.clients.first_name} ${payment.clients.last_name}`;
    }
    return 'Client inconnu';
  };

  const getSiteName = (payment: Payment) => {
    return payment.sites?.title || 'Chantier inconnu';
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
      const dateA = a.due_date || a.created_at;
      const dateB = b.due_date || b.created_at;
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

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success('Paiement supprimé');
      fetchPayments();
    }

    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

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
                      <h3 className="font-semibold">{getSiteName(payment)}</h3>
                      <p className="text-sm text-muted-foreground">{getClientName(payment)}</p>
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
                    {payment.status === 'paid' && payment.paid_date ? (
                      <span>Payé le {new Date(payment.paid_date).toLocaleDateString('fr-FR')}</span>
                    ) : payment.due_date ? (
                      <span>Échéance: {new Date(payment.due_date).toLocaleDateString('fr-FR')}</span>
                    ) : (
                      <span>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
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
