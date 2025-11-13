import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useClients, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
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

  // Utiliser le hook optimisé avec cache
  const { data: clients = [], isLoading, error } = useClients();

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
          <Button onClick={() => navigate('/clients/new')} size="icon">
            <Plus className="h-5 w-5" />
          </Button>
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
            paginatedClients.map((client) => (
              <Card key={client.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in" onClick={() => navigate(`/clients/${client.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{client.address}</p>
                    </div>
                    <div className="flex gap-2">
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
                </CardContent>
              </Card>
            ))
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
