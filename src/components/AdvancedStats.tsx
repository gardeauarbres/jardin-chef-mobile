import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users, Euro, Target } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface AdvancedStatsProps {
  invoices: any[];
  quotes: any[];
  sites: any[];
  payments: any[];
  clients: any[];
}

const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdvancedStats = ({ invoices, quotes, sites, payments, clients }: AdvancedStatsProps) => {
  const [period, setPeriod] = useState<'6months' | '12months' | 'all'>('12months');

  // Calcul des revenus mensuels
  const monthlyRevenue = useMemo(() => {
    const months = period === '6months' ? 6 : period === '12months' ? 12 : 24;
    const startDate = subMonths(new Date(), months - 1);
    const endDate = new Date();
    
    const monthsArray = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return monthsArray.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Revenus des paiements payés
      const paidRevenue = payments
        .filter((p: any) => {
          if (p.status !== 'paid' || !p.paid_date) return false;
          const paidDate = parseISO(p.paid_date);
          return paidDate >= monthStart && paidDate <= monthEnd;
        })
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      
      // Revenus des factures payées
      const invoiceRevenue = invoices
        .filter((inv: any) => {
          if (inv.status !== 'paid' || !inv.issue_date) return false;
          const issueDate = parseISO(inv.issue_date);
          return issueDate >= monthStart && issueDate <= monthEnd;
        })
        .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      
      // Devis acceptés dans le mois
      const quotesAccepted = quotes
        .filter((q: any) => {
          if (q.status !== 'accepted' || !q.created_at) return false;
          const createdDate = parseISO(q.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        })
        .reduce((sum: number, q: any) => sum + (q.amount || 0), 0);
      
      return {
        month: format(monthDate, 'MMM yyyy', { locale: fr }),
        revenus: Math.round(paidRevenue + invoiceRevenue),
        devis: Math.round(quotesAccepted),
        total: Math.round(paidRevenue + invoiceRevenue + quotesAccepted),
      };
    });
  }, [payments, invoices, quotes, period]);

  // Évolution des chantiers
  const sitesEvolution = useMemo(() => {
    const months = period === '6months' ? 6 : period === '12months' ? 12 : 24;
    const startDate = subMonths(new Date(), months - 1);
    const endDate = new Date();
    
    const monthsArray = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return monthsArray.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const active = sites.filter((s: any) => {
        if (!s.start_date) return false;
        const startDate = parseISO(s.start_date);
        return startDate <= monthEnd && (!s.end_date || parseISO(s.end_date) >= monthStart);
      }).length;
      
      const completed = sites.filter((s: any) => {
        if (s.status !== 'completed' || !s.end_date) return false;
        const endDate = parseISO(s.end_date);
        return endDate >= monthStart && endDate <= monthEnd;
      }).length;
      
      return {
        month: format(monthDate, 'MMM yyyy', { locale: fr }),
        actifs: active,
        terminés: completed,
      };
    });
  }, [sites, period]);

  // Top clients par revenus
  const topClients = useMemo(() => {
    const clientRevenue = new Map<string, { name: string; revenue: number }>();
    
    // Revenus des paiements
    payments.forEach((payment: any) => {
      if (payment.status === 'paid' && payment.clients) {
        const clientId = payment.client_id;
        const clientName = `${payment.clients.first_name} ${payment.clients.last_name}`;
        const current = clientRevenue.get(clientId) || { name: clientName, revenue: 0 };
        current.revenue += payment.amount || 0;
        clientRevenue.set(clientId, current);
      }
    });
    
    // Revenus des factures
    invoices.forEach((invoice: any) => {
      if (invoice.status === 'paid' && invoice.clients) {
        const clientId = invoice.client_id;
        const clientName = `${invoice.clients.first_name} ${invoice.clients.last_name}`;
        const current = clientRevenue.get(clientId) || { name: clientName, revenue: 0 };
        current.revenue += invoice.total_amount || 0;
        clientRevenue.set(clientId, current);
      }
    });
    
    return Array.from(clientRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(client => ({
        name: client.name,
        revenu: Math.round(client.revenue),
      }));
  }, [payments, invoices]);

  // Taux de conversion des devis
  const conversionRate = useMemo(() => {
    const statusCount = {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
    };
    
    quotes.forEach((quote: any) => {
      if (quote.status in statusCount) {
        statusCount[quote.status as keyof typeof statusCount]++;
      }
    });
    
    return [
      { name: 'Acceptés', value: statusCount.accepted, color: '#4ade80' },
      { name: 'Envoyés', value: statusCount.sent, color: '#60a5fa' },
      { name: 'Refusés', value: statusCount.rejected, color: '#ef4444' },
      { name: 'Brouillons', value: statusCount.draft, color: '#94a3b8' },
    ];
  }, [quotes]);

  // KPIs
  const kpis = useMemo(() => {
    const totalRevenue = payments
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const totalInvoiced = invoices
      .filter((inv: any) => inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
    
    const total = totalRevenue + totalInvoiced;
    
    const avgPerClient = clients.length > 0 ? total / clients.length : 0;
    
    const acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted').length;
    const totalQuotes = quotes.length;
    const conversionPercent = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    
    // Calcul du mois précédent pour la tendance
    const lastMonth = subMonths(new Date(), 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    
    const lastMonthRevenue = payments
      .filter((p: any) => {
        if (p.status !== 'paid' || !p.paid_date) return false;
        const paidDate = parseISO(p.paid_date);
        return paidDate >= lastMonthStart && paidDate <= lastMonthEnd;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const thisMonth = new Date();
    const thisMonthStart = startOfMonth(thisMonth);
    const thisMonthEnd = endOfMonth(thisMonth);
    
    const thisMonthRevenue = payments
      .filter((p: any) => {
        if (p.status !== 'paid' || !p.paid_date) return false;
        const paidDate = parseISO(p.paid_date);
        return paidDate >= thisMonthStart && paidDate <= thisMonthEnd;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const revenueTrend = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    return {
      totalRevenue: total,
      avgPerClient,
      conversionPercent,
      revenueTrend,
    };
  }, [payments, invoices, clients, quotes]);

  return (
    <div className="space-y-4">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between pr-10">
        <h2 className="text-2xl font-bold">Statistiques avancées</h2>
        <div className="flex gap-2 mr-4">
          <Button
            variant={period === '6months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('6months')}
          >
            6 mois
          </Button>
          <Button
            variant={period === '12months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('12months')}
          >
            12 mois
          </Button>
          <Button
            variant={period === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('all')}
          >
            2 ans
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4 text-primary" />
              Revenu total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalRevenue.toFixed(0)}€</div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${kpis.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.revenueTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(kpis.revenueTrend).toFixed(1)}% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Revenu moyen / client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgPerClient.toFixed(0)}€</div>
            <div className="text-xs text-muted-foreground mt-1">
              {clients.length} client{clients.length > 1 ? 's' : ''} actif{clients.length > 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.conversionPercent.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Des devis acceptés
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Devis ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter((q: any) => {
                const created = parseISO(q.created_at);
                const thisMonth = startOfMonth(new Date());
                return created >= thisMonth;
              }).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {quotes.length} au total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Évolution des revenus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [`${value}€`, '']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenus" 
                  stackId="1"
                  stroke="#4ade80" 
                  fill="#4ade80" 
                  name="Revenus"
                />
                <Area 
                  type="monotone" 
                  dataKey="devis" 
                  stackId="1"
                  stroke="#60a5fa" 
                  fill="#60a5fa" 
                  name="Devis acceptés"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution des chantiers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chantiers actifs vs terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sitesEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actifs" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  name="Actifs"
                />
                <Line 
                  type="monotone" 
                  dataKey="terminés" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  name="Terminés"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 clients par revenus</CardTitle>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topClients} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    formatter={(value: any) => [`${value}€`, 'Revenu']}
                  />
                  <Bar dataKey="revenu" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucun client avec revenus
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taux de conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des devis</CardTitle>
          </CardHeader>
          <CardContent>
            {conversionRate.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conversionRate}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conversionRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucun devis pour le moment
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

