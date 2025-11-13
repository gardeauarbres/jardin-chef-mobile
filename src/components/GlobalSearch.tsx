import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, FileText, Hammer, Euro, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useClients, useQuotes, useSites, usePayments } from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  type: 'client' | 'quote' | 'site' | 'payment';
  title: string;
  subtitle: string;
  route: string;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: sites = [] } = useSites();
  const { data: payments = [] } = usePayments();

  const results = useMemo(() => {
    if (!searchTerm.trim() || !user) return [];

    const term = searchTerm.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Recherche dans les clients
    clients.forEach((client) => {
      const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
      if (fullName.includes(term) || client.email?.toLowerCase().includes(term)) {
        searchResults.push({
          id: client.id,
          type: 'client',
          title: `${client.first_name} ${client.last_name}`,
          subtitle: client.email || 'Pas d\'email',
          route: `/clients/${client.id}`,
        });
      }
    });

    // Recherche dans les devis
    quotes.forEach((quote) => {
      const title = quote.title?.toLowerCase() || '';
      const description = quote.description?.toLowerCase() || '';
      if (title.includes(term) || description.includes(term)) {
        const clientName = quote.clients
          ? `${quote.clients.first_name} ${quote.clients.last_name}`
          : 'Client inconnu';
        searchResults.push({
          id: quote.id,
          type: 'quote',
          title: quote.title || 'Devis sans titre',
          subtitle: `Client: ${clientName}`,
          route: `/quotes/${quote.id}`,
        });
      }
    });

    // Recherche dans les chantiers
    sites.forEach((site) => {
      const title = site.title?.toLowerCase() || '';
      const description = site.description?.toLowerCase() || '';
      if (title.includes(term) || description.includes(term)) {
        const clientName = site.clients
          ? `${site.clients.first_name} ${site.clients.last_name}`
          : 'Client inconnu';
        searchResults.push({
          id: site.id,
          type: 'site',
          title: site.title || 'Chantier sans titre',
          subtitle: `Client: ${clientName}`,
          route: `/sites/${site.id}`,
        });
      }
    });

    // Recherche dans les paiements
    payments.forEach((payment) => {
      const siteTitle = payment.sites?.title?.toLowerCase() || '';
      const clientName = payment.clients
        ? `${payment.clients.first_name} ${payment.clients.last_name}`.toLowerCase()
        : '';
      if (siteTitle.includes(term) || clientName.includes(term)) {
        searchResults.push({
          id: payment.id,
          type: 'payment',
          title: `${payment.amount.toFixed(2)}€ - ${payment.sites?.title || 'Paiement'}`,
          subtitle: payment.clients
            ? `${payment.clients.first_name} ${payment.clients.last_name}`
            : 'Client inconnu',
          route: `/payments/${payment.id}`,
        });
      }
    });

    return searchResults.slice(0, 10); // Limiter à 10 résultats
  }, [searchTerm, clients, quotes, sites, payments, user]);

  // Raccourci clavier Ctrl+K ou Cmd+K pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSelect = (route: string) => {
    navigate(route);
    setOpen(false);
    setSearchTerm('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4" />;
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'site':
        return <Hammer className="h-4 w-4" />;
      case 'payment':
        return <Euro className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'Client';
      case 'quote':
        return 'Devis';
      case 'site':
        return 'Chantier';
      case 'payment':
        return 'Paiement';
      default:
        return '';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Rechercher...</span>
        <span className="inline-flex lg:hidden">Recherche</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Recherche globale</DialogTitle>
            <DialogDescription>
              Recherchez parmi vos clients, devis, chantiers et paiements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tapez pour rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {!searchTerm ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Commencez à taper pour rechercher...
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Aucun résultat trouvé pour &quot;{searchTerm}&quot;
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result.route)}
                      className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{result.title}</p>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

