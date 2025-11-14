import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Hammer, Euro, TrendingUp, LogOut, Moon, Sun, Calendar, Target, CheckCircle2, Download, Mail, User, X, Eye, EyeOff, Bell, Package } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useClients, useQuotes, useSites, usePayments, useEmployees, useTimesheets } from '@/hooks/useSupabaseQuery';
import { useInvoices, InvoiceWithRelations } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { ThemeColorPicker } from '@/components/ThemeColorPicker';
import { AIAssistant } from '@/components/AIAssistant';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DataExport } from '@/components/DataExport';
import { Notifications } from '@/components/Notifications';
import { AdvancedStats } from '@/components/AdvancedStats';
import { ReminderSystem } from '@/components/ReminderSystem';
import { exportEmployeePayrollToPDF, exportInvoiceToPDF } from '@/lib/pdfExport';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
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
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(() => {
    // Charger les cartes masquées depuis localStorage
    const saved = localStorage.getItem('dashboard-hidden-cards');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // 3. Refs pour stabilité
  const hasNavigatedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  
  // 4. Hooks de données React Query (toujours appelés, même si user est null)
  const clientsQuery = useClients();
  const quotesQuery = useQuotes();
  const sitesQuery = useSites();
  const paymentsQuery = usePayments();
  const employeesQuery = useEmployees();
  const timesheetsQuery = useTimesheets();
  const invoicesQuery = useInvoices();
  const { data: companyProfile } = useCompanyProfile();
  
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

  const employees = useMemo(() => {
    return Array.isArray(employeesQuery.data) ? employeesQuery.data : [];
  }, [employeesQuery.data]);

  const timesheets = useMemo(() => {
    return Array.isArray(timesheetsQuery.data) ? timesheetsQuery.data : [];
  }, [timesheetsQuery.data]);

  const invoices = useMemo(() => {
    return Array.isArray(invoicesQuery.data) ? invoicesQuery.data : [];
  }, [invoicesQuery.data]);

  const computedStats = useMemo(() => {
    const activeSites = sites.filter((s: any) => s?.status === 'active').length;
    const completedSites = sites.filter((s: any) => s?.status === 'completed').length;
    const pendingPayments = payments
      .filter((p: any) => p?.status === 'pending')
      .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);
    const paidPayments = payments
      .filter((p: any) => p?.status === 'paid')
      .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);
    const acceptedQuotes = quotes.filter((q: any) => q?.status === 'accepted').length;
    const totalQuotes = quotes.length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    
    // Revenus totaux (paiements payés + montants payés des chantiers)
    const totalRevenue = paidPayments + sites.reduce((sum: number, s: any) => sum + (s?.paid_amount || 0), 0);
    
    // Montant total des devis acceptés
    const acceptedQuotesAmount = quotes
      .filter((q: any) => q?.status === 'accepted')
      .reduce((sum: number, q: any) => sum + (q?.amount || 0), 0);
    
    // Statistiques du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyQuotes = quotes.filter((q: any) => {
      const created = new Date(q.created_at);
      return created >= startOfMonth;
    }).length;
    const monthlyRevenue = payments
      .filter((p: any) => {
        if (p.status !== 'paid' || !p.paid_date) return false;
        const paid = new Date(p.paid_date);
        return paid >= startOfMonth;
      })
      .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);

    return {
      totalClients: clients.length,
      activeSites,
      completedSites,
      totalPending: pendingPayments,
      totalRevenue,
      acceptedQuotes,
      totalQuotes,
      conversionRate,
      acceptedQuotesAmount,
      monthlyQuotes,
      monthlyRevenue,
    };
  }, [clients, quotes, sites, payments]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    const statusData = [
      { name: 'Brouillon', value: quotes.filter((q: any) => q?.status === 'draft').length },
      { name: 'Envoyé', value: quotes.filter((q: any) => q?.status === 'sent').length },
      { name: 'Accepté', value: quotes.filter((q: any) => q?.status === 'accepted').length },
      { name: 'Refusé', value: quotes.filter((q: any) => q?.status === 'rejected').length },
    ];

    const siteStatusData = [
      { name: 'En cours', value: sites.filter((s: any) => s?.status === 'active').length },
      { name: 'Terminé', value: sites.filter((s: any) => s?.status === 'completed').length },
      { name: 'En pause', value: sites.filter((s: any) => s?.status === 'paused').length },
    ];

    return { statusData, siteStatusData };
  }, [quotes, sites]);

  const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444'];

  // Documents à envoyer
  const documentsToSend = useMemo(() => {
    // Fiches de paie pour tous les employés avec timesheets
    const employeePayrolls = employees
      .map((employee: any) => {
        const empTimesheets = timesheets.filter((ts: any) => ts.employee_id === employee.id);
        const unpaidTimesheets = empTimesheets.filter((ts: any) => ts.status === 'due');
        
        // Inclure tous les employés qui ont des timesheets
        if (empTimesheets.length > 0) {
          return {
            type: 'employee' as const,
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            employee,
            timesheets: empTimesheets,
            unpaidCount: unpaidTimesheets.length,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Toutes les factures (pas seulement celles non payées)
    const invoicesToSend = invoices
      .map((invoice: InvoiceWithRelations) => ({
        type: 'invoice' as const,
        id: invoice.id,
        invoice,
        clientName: invoice.clients
          ? `${invoice.clients.first_name} ${invoice.clients.last_name}`
          : 'Client inconnu',
        amount: invoice.total_amount,
        status: invoice.status,
        dueDate: invoice.due_date,
      }));

    // Log pour vérification (peut être retiré en production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Documents à envoyer:', {
        fiches_de_paie: employeePayrolls.length,
        factures: invoicesToSend.length,
      });
    }

    return {
      employees: employeePayrolls,
      invoices: invoicesToSend,
    };
  }, [employees, timesheets, invoices]);

  // Fonctions pour gérer les cartes masquées
  const toggleCard = (cardId: string) => {
    setHiddenCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      // Sauvegarder dans localStorage
      localStorage.setItem('dashboard-hidden-cards', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const showAllCards = () => {
    setHiddenCards(new Set());
    localStorage.removeItem('dashboard-hidden-cards');
    toast.success('Toutes les cartes sont affichées');
  };

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
                  {hiddenCards.size > 0 && (
                    <button
                      onClick={showAllCards}
                      className="text-xs mt-1 opacity-75 hover:opacity-100 underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Afficher toutes les cartes ({hiddenCards.size} masquée{hiddenCards.size > 1 ? 's' : ''})
                    </button>
                  )}
                </div>
                       <div className="flex items-center gap-2">
                         <div className="hidden md:block">
                           <GlobalSearch />
                         </div>
                         <div className="hidden md:block">
                           <DataExport />
                         </div>
                         <Notifications />
                         <AIAssistant />
                         <ThemeColorPicker />
                         <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="min-h-[44px] min-w-[44px]">
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
                  <Button variant="secondary" size="icon" onClick={signOut} className="min-h-[44px] min-w-[44px]">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Clients"
            value={computedStats.totalClients}
            icon={Users}
            iconColor="text-primary"
            description="Total de vos clients"
          />
          <StatsCard
            title="Chantiers actifs"
            value={computedStats.activeSites}
            icon={Hammer}
            iconColor="text-success"
            description={`${computedStats.completedSites} terminé${computedStats.completedSites > 1 ? 's' : ''}`}
          />
          <StatsCard
            title="Devis acceptés"
            value={computedStats.acceptedQuotes}
            icon={CheckCircle2}
            iconColor="text-success"
            description={`${computedStats.conversionRate.toFixed(0)}% de conversion`}
            trend={
              computedStats.totalQuotes > 0
                ? {
                    value: computedStats.conversionRate,
                    label: 'taux',
                    isPositive: computedStats.conversionRate >= 30,
                  }
                : undefined
            }
          />
          <StatsCard
            title="À encaisser"
            value={`${computedStats.totalPending.toFixed(0)}€`}
            icon={Euro}
            iconColor="text-warning"
            description="Paiements en attente"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Revenus totaux"
            value={`${computedStats.totalRevenue.toFixed(0)}€`}
            icon={TrendingUp}
            iconColor="text-success"
            description={`${computedStats.monthlyRevenue.toFixed(0)}€ ce mois`}
          />
          <StatsCard
            title="Devis ce mois"
            value={computedStats.monthlyQuotes}
            icon={Calendar}
            iconColor="text-primary"
            description={`${computedStats.totalQuotes} au total`}
          />
        </div>

        {/* Section Documents à envoyer */}
        {!hiddenCards.has('documents') && (
          <Card className="border-2 border-primary/20 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100"
              onClick={() => toggleCard('documents')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg pr-10">
                <FileText className="h-5 w-5 text-primary" />
                Documents à envoyer
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            {/* Fiches de paie pour les employés */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Fiches de paie ({documentsToSend.employees.length})
              </h3>
              {documentsToSend.employees.length > 0 ? (
                <div className="space-y-2">
                  {documentsToSend.employees.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.unpaidCount > 0
                            ? `${doc.unpaidCount} heure${doc.unpaidCount > 1 ? 's' : ''} non payée${doc.unpaidCount > 1 ? 's' : ''}`
                            : `${doc.timesheets.length} heure${doc.timesheets.length > 1 ? 's' : ''} enregistrée${doc.timesheets.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 flex-shrink-0"
                        onClick={() => {
                          try {
                            exportEmployeePayrollToPDF(
                              {
                                id: doc.employee.id,
                                first_name: doc.employee.first_name,
                                last_name: doc.employee.last_name,
                                hourly_rate: doc.employee.hourly_rate,
                                timesheets: doc.timesheets.map((ts: any) => ({
                                  id: ts.id,
                                  date: ts.date,
                                  hours: ts.hours,
                                  status: ts.status,
                                  paid_date: ts.paid_date,
                                })),
                              },
                              userName,
                              companyProfile || undefined
                            );
                            toast.success('Fiche de paie générée');
                          } catch (error) {
                            console.error('Erreur lors de la génération du PDF:', error);
                            toast.error('Erreur lors de la génération du PDF');
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs py-2">
                  Aucun employé avec des heures enregistrées
                </p>
              )}
            </div>

            {/* Factures pour les clients */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Factures ({documentsToSend.invoices.length})
              </h3>
              {documentsToSend.invoices.length > 0 ? (
                <div className="space-y-2">
                  {documentsToSend.invoices.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {doc.invoice.invoice_number} - {doc.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.amount.toFixed(2)}€ • Échéance: {format(new Date(doc.dueDate), 'dd/MM/yyyy', { locale: fr })} • {doc.status === 'paid' ? 'Payée' : doc.status === 'sent' ? 'Envoyée' : doc.status === 'draft' ? 'Brouillon' : doc.status === 'overdue' ? 'En retard' : 'Annulée'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 flex-shrink-0"
                        onClick={() => {
                          try {
                            exportInvoiceToPDF(
                              {
                                id: doc.invoice.id,
                                invoice_number: doc.invoice.invoice_number,
                                title: doc.invoice.title,
                                description: doc.invoice.description || null,
                                amount: doc.invoice.amount,
                                tax_rate: doc.invoice.tax_rate || null,
                                tax_amount: doc.invoice.tax_amount,
                                total_amount: doc.invoice.total_amount,
                                issue_date: doc.invoice.issue_date,
                                due_date: doc.invoice.due_date,
                                status: doc.invoice.status,
                                client: doc.invoice.clients
                                  ? {
                                      first_name: doc.invoice.clients.first_name,
                                      last_name: doc.invoice.clients.last_name,
                                      email: doc.invoice.clients.email,
                                      phone: undefined,
                                      address: doc.invoice.clients.address || undefined,
                                    }
                                  : undefined,
                              },
                              userName,
                              companyProfile || undefined
                            );
                            toast.success('Facture générée');
                          } catch (error) {
                            console.error('Erreur lors de la génération du PDF:', error);
                            toast.error('Erreur lors de la génération du PDF');
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs py-2">
                  Aucune facture disponible
                </p>
              )}
            </div>
          </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {!hiddenCards.has('quotes-status') && (
            <Card className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-10"
                onClick={() => toggleCard('quotes-status')}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-10">
                  <FileText className="h-5 w-5 text-primary" />
                  Statut des devis
                </CardTitle>
              </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Aucun devis pour le moment
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
            </Card>
          )}

          {!hiddenCards.has('sites-status') && (
            <Card className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-10"
                onClick={() => toggleCard('sites-status')}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-10">
                  <Hammer className="h-5 w-5 text-success" />
                  Statut des chantiers
                </CardTitle>
              </CardHeader>
            <CardContent>
              {sites.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Aucun chantier pour le moment
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData.siteStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.siteStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
            </Card>
          )}
        </div>

        {!hiddenCards.has('overview') && (
          <Card className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-10"
              onClick={() => toggleCard('overview')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 pr-10">
                <TrendingUp className="h-5 w-5 text-primary" />
              Vue d'ensemble
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {clients.length === 0 && quotes.length === 0
                ? 'Commencez par ajouter vos clients et créer des devis.'
                : `Vous avez ${clients.length} client${clients.length > 1 ? 's' : ''}, ${quotes.length} devis, et ${sites.length} chantier${sites.length > 1 ? 's' : ''}.`}
            </p>
          </CardContent>
          </Card>
        )}

        {/* Statistiques avancées */}
        {!hiddenCards.has('advanced-stats') && (
          <Card className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 opacity-60 hover:opacity-100 z-20"
              onClick={() => toggleCard('advanced-stats')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              <AdvancedStats
                invoices={invoices}
                quotes={quotes}
                sites={sites}
                payments={payments}
                clients={clients}
              />
            </CardContent>
          </Card>
        )}

        {/* Gestion des stocks */}
        {!hiddenCards.has('inventory') && (
          <Card className="relative border-2 border-purple-500/20">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-20"
              onClick={() => toggleCard('inventory')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg pr-10">
                <Package className="h-5 w-5 text-purple-500" />
                Gestion des stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gérez vos matériaux, plantes, outils et produits
              </p>
              <Button
                onClick={() => navigate('/inventory')}
                className="w-full"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Accéder aux stocks
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Accès rapide aux templates d'emails */}
        {!hiddenCards.has('email-templates') && (
          <Card className="relative border-2 border-blue-500/20">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-20"
              onClick={() => toggleCard('email-templates')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg pr-10">
                <Mail className="h-5 w-5 text-blue-500" />
                Templates d'emails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Personnalisez vos emails pour factures, devis et rappels
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">Templates par défaut</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {(() => {
                      const saved = localStorage.getItem('email-templates');
                      const templates = saved ? JSON.parse(saved) : [];
                      return templates.filter((t: any) => !t.isDefault).length;
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground">Templates personnalisés</div>
                </div>
              </div>
              <Button
                onClick={() => navigate('/email-templates')}
                className="w-full"
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Gérer les templates
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Système de rappels - Vue compacte avec bouton pour accéder à la page complète */}
        {!hiddenCards.has('reminders') && (
          <Card className="relative border-2 border-orange-500/20">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-60 hover:opacity-100 z-20"
              onClick={() => toggleCard('reminders')}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg pr-10">
                <Bell className="h-5 w-5 text-orange-500" />
                Rappels de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const today = new Date();
                const overdueInvoices = invoices.filter((inv: any) => {
                  if (inv.status !== 'sent' && inv.status !== 'overdue') return false;
                  if (!inv.due_date) return false;
                  const dueDate = new Date(inv.due_date);
                  return today > dueDate;
                });

                const urgentCount = overdueInvoices.filter((inv: any) => {
                  const daysLate = Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                  return daysLate >= 30;
                }).length;

                const warningCount = overdueInvoices.filter((inv: any) => {
                  const daysLate = Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                  return daysLate >= 15 && daysLate < 30;
                }).length;

                const totalOverdue = overdueInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{urgentCount}</div>
                        <div className="text-xs text-muted-foreground">+30j retard</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{warningCount}</div>
                        <div className="text-xs text-muted-foreground">15-30j retard</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{overdueInvoices.length}</div>
                        <div className="text-xs text-muted-foreground">Total en retard</div>
                      </div>
                    </div>

                    {overdueInvoices.length > 0 && (
                      <div className="p-3 bg-orange-500/10 rounded-lg">
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                          Montant total en attente : {totalOverdue.toFixed(2)}€
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => navigate('/reminders')}
                      className="w-full"
                      variant={overdueInvoices.length > 0 ? 'default' : 'outline'}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {overdueInvoices.length > 0
                        ? `Gérer les ${overdueInvoices.length} facture${overdueInvoices.length > 1 ? 's' : ''} en retard`
                        : 'Voir tous les rappels'}
                    </Button>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
