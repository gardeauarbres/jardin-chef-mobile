import { useState, useMemo } from 'react';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getClients } from '@/lib/storage';
import { Client } from '@/types';
import MobileNav from '@/components/MobileNav';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const clients = useMemo(() => getClients(), []);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

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

        <div className="space-y-3">
          {filteredClients.length === 0 ? (
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
            filteredClients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/clients/${client.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{client.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmail(client.email);
                        }}
                      >
                        <Mail className="h-4 w-4" />
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
      </div>

      <MobileNav />
    </div>
  );
};

export default Clients;
