import { useState, useMemo, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Clock, FileText, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes, usePayments, useEmployees, useTimesheets } from '@/hooks/useSupabaseQuery';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'invoice' | 'quote' | 'payment' | 'document' | 'timesheet';
  title: string;
  message: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  icon: typeof AlertCircle;
  color: string;
}

export const Notifications = () => {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissed-notifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const { data: invoices = [] } = useInvoices();
  const { data: quotes = [] } = useQuotes();
  const { data: payments = [] } = usePayments();
  const { data: employees = [] } = useEmployees();
  const { data: timesheets = [] } = useTimesheets();

  // Générer les notifications
  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const today = new Date();

    // 1. Factures en retard
    invoices.forEach((invoice: any) => {
      if (invoice.status === 'overdue' || 
          (invoice.status === 'sent' && invoice.due_date && isAfter(today, new Date(invoice.due_date)))) {
        const daysLate = differenceInDays(today, new Date(invoice.due_date));
        notifs.push({
          id: `invoice-overdue-${invoice.id}`,
          type: 'invoice',
          title: 'Facture en retard',
          message: `Facture ${invoice.invoice_number} en retard de ${daysLate} jour${daysLate > 1 ? 's' : ''} (${invoice.total_amount.toFixed(2)}€)`,
          date: new Date(invoice.due_date),
          priority: daysLate > 30 ? 'high' : daysLate > 7 ? 'medium' : 'low',
          actionUrl: '/invoices',
          icon: AlertCircle,
          color: 'text-red-500',
        });
      }
    });

    // 2. Factures à envoyer (brouillons)
    const draftInvoices = invoices.filter((inv: any) => inv.status === 'draft');
    if (draftInvoices.length > 0) {
      notifs.push({
        id: 'invoices-draft',
        type: 'invoice',
        title: 'Factures en brouillon',
        message: `${draftInvoices.length} facture${draftInvoices.length > 1 ? 's' : ''} à envoyer`,
        date: today,
        priority: 'medium',
        actionUrl: '/invoices',
        icon: FileText,
        color: 'text-yellow-500',
      });
    }

    // 3. Devis expirant bientôt (dans 7 jours)
    quotes.forEach((quote: any) => {
      if (quote.status === 'sent' && quote.valid_until) {
        const validUntil = new Date(quote.valid_until);
        const daysUntilExpiry = differenceInDays(validUntil, today);
        
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
          notifs.push({
            id: `quote-expiring-${quote.id}`,
            type: 'quote',
            title: 'Devis expire bientôt',
            message: `Devis "${quote.title}" expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`,
            date: validUntil,
            priority: daysUntilExpiry <= 2 ? 'high' : 'medium',
            actionUrl: '/quotes',
            icon: Clock,
            color: 'text-orange-500',
          });
        }
      }
    });

    // 4. Paiements en attente
    const pendingPayments = payments.filter((p: any) => p.status === 'pending');
    if (pendingPayments.length > 0) {
      const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      notifs.push({
        id: 'payments-pending',
        type: 'payment',
        title: 'Paiements en attente',
        message: `${pendingPayments.length} paiement${pendingPayments.length > 1 ? 's' : ''} en attente (${totalPending.toFixed(2)}€)`,
        date: today,
        priority: 'medium',
        actionUrl: '/payments',
        icon: Euro,
        color: 'text-blue-500',
      });
    }

    // 5. Heures non payées (employés)
    const unpaidTimesheets = timesheets.filter((ts: any) => ts.status === 'due');
    if (unpaidTimesheets.length > 0) {
      const employeesWithUnpaid = new Set(unpaidTimesheets.map((ts: any) => ts.employee_id));
      notifs.push({
        id: 'timesheets-unpaid',
        type: 'timesheet',
        title: 'Heures à payer',
        message: `${unpaidTimesheets.length} heure${unpaidTimesheets.length > 1 ? 's' : ''} à payer pour ${employeesWithUnpaid.size} employé${employeesWithUnpaid.size > 1 ? 's' : ''}`,
        date: today,
        priority: 'medium',
        actionUrl: '/employees',
        icon: Clock,
        color: 'text-purple-500',
      });
    }

    // Filtrer les notifications rejetées et trier par priorité et date
    return notifs
      .filter(n => !dismissedIds.has(n.id))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.date.getTime() - a.date.getTime();
      });
  }, [invoices, quotes, payments, timesheets, dismissedIds]);

  const dismissNotification = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-notifications', JSON.stringify([...newDismissed]));
  };

  const clearAllNotifications = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setDismissedIds(allIds);
    localStorage.setItem('dismissed-notifications', JSON.stringify([...allIds]));
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative min-h-[44px] min-w-[44px]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Aucune notification</p>
              <p className="text-xs mt-1">Vous êtes à jour ! 🎉</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative",
                    notif.priority === 'high' && "bg-red-50 dark:bg-red-950/20"
                  )}
                  onClick={() => {
                    if (notif.actionUrl) {
                      navigate(notif.actionUrl);
                    }
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notif.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="flex gap-3 pr-8">
                    <div className={cn("flex-shrink-0 mt-1", notif.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{notif.title}</h4>
                        {notif.priority === 'high' && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(notif.date, 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

