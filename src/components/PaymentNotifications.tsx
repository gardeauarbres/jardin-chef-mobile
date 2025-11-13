import { useEffect, useMemo } from 'react';
import { usePayments } from '@/hooks/useSupabaseQuery';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export const PaymentNotifications = () => {
  const { data: payments = [] } = usePayments();

  const overduePayments = useMemo(() => {
    const now = new Date();
    return payments.filter(p => {
      if (p.status !== 'pending') return false;
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      return dueDate < now;
    });
  }, [payments]);

  const upcomingPayments = useMemo(() => {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);
    
    return payments.filter(p => {
      if (p.status !== 'pending') return false;
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      return dueDate >= now && dueDate <= in7Days;
    });
  }, [payments]);

  useEffect(() => {
    // Afficher une notification pour les paiements en retard
    if (overduePayments.length > 0) {
      const total = overduePayments.reduce((sum, p) => sum + p.amount, 0);
      toast.warning(
        `${overduePayments.length} paiement${overduePayments.length > 1 ? 's' : ''} en retard (${total.toFixed(2)}€)`,
        {
          duration: 5000,
          icon: <Bell className="h-4 w-4" />,
        }
      );
    }
  }, [overduePayments.length]); // Seulement quand le nombre change

  useEffect(() => {
    // Afficher une notification pour les paiements à venir
    if (upcomingPayments.length > 0 && overduePayments.length === 0) {
      const total = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
      toast.info(
        `${upcomingPayments.length} paiement${upcomingPayments.length > 1 ? 's' : ''} à venir dans les 7 jours (${total.toFixed(2)}€)`,
        {
          duration: 4000,
          icon: <Bell className="h-4 w-4" />,
        }
      );
    }
  }, [upcomingPayments.length, overduePayments.length]);

  return null; // Ce composant ne rend rien visuellement
};

