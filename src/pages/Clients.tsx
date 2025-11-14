import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Phone, Mail, Trash2, Download, FileText, ChevronDown, ChevronUp, FileSpreadsheet, Upload, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/Pagination';
import { SortableList, SortOption } from '@/components/SortableList';
import { DateRangeFilter } from '@/components/DateFilter';
import MobileNav from '@/components/MobileNav';
import { NavigationDialog } from '@/components/NavigationDialog';
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
import { useClients, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useInvoices, useSendInvoiceEmail } from '@/hooks/useInvoices';
import { exportInvoiceToPDF } from '@/lib/pdfExport';
import { exportClients } from '@/lib/dataExport';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string;
}

interface PaidInvoice {
  id: string;
  invoice_number: string;
  title: string;
  total_amount: number;
  paid_date: string | null;
  issue_date: string;
  due_date: string;
}

const ITEMS_PER_PAGE = 10;

const Clients = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Utiliser le hook optimisé avec cache
  const { data: clients = [], isLoading, error } = useClients();
  const { data: allInvoices = [] } = useInvoices();
  const sendEmailMutation = useSendInvoiceEmail();
  const queryClient = useQueryClient();
  const { data: companyProfile } = useCompanyProfile();
  
  // Récupérer le nom de l'utilisateur
  const userName = user?.email?.split('@')[0] || 'Utilisateur';

  // Mutation optimisée pour la suppression
  const deleteMutation = useSupabaseMutation(
    async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
      return clientId;
    },
    [['clients', user?.id || '']],
    {
      onSuccess: () => {
        toast.success('Client supprimé');
        setDeleteDialogOpen(false);
        setClientToDelete(null);
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
      },
    }
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Optimisation: useMemo pour le filtrage
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.includes(searchTerm)
      );
    }

    // Filtre par date de création
    if (startDate || endDate) {
      filtered = filtered.filter(client => {
        const createdDate = new Date(client.created_at);
        if (startDate && createdDate < startDate) return false;
        if (endDate && createdDate > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [clients, searchTerm, startDate, endDate]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleDeleteClick = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!clientToDelete) return;
    deleteMutation.mutate(clientToDelete);
  };

  // Obtenir les factures payées d'un client
  const getPaidInvoicesForClient = (clientId: string) => {
    return allInvoices.filter(
      (invoice) => invoice.client_id === clientId && invoice.status === 'paid'
    );
  };

  // Toggle l'expansion d'un client
  const toggleClientExpansion = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  // Télécharger une facture
  const handleDownloadInvoice = (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    exportInvoiceToPDF(
      {
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
      },
      userName,
      companyProfile || undefined
    );
    toast.success('Facture exportée en PDF');
  };

  // Envoyer une facture par email
  const handleSendInvoiceEmail = async (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!invoice.clients?.email) {
      toast.error('Le client n\'a pas d\'email');
      return;
    }

    try {
      await sendEmailMutation.mutateAsync(invoice.id);
      toast.success(`Facture envoyée par email à ${invoice.clients.email}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de l\'envoi de l\'email'
      );
    }
  };

  // Gestion de la sélection
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedClients(new Set());
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const selectAllClients = () => {
    setSelectedClients(new Set(filteredClients.map(c => c.id)));
  };

  const deselectAllClients = () => {
    setSelectedClients(new Set());
  };

  const handleExportSelected = (format: 'excel' | 'csv') => {
    if (selectedClients.size === 0) {
      toast.error('Veuillez sélectionner au moins un client');
      return;
    }

    const selectedClientsData = filteredClients.filter(c => selectedClients.has(c.id));
    try {
      if (format === 'excel') {
        exportClients(selectedClientsData, 'excel');
        toast.success(`${selectedClients.size} client(s) exporté(s) en Excel`);
      } else {
        exportClients(selectedClientsData, 'csv');
        toast.success(`${selectedClients.size} client(s) exporté(s) en CSV`);
      }
      setIsSelectMode(false);
      setSelectedClients(new Set());
    } catch (error) {
      console.error('Erreur export clients:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
    }
  };

  const handleImportFile = async (file: File) => {
    if (!user) {
      toast.error('Vous devez être connecté pour importer');
      return;
    }

    // Confirmation avant import
    if (!confirm(`Voulez-vous importer les données depuis "${file.name}" ?`)) {
      return;
    }

    try {
      const { importClients } = await import('@/lib/dataImport');
      await importClients(file, user.id);
      
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['clients', user.id] });
      
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
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-64" />
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
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm opacity-90 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Exporter/Importer les données">
                <FileSpreadsheet className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleSelectMode}>
                {isSelectMode ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Désactiver la sélection
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Sélectionner pour exporter
                  </>
                )}
              </DropdownMenuItem>
              {isSelectMode && (
                <>
                  <DropdownMenuItem onClick={selectAllClients}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Tout sélectionner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deselectAllClients}>
                    <Square className="h-4 w-4 mr-2" />
                    Tout désélectionner
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportSelected('excel')}
                    disabled={selectedClients.size === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter sélection ({selectedClients.size})
                  </DropdownMenuItem>
                </>
              )}
              {!isSelectMode && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportClients(filteredClients, 'excel');
                        toast.success('Export Excel réussi');
                      } catch (error) {
                        console.error('Erreur export clients Excel:', error);
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
                        exportClients(filteredClients, 'csv');
                        toast.success('Export CSV réussi');
                      } catch (error) {
                        console.error('Erreur export clients CSV:', error);
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
                Importer depuis Excel/CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate('/clients/new')} size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {isSelectMode && selectedClients.size > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} sélectionné{selectedClients.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSelected('excel')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter en Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSelected('csv')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exporter en CSV
              </Button>
            </div>
          </div>
        )}

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

        <SortableList
          items={filteredClients}
          sortOptions={[
            { key: 'created_at', label: 'Date de création', getValue: (c) => new Date(c.created_at) },
            { key: 'first_name', label: 'Prénom' },
            { key: 'last_name', label: 'Nom' },
            { key: 'email', label: 'Email' },
          ] as SortOption<Client>[]}
          defaultSort={{ key: 'created_at', direction: 'desc' }}
        >
          {(sortedClients) => {
            // Pagination sur les clients triés
            const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE);
            const paginatedClients = useMemo(() => {
              const start = (currentPage - 1) * ITEMS_PER_PAGE;
              const end = start + ITEMS_PER_PAGE;
              return sortedClients.slice(start, end);
            }, [sortedClients, currentPage]);

            return (
              <>
                <div className="space-y-3">
                  {paginatedClients.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/clients/new')} className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un client
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            paginatedClients.map((client) => {
              const paidInvoices = getPaidInvoicesForClient(client.id);
              const isExpanded = expandedClients.has(client.id);

              return (
                <Card key={client.id} className="group hover:shadow-glow transition-all duration-200 animate-fade-in">
                  <CardContent className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        {isSelectMode && (
                          <div className="mr-3 mt-1" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedClients.has(client.id)}
                              onCheckedChange={() => toggleClientSelection(client.id)}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {client.first_name} {client.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{client.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <div onClick={(e) => e.stopPropagation()}>
                            <NavigationDialog
                              address={client.address}
                              title=""
                              variant="outline"
                              size="icon"
                              className="hover:bg-primary hover:text-primary-foreground transition-colors"
                              showIcon={true}
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(client.phone);
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmail(client.email);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                            onClick={(e) => handleDeleteClick(client.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-3 text-sm">
                        <span className="text-muted-foreground">{client.phone}</span>
                        <span className="text-muted-foreground">{client.email}</span>
                      </div>
                    </div>

                    {/* Section Factures payées */}
                    {paidInvoices.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between p-0 h-auto"
                          onClick={(e) => toggleClientExpansion(client.id, e)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">
                              {paidInvoices.length} facture{paidInvoices.length > 1 ? 's' : ''} payée{paidInvoices.length > 1 ? 's' : ''}
                            </span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Payée{paidInvoices.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {paidInvoices.map((invoice) => (
                              <div
                                key={invoice.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{invoice.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    N° {invoice.invoice_number} •{' '}
                                    {format(new Date(invoice.issue_date), 'PPP', { locale: fr })} •{' '}
                                    {invoice.total_amount.toFixed(2)} €
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleDownloadInvoice(invoice, e)}
                                    title="Télécharger le PDF"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {invoice.clients?.email && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => handleSendInvoiceEmail(invoice, e)}
                                      disabled={sendEmailMutation.isPending}
                                      title="Envoyer par email"
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
                </div>

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
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client sera définitivement supprimé.
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

export default Clients;
