import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/Pagination';
import { SortableList, SortOption } from '@/components/SortableList';
import { DateRangeFilter } from '@/components/DateFilter';
import MobileNav from '@/components/MobileNav';
import { Euro, Calendar, Trash2, Plus, Search, Filter, FileSpreadsheet, FileText, Upload, CheckSquare, Square } from 'lucide-react';
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
import { usePayments, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { exportPayments } from '@/lib/dataExport';
import { importPayments } from '@/lib/dataImport';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Payment {
  id: string;
  site_id: string;
  client_id: string;
  amount: number;
  type: string;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  sites?: {
    title: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

const ITEMS_PER_PAGE = 10;

const Payments = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Utiliser le hook optimisé avec cache
  const { data: payments = [], isLoading } = usePayments();

  // Mutation optimisée pour la suppression
  const deleteMutation = useSupabaseMutation(
    async (paymentId: string) => {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
      
      if (error) throw error;
      return paymentId;
    },
    [['payments', user?.id || '']],
    {
      onSuccess: () => {
        toast.success('Paiement supprimé');
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
      },
    }
  );

  const getClientName = (payment: Payment) => {
    if (payment.clients) {
      return `${payment.clients.first_name} ${payment.clients.last_name}`;
    }
    return 'Client inconnu';
  };

  const getSiteName = (payment: Payment) => {
    return payment.sites?.title || 'Chantier inconnu';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string }> = {
      deposit: { label: 'Acompte' },
      progress: { label: 'Avancement' },
      final: { label: 'Solde' },
    };
    return <Badge variant="outline">{variants[type]?.label || type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge variant="default" className="bg-success">Payé</Badge>
    ) : (
      <Badge variant="secondary">En attente</Badge>
    );
  };

  // Filtrage et recherche
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        getSiteName(p).toLowerCase().includes(term) ||
        getClientName(p).toLowerCase().includes(term)
      );
    }

    // Filtre par date (due_date ou created_at)
    if (startDate || endDate) {
      filtered = filtered.filter(p => {
        const dateToCheck = p.due_date || p.created_at;
        const dateObj = new Date(dateToCheck);
        if (startDate && dateObj < startDate) return false;
        if (endDate && dateObj > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [payments, statusFilter, typeFilter, searchTerm, startDate, endDate, getSiteName, getClientName]);


  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, startDate, endDate]);

  const pendingTotal = useMemo(() => {
    return filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const handleDeleteClick = (paymentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!paymentToDelete) return;
    deleteMutation.mutate(paymentToDelete);
  };

  // Gestion de la sélection
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedPayments(new Set());
    }
  };

  const togglePaymentSelection = (paymentId: string) => {
    const newSelection = new Set(selectedPayments);
    if (newSelection.has(paymentId)) {
      newSelection.delete(paymentId);
    } else {
      newSelection.add(paymentId);
    }
    setSelectedPayments(newSelection);
  };

  const selectAllPayments = () => {
    setSelectedPayments(new Set(filteredPayments.map(p => p.id)));
  };

  const deselectAllPayments = () => {
    setSelectedPayments(new Set());
  };

  const handleExportSelected = (format: 'excel' | 'csv') => {
    if (selectedPayments.size === 0) {
      toast.error('Veuillez sélectionner au moins un paiement');
      return;
    }

    const selectedPaymentsData = filteredPayments.filter(p => selectedPayments.has(p.id));
    try {
      if (format === 'excel') {
        exportPayments(selectedPaymentsData, 'excel');
        toast.success(`${selectedPayments.size} paiement(s) exporté(s) en Excel`);
      } else {
        exportPayments(selectedPaymentsData, 'csv');
        toast.success(`${selectedPayments.size} paiement(s) exporté(s) en CSV`);
      }
      setIsSelectMode(false);
      setSelectedPayments(new Set());
    } catch (error) {
      console.error('Erreur export paiements:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
    }
  };

  const handleImportFile = async (file: File) => {
    if (!user) {
      toast.error('Vous devez être connecté pour importer');
      return;
    }

    if (!confirm(`Voulez-vous importer les données depuis "${file.name}" ?`)) {
      return;
    }

    try {
      await importPayments(file, user.id);
      queryClient.invalidateQueries({ queryKey: ['payments', user.id] });
      toast.success('Import réussi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'import');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-primary-foreground p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </header>
        <div className="p-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
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
            <h1 className="text-2xl font-bold">Paiements</h1>
            <p className="text-sm opacity-90 mt-1">{filteredPayments.length} paiement{filteredPayments.length !== 1 ? 's' : ''}{filteredPayments.length !== payments.length ? ` sur ${payments.length}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary">
                  <FileSpreadsheet className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isSelectMode ? (
                  <>
                    <DropdownMenuItem onClick={selectAllPayments}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Tout sélectionner
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={deselectAllPayments}>
                      <Square className="h-4 w-4 mr-2" />
                      Tout désélectionner
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleSelectMode}>
                      Annuler la sélection
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={toggleSelectMode}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Mode sélection
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          exportPayments(filteredPayments, 'excel');
                          toast.success('Export Excel réussi');
                        } catch (error) {
                          console.error('Erreur export paiements Excel:', error);
                          toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
                        }
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exporter tout en Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          exportPayments(filteredPayments, 'csv');
                          toast.success('Export CSV réussi');
                        } catch (error) {
                          console.error('Erreur export paiements CSV:', error);
                          toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter tout en CSV
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.xlsx,.xls,.csv';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImportFile(file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => navigate('/payments/new')} size="icon" variant="secondary">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {pendingTotal > 0 && (
        <div className="p-4">
          <Card className="bg-warning/10 border-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-warning" />
                  <span className="font-medium">Total en attente</span>
                </div>
                <span className="text-2xl font-bold text-warning">{pendingTotal.toFixed(0)}€</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Barre d'action pour la sélection */}
        {isSelectMode && selectedPayments.size > 0 && (
          <Card className="bg-primary/10 border-primary">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPayments.size} paiement{selectedPayments.size !== 1 ? 's' : ''} sélectionné{selectedPayments.size !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSelected('excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSelected('csv')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barre de recherche et filtres */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="deposit">Acompte</SelectItem>
                  <SelectItem value="progress">Avancement</SelectItem>
                  <SelectItem value="final">Solde</SelectItem>
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
          items={filteredPayments}
          sortOptions={[
            { key: 'due_date', label: 'Date d\'échéance', getValue: (p) => p.due_date ? new Date(p.due_date) : new Date(p.created_at) },
            { key: 'created_at', label: 'Date de création', getValue: (p) => new Date(p.created_at) },
            { key: 'paid_date', label: 'Date de paiement', getValue: (p) => p.paid_date ? new Date(p.paid_date) : null },
            { key: 'amount', label: 'Montant', getValue: (p) => p.amount || 0 },
            { key: 'status', label: 'Statut' },
            { key: 'type', label: 'Type' },
          ] as SortOption<Payment>[]}
          defaultSort={{ key: 'due_date', direction: 'asc' }}
        >
          {(sortedPayments) => {
            // Pagination sur les paiements triés
            const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);
            const paginatedPayments = useMemo(() => {
              const start = (currentPage - 1) * ITEMS_PER_PAGE;
              const end = start + ITEMS_PER_PAGE;
              return sortedPayments.slice(start, end);
            }, [sortedPayments, currentPage]);

            return (
              <>
                {paginatedPayments.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">Aucun paiement enregistré</p>
                      <Button onClick={() => navigate('/payments/new')} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un paiement
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedPayments.map((payment) => (
              <Card key={payment.id} className={`group ${isSelectMode ? '' : 'cursor-pointer hover:shadow-glow hover:scale-[1.02]'} transition-all duration-200 animate-fade-in`} onClick={() => !isSelectMode && navigate(`/payments/${payment.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedPayments.has(payment.id)}
                          onCheckedChange={() => togglePaymentSelection(payment.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{getSiteName(payment)}</h3>
                        <p className="text-sm text-muted-foreground">{getClientName(payment)}</p>
                      </div>
                    </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right space-y-1">
                      {getTypeBadge(payment.type)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8"
                      onClick={(e) => handleDeleteClick(payment.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {payment.status === 'paid' && payment.paid_date ? (
                      <span>Payé le {new Date(payment.paid_date).toLocaleDateString('fr-FR')}</span>
                    ) : payment.due_date ? (
                      <span>Échéance: {new Date(payment.due_date).toLocaleDateString('fr-FR')}</span>
                    ) : (
                      <span>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">{payment.amount.toFixed(2)}€</p>
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
            <AlertDialogTitle>Supprimer le paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le paiement sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};

export default Payments;
