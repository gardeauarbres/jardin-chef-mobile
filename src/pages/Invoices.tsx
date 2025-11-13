import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, Filter, Download, Mail, FileText } from 'lucide-react';
import { exportInvoiceToPDF } from '@/lib/pdfExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/Pagination';
import { SortableList, SortOption } from '@/components/SortableList';
import { DateRangeFilter } from '@/components/DateFilter';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useInvoices, useInvoiceDelete, InvoiceWithRelations } from '@/hooks/useInvoices';
import { InvoiceForm } from '@/components/InvoiceForm';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  paid: 'bg-green-500',
  overdue: 'bg-red-500',
  cancelled: 'bg-gray-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

const sortOptions: SortOption[] = [
  { value: 'created_at-desc', label: 'Plus récentes' },
  { value: 'created_at-asc', label: 'Plus anciennes' },
  { value: 'due_date-asc', label: 'Échéance (proche)' },
  { value: 'due_date-desc', label: 'Échéance (lointaine)' },
  { value: 'total_amount-desc', label: 'Montant (décroissant)' },
  { value: 'total_amount-asc', label: 'Montant (croissant)' },
];

export default function Invoices() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: invoices, isLoading } = useInvoices();
  const deleteMutation = useInvoiceDelete();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at-desc');

  // Filtrer et trier les factures
  const filteredAndSortedInvoices = useMemo(() => {
    if (!invoices) return [];

    let filtered = [...invoices];

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.title.toLowerCase().includes(searchLower) ||
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.clients?.first_name.toLowerCase().includes(searchLower) ||
          invoice.clients?.last_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Filtre par date
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((invoice) => {
        const issueDate = new Date(invoice.issue_date);
        if (dateRange.start && issueDate < dateRange.start) return false;
        if (dateRange.end && issueDate > dateRange.end) return false;
        return true;
      });
    }

    // Trier
    const [sortField, sortOrder] = sortBy.split('-');
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof InvoiceWithRelations];
      let bValue: any = b[sortField as keyof InvoiceWithRelations];

      if (sortField === 'due_date' || sortField === 'created_at' || sortField === 'issue_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, searchTerm, statusFilter, dateRange, sortBy]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedInvoices, currentPage]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteMutation.mutateAsync(invoiceToDelete);
      toast.success('Facture supprimée');
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleExportPDF = (invoice: InvoiceWithRelations) => {
    exportInvoiceToPDF({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      title: invoice.title,
      description: invoice.description || undefined,
      amount: invoice.amount,
      tax_rate: invoice.tax_rate || undefined,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      client: invoice.clients
        ? {
            first_name: invoice.clients.first_name,
            last_name: invoice.clients.last_name,
            email: invoice.clients.email,
            address: invoice.clients.address,
          }
        : undefined,
    });
    toast.success('Facture exportée en PDF');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-primary-foreground p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (!invoices) return { total: 0, unpaid: 0, overdue: 0, totalAmount: 0 };
    
    const unpaid = invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled');
    const overdue = invoices.filter((i) => {
      if (i.status === 'paid' || i.status === 'cancelled') return false;
      const dueDate = new Date(i.due_date);
      return dueDate < new Date();
    });
    const totalAmount = invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.total_amount, 0);

    return {
      total: invoices.length,
      unpaid: unpaid.length,
      overdue: overdue.length,
      totalAmount,
    };
  }, [invoices]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Factures</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Gérez vos factures et suivez les paiements
            </p>
          </div>
          <InvoiceForm />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total factures</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.unpaid}</div>
              <div className="text-sm text-muted-foreground">Non payées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">En retard</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalAmount.toFixed(2)} €
              </div>
              <div className="text-sm text-muted-foreground">Montant total</div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par titre, numéro, client..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="sent">Envoyée</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <DateRangeFilter
                onDateRangeChange={(start, end) => {
                  setDateRange({ start, end });
                  setCurrentPage(1);
                }}
                startDate={dateRange.start}
                endDate={dateRange.end}
              />
              <SortableList
                sortOptions={sortOptions}
                defaultSort="created_at-desc"
                onSortChange={setSortBy}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des factures */}
        {paginatedInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
                  ? 'Aucune facture ne correspond aux filtres'
                  : 'Aucune facture pour le moment'}
              </p>
              {!searchTerm && statusFilter === 'all' && !dateRange.start && !dateRange.end && (
                <InvoiceForm />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedInvoices.map((invoice) => {
              const isOverdue =
                invoice.status !== 'paid' &&
                invoice.status !== 'cancelled' &&
                new Date(invoice.due_date) < new Date();

              return (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{invoice.title}</h3>
                          <Badge className={statusColors[invoice.status]}>
                            {statusLabels[invoice.status]}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive">En retard</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">N°:</span> {invoice.invoice_number}
                          </div>
                          {invoice.clients && (
                            <div>
                              <span className="font-medium">Client:</span>{' '}
                              {invoice.clients.first_name} {invoice.clients.last_name}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Émission:</span>{' '}
                            {format(new Date(invoice.issue_date), 'PPP', { locale: fr })}
                          </div>
                          <div>
                            <span className="font-medium">Échéance:</span>{' '}
                            {format(new Date(invoice.due_date), 'PPP', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {invoice.total_amount.toFixed(2)} €
                          </div>
                          <div className="text-sm text-muted-foreground">
                            HT: {invoice.amount.toFixed(2)} € | TVA:{' '}
                            {invoice.tax_amount.toFixed(2)} €
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <InvoiceForm
                            invoice={invoice}
                            trigger={
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setInvoiceToDelete(invoice.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {filteredAndSortedInvoices.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAndSortedInvoices.length / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
}

