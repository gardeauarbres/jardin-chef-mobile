import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '@/components/CalendarView';
import { InterventionForm } from '@/components/InterventionForm';
import { InterventionWithSite } from '@/hooks/useInterventions';
import { useInterventionDelete } from '@/hooks/useInterventions';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Clock, MapPin, Users, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export default function Calendar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionWithSite | null>(null);
  const [deleteInterventionId, setDeleteInterventionId] = useState<string | null>(null);
  const deleteMutation = useInterventionDelete();

  const handleInterventionClick = (intervention: InterventionWithSite) => {
    setSelectedIntervention(intervention);
  };

  const handleDelete = async () => {
    if (!deleteInterventionId) return;

    try {
      await deleteMutation.mutateAsync(deleteInterventionId);
      toast.success('Intervention supprimée');
      setDeleteInterventionId(null);
      setSelectedIntervention(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Calendrier des interventions
            </h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Planifiez et suivez vos interventions
            </p>
          </div>
          <InterventionForm onSuccess={() => setSelectedIntervention(null)} />
        </div>
      </header>

      <div className="p-4">
        <CalendarView
          onInterventionClick={handleInterventionClick}
          onDateClick={(date) => {
            // Ouvrir le formulaire avec la date pré-remplie
            setSelectedIntervention(null);
          }}
        />
      </div>

      {/* Dialog pour voir/modifier une intervention */}
      <Dialog open={!!selectedIntervention} onOpenChange={(open) => !open && setSelectedIntervention(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntervention?.title}
              {selectedIntervention && (
                <Badge className={statusColors[selectedIntervention.status]}>
                  {statusLabels[selectedIntervention.status]}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Détails de l'intervention planifiée
            </DialogDescription>
          </DialogHeader>
          {selectedIntervention && (
            <div className="space-y-4">
              {selectedIntervention.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedIntervention.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Horaires</span>
                    </div>
                    <div className="text-sm">
                      <div>
                        Début: {format(new Date(selectedIntervention.start_time), 'PPP à HH:mm', { locale: fr })}
                      </div>
                      <div>
                        Fin: {format(new Date(selectedIntervention.end_time), 'PPP à HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedIntervention.site && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Chantier</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{selectedIntervention.site.title}</div>
                        {selectedIntervention.site.clients && (
                          <div className="text-muted-foreground">
                            {selectedIntervention.site.clients.first_name}{' '}
                            {selectedIntervention.site.clients.last_name}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedIntervention.employee_ids && selectedIntervention.employee_ids.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Employés assignés</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedIntervention.employee_ids.length} employé(s) assigné(s)
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteInterventionId(selectedIntervention.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <InterventionForm
                  intervention={selectedIntervention}
                  onSuccess={() => setSelectedIntervention(null)}
                  trigger={
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={!!deleteInterventionId} onOpenChange={(open) => !open && setDeleteInterventionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'intervention ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'intervention sera définitivement supprimée.
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

