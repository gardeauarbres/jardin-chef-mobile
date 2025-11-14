import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, Filter, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportQuoteToPDF } from '@/lib/pdfExport';
import { exportQuotes } from '@/lib/dataExport';
import { InvoiceForm } from '@/components/InvoiceForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/Pagination';
import { SortableList, SortOption } from '@/components/SortableList';
import { DateRangeFilter } from '@/components/DateFilter';
import MobileNav from '@/components/MobileNav';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Quote {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
  client_id: string;
  clients: {
    first_name: string;
    last_name: string;
  };
}

const ITEMS_PER_PAGE = 10;

const Quotes = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchQuotes();
  }, [user]);

  const fetchQuotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        clients (
          first_name,
          last_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des devis");
    } else {
      setQuotes(data || []);
    }
  };

  // Filtrage et recherche
  const filteredQuotes = useMemo(() => {
    let filtered = quotes;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term) ||
        `${q.clients?.first_name} ${q.clients?.last_name}`.toLowerCase().includes(term)
      );
    }

    // Filtre par date de création
    if (startDate || endDate) {
      filtered = filtered.filter(q => {
        const createdDate = new Date(q.created_at);
        if (startDate && createdDate < startDate) return false;
        if (endDate && createdDate > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [quotes, statusFilter, searchTerm, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredQuotes.slice(start, end);
  }, [filteredQuotes, currentPage]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      draft: { variant: 'secondary', label: 'Brouillon' },
      sent: { variant: 'outline', label: 'Envoyé' },
      accepted: { variant: 'default', label: 'Accepté' },
      rejected: { variant: 'destructive', label: 'Refusé' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDeleteClick = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success('Devis supprimé');
      fetchQuotes();
    }

    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

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
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-sm opacity-90 mt-1">{filteredQuotes.length} devis{filteredQuotes.length !== quotes.length ? ` sur ${quotes.length}` : ''}</p>
          </div>
          <Button onClick={() => navigate('/quotes/new')} size="icon" variant="secondary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {/* Barre de recherche et filtres */}
        {quotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="Exporter les données">
                    <FileSpreadsheet className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportQuotes(filteredQuotes, 'excel');
                        toast.success('Export Excel réussi');
                      } catch (error) {
                        toast.error('Erreur lors de l\'export');
                      }
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter en Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportQuotes(filteredQuotes, 'csv');
                        toast.success('Export CSV réussi');
                      } catch (error) {
                        toast.error('Erreur lors de l\'export');
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter en CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}

        <SortableList
          items={filteredQuotes}
          sortOptions={[
            { key: 'created_at', label: 'Date de création', getValue: (q) => new Date(q.created_at) },
            { key: 'title', label: 'Titre' },
            { key: 'amount', label: 'Montant', getValue: (q) => q.amount || 0 },
            { key: 'status', label: 'Statut' },
          ] as SortOption<Quote>[]}
          defaultSort={{ key: 'created_at', direction: 'desc' }}
        >
          {(sortedQuotes) => {
            // Pagination sur les devis triés
            const totalPages = Math.ceil(sortedQuotes.length / ITEMS_PER_PAGE);
            const paginatedQuotes = useMemo(() => {
              const start = (currentPage - 1) * ITEMS_PER_PAGE;
              const end = start + ITEMS_PER_PAGE;
              return sortedQuotes.slice(start, end);
            }, [sortedQuotes, currentPage]);

            return (
              <>
                {paginatedQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {quotes.length === 0 ? 'Aucun devis créé' : 'Aucun devis trouvé'}
              </p>
              {quotes.length === 0 && (
                <Button onClick={() => navigate('/quotes/new')} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un devis
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          paginatedQuotes.map((quote) => (
            <Card key={quote.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{quote.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {quote.clients?.first_name} {quote.clients?.last_name}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    {getStatusBadge(quote.status)}
                    {quote.status === 'accepted' && (
                      <InvoiceForm
                        quoteId={quote.id}
                        trigger={
                          <Button
                            size="icon"
                            variant="outline"
                            className="opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all h-8 w-8"
                            title="Créer une facture"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        }
                      />
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportQuoteToPDF({
                          ...quote,
                          client: quote.clients ? {
                            first_name: quote.clients.first_name,
                            last_name: quote.clients.last_name,
                          } : undefined,
                        });
                        toast.success('Devis exporté en PDF');
                      }}
                      title="Exporter en PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8"
                      onClick={(e) => handleDeleteClick(quote.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-lg font-bold text-primary">{quote.amount.toFixed(2)}€</p>
                </div>
              </CardContent>
            </Card>
                  ))
                )}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            );
          }}
        </SortableList>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le devis sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};

export default Quotes;
