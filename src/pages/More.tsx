import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileNav from '@/components/MobileNav';
import { 
  Calendar, 
  Bell, 
  Mail, 
  Package, 
  ChevronRight,
  Settings,
  LogOut,
  Hammer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const More = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: 'Chantiers',
      description: 'Gérez vos chantiers',
      icon: Hammer,
      route: '/sites',
      color: 'text-primary',
    },
    {
      title: 'Calendrier',
      description: 'Planifiez vos interventions',
      icon: Calendar,
      route: '/calendar',
      color: 'text-blue-500',
    },
    {
      title: 'Rappels de paiement',
      description: 'Gérez les relances clients',
      icon: Bell,
      route: '/reminders',
      color: 'text-orange-500',
    },
    {
      title: 'Templates d\'emails',
      description: 'Personnalisez vos emails',
      icon: Mail,
      route: '/email-templates',
      color: 'text-blue-500',
    },
    {
      title: 'Gestion des stocks',
      description: 'Matériaux et inventaire',
      icon: Package,
      route: '/inventory',
      color: 'text-purple-500',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="container mx-auto p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Plus</h1>
        <p className="text-muted-foreground mt-2">
          Fonctionnalités supplémentaires
        </p>
      </div>

      {/* Menu principal */}
      <div className="space-y-3 mb-8">
        {menuItems.map((item) => (
          <Card
            key={item.route}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(item.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section paramètres */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      <MobileNav />
    </div>
  );
};

export default More;

