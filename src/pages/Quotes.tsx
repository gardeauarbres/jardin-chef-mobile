import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getQuotes, getClients, deleteQuote } from '@/lib/storage';
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

const Quotes = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState(getQuotes());
  const [clients] = useState(getClients());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

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

  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      deleteQuote(quoteToDelete);
      setQuotes(getQuotes());
      toast.success('Devis supprimé');
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-sm opacity-90 mt-1">{quotes.length} devis</p>
          </div>
          <Button onClick={() => navigate('/quotes/new')} size="icon" variant="secondary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucun devis créé</p>
              <Button onClick={() => navigate('/quotes/new')} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un devis
              </Button>
            </CardContent>
          </Card>
        ) : (
          quotes.map((quote) => (
            <Card key={quote.id} className="group cursor-pointer hover:shadow-glow hover:scale-[1.02] transition-all duration-200 animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{quote.title}</h3>
                    <p className="text-sm text-muted-foreground">{getClientName(quote.clientId)}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    {getStatusBadge(quote.status)}
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
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-lg font-bold text-primary">{quote.amount.toFixed(2)}€</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
