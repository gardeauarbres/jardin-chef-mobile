import { ReminderSystem } from '@/components/ReminderSystem';
import { useInvoices } from '@/hooks/useInvoices';
import MobileNav from '@/components/MobileNav';
import { Bell } from 'lucide-react';

const Reminders = () => {
  const { data: invoices = [] } = useInvoices();

  return (
    <div className="container mx-auto p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          Rappels de paiement
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez et envoyez des rappels automatiques pour vos factures impayées
        </p>
      </div>

      <ReminderSystem invoices={invoices} />

      <MobileNav />
    </div>
  );
};

export default Reminders;

