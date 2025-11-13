import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Hammer, Euro, TrendingUp, LogOut } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSites: 0,
    totalPending: 0,
    acceptedQuotes: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [clientsRes, quotesRes, sitesRes, paymentsRes, profileRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('quotes').select('*').eq('user_id', user.id),
        supabase.from('sites').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
      ]);

      const activeSites = sitesRes.data?.filter(s => s.status === 'active').length || 0;
      const pendingPayments = paymentsRes.data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalClients: clientsRes.data?.length || 0,
        activeSites,
        totalPending: pendingPayments,
        acceptedQuotes: quotesRes.data?.filter(q => q.status === 'accepted').length || 0,
      });

      if (profileRes.data) {
        const fullName = `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim();
        setUserName(fullName || 'Utilisateur');
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{userName || 'Chargement...'}</h1>
            <p className="text-sm opacity-90 mt-1">Tableau de bord</p>
          </div>
          <Button variant="secondary" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
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
