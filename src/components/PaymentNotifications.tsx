import { useEffect } from 'react';
import { usePayments } from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export const PaymentNotifications = () => {
  // ============================================
  // TOUS LES HOOKS DOIVENT ÊTRE ICI, AVANT TOUT RETURN
  // ============================================
  
  // 1. Hooks de contexte (toujours appelés)
  const { user, loading } = useAuth();
  
  // 2. Hooks de données (toujours appelés, même si user est null)
  const paymentsQuery = usePayments();
  
  // 3. Normaliser les données (toujours exécuté)
  const payments = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];

  // 4. Calculer les paiements (toujours exécuté)
  const overduePayments = payments.filter(p => {
    if (p.status !== 'pending') return false;
    if (!p.due_date) return false;
    const dueDate = new Date(p.due_date);
    return dueDate < new Date();
  });

  const upcomingPayments = payments.filter(p => {
    if (p.status !== 'pending') return false;
    if (!p.due_date) return false;
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);
    const dueDate = new Date(p.due_date);
    return dueDate >= now && dueDate <= in7Days;
  });

  // 5. useEffect (toujours appelés dans le même ordre)
  useEffect(() => {
    // Ne rien faire si l'utilisateur n'est pas connecté ou en cours de chargement
    if (loading || !user) return;
    
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
  }, [loading, user, overduePayments.length]);

  useEffect(() => {
    // Ne rien faire si l'utilisateur n'est pas connecté ou en cours de chargement
    if (loading || !user) return;
    
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
  }, [loading, user, upcomingPayments.length, overduePayments.length]);

  // 6. Return (toujours appelé)
  return null; // Ce composant ne rend rien visuellement
};

