import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Hammer, Euro, TrendingUp, LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useClients, useQuotes, useSites, usePayments } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  // ============================================
  // TOUS LES HOOKS DOIVENT ÊTRE ICI, DANS LE MÊME ORDRE À CHAQUE RENDU
  // ============================================
  
  // 1. Hooks de contexte/routing (toujours appelés)
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // 2. useState (toujours appelés)
  const [userName, setUserName] = useState<string>("");
  
  // 3. Refs pour stabilité
  const hasNavigatedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  
  // 4. Hooks de données React Query (toujours appelés, même si user est null)
  const clientsQuery = useClients();
  const quotesQuery = useQuotes();
  const sitesQuery = useSites();
  const paymentsQuery = usePayments();
  
  // 5. Stabiliser user.id pour éviter les changements de référence
  const userId = useMemo(() => user?.id || null, [user?.id]);
  
  // 6. Un seul useEffect pour toutes les opérations liées à l'utilisateur
  useEffect(() => {
    // Gérer la navigation si pas d'utilisateur
    if (!loading && !user) {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigate("/auth");
      }
      return;
    }

    // Réinitialiser le flag de navigation si l'utilisateur existe
    if (user) {
      hasNavigatedRef.current = false;
    }

    // Charger le profil si l'utilisateur existe
    if (!user || !userId) {
      lastUserIdRef.current = null;
      return;
    }

    // Éviter les appels multiples pour le même utilisateur
    if (lastUserIdRef.current === userId) {
      return;
    }

    lastUserIdRef.current = userId;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (data) {
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        setUserName(fullName || 'Utilisateur');
      }
    };

    fetchProfile();
  }, [user, userId, loading, navigate]);

  // 7. Normaliser et calculer les stats avec useMemo pour stabilité
  const clients = useMemo(() => {
    return Array.isArray(clientsQuery.data) ? clientsQuery.data : [];
  }, [clientsQuery.data]);

  const quotes = useMemo(() => {
    return Array.isArray(quotesQuery.data) ? quotesQuery.data : [];
  }, [quotesQuery.data]);

  const sites = useMemo(() => {
    return Array.isArray(sitesQuery.data) ? sitesQuery.data : [];
  }, [sitesQuery.data]);

  const payments = useMemo(() => {
    return Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
  }, [paymentsQuery.data]);

  const computedStats = useMemo(() => {
    const activeSites = sites.filter((s: any) => s?.status === 'active').length;
    const pendingPayments = payments
      .filter((p: any) => p?.status === 'pending')
      .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);
    const acceptedQuotes = quotes.filter((q: any) => q?.status === 'accepted').length;

    return {
      totalClients: clients.length,
      activeSites,
      totalPending: pendingPayments,
      acceptedQuotes,
    };
  }, [clients, quotes, sites, payments]);

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
              <div className="text-2xl font-bold">{computedStats.totalClients}</div>
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
              <div className="text-2xl font-bold">{computedStats.activeSites}</div>
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
              <div className="text-2xl font-bold">{computedStats.acceptedQuotes}</div>
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
              <div className="text-2xl font-bold">{computedStats.totalPending.toFixed(0)}€</div>
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
