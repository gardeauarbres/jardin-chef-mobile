import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveClient, getClients } from '@/lib/storage';
import { Client } from '@/types';
import { toast } from 'sonner';

const ClientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const existingClient = isEdit ? getClients().find(c => c.id === id) : null;

  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
    firstName: existingClient?.firstName || '',
    lastName: existingClient?.lastName || '',
    phone: existingClient?.phone || '',
    email: existingClient?.email || '',
    address: existingClient?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client: Client = {
      id: id || crypto.randomUUID(),
      ...formData,
      createdAt: existingClient?.createdAt || new Date().toISOString(),
    };

    saveClient(client);
    toast.success(isEdit ? 'Client mis à jour' : 'Client ajouté avec succès');
    navigate('/clients');
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="bg-primary text-primary-foreground p-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Modifier' : 'Nouveau'} client</h1>
        </div>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {isEdit ? 'Mettre à jour' : 'Ajouter'} le client
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientForm;
