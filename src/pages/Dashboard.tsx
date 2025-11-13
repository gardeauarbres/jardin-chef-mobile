import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Hammer, Euro, TrendingUp, LogOut, Moon, Sun } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useClients, useQuotes, useSites, usePayments } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { PaymentNotifications } from '@/components/PaymentNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  // Tous les hooks doivent être au début, dans le même ordre à chaque rendu
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSites: 0,
    totalPending: 0,
    acceptedQuotes: 0,
  });

  // Utiliser les hooks optimisés avec cache - TOUJOURS appelés, même si user est null
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: sites = [] } = useSites();
  const { data: payments = [] } = usePayments();

  // Calculer les stats avec useMemo - TOUJOURS appelé, jamais dans une condition
  const computedStats = useMemo(() => {
    // S'assurer que les données sont des tableaux avant de les utiliser
    const safeSites = Array.isArray(sites) ? sites : [];
    const safePayments = Array.isArray(payments) ? payments : [];
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    const safeClients = Array.isArray(clients) ? clients : [];

    const activeSites = safeSites.filter((s: any) => s?.status === 'active').length;
    const pendingPayments = safePayments
      .filter((p: any) => p?.status === 'pending')
      .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);
    const acceptedQuotes = safeQuotes.filter((q: any) => q?.status === 'accepted').length;

    return {
      totalClients: safeClients.length,
      activeSites,
      totalPending: pendingPayments,
      acceptedQuotes,
    };
  }, [clients, quotes, sites, payments]);

  // useEffect pour la redirection - TOUJOURS appelé
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // useEffect pour récupérer le profil - TOUJOURS appelé
  useEffect(() => {
    if (!user) return;

    // Récupérer le profil utilisateur
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (data) {
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        setUserName(fullName || 'Utilisateur');
      }
    };

    fetchProfile();
  }, [user]);

  // useEffect pour mettre à jour les stats - TOUJOURS appelé
  useEffect(() => {
    setStats(computedStats);
  }, [computedStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-primary-foreground p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </header>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
            <PaymentNotifications />
            <header className="bg-primary text-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{userName || 'Chargement...'}</h1>
                  <p className="text-sm opacity-90 mt-1">Tableau de bord</p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon">
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="h-4 w-4 mr-2" />
                        Clair
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="h-4 w-4 mr-2" />
                        Sombre
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>
                        Système
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="secondary" size="icon" onClick={signOut}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
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
