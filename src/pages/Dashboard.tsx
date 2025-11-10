import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Hammer, Euro, TrendingUp } from 'lucide-react';
import { getClients, getSites, getPayments, getQuotes } from '@/lib/storage';
import { useMemo } from 'react';
import MobileNav from '@/components/MobileNav';

const Dashboard = () => {
  const stats = useMemo(() => {
    const clients = getClients();
    const sites = getSites();
    const payments = getPayments();
    const quotes = getQuotes();

    const activeSites = sites.filter(s => s.status === 'active').length;
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;

    return {
      totalClients: clients.length,
      activeSites,
      totalPending,
      acceptedQuotes,
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <h1 className="text-2xl font-bold">Chantier Mika</h1>
        <p className="text-sm opacity-90 mt-1">Tableau de bord</p>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hammer className="h-4 w-4 text-success" />
                Chantiers actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Devis acceptés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptedQuotes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4 text-warning" />
                À encaisser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending.toFixed(0)}€</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Commencez par ajouter vos clients et créer des devis.
            </p>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
