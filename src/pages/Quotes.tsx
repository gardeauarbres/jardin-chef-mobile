import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getQuotes, getClients } from '@/lib/storage';
import MobileNav from '@/components/MobileNav';
import { useNavigate } from 'react-router-dom';

const Quotes = () => {
  const navigate = useNavigate();
  const quotes = useMemo(() => getQuotes(), []);
  const clients = useMemo(() => getClients(), []);

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
            <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{quote.title}</h3>
                    <p className="text-sm text-muted-foreground">{getClientName(quote.clientId)}</p>
                  </div>
                  {getStatusBadge(quote.status)}
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

      <MobileNav />
    </div>
  );
};

export default Quotes;
