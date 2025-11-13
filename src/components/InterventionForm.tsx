import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInterventionMutation, Intervention } from '@/hooks/useInterventions';
import { useSites, useEmployees } from '@/hooks/useSupabaseQuery';
import { toast } from 'sonner';
import { CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const interventionSchema = z.object({
  siteId: z.string().uuid('Veuillez sélectionner un chantier'),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  startTime: z.string().min(1, 'L\'heure de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  endTime: z.string().min(1, 'L\'heure de fin est requise'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  employeeIds: z.array(z.string()).optional(),
});

type InterventionFormData = z.infer<typeof interventionSchema>;

interface InterventionFormProps {
  intervention?: Intervention;
  defaultDate?: Date;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function InterventionForm({
  intervention,
  defaultDate,
  onSuccess,
  trigger,
}: InterventionFormProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultDate || (intervention ? new Date(intervention.start_time) : new Date())
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    intervention ? new Date(intervention.end_time) : defaultDate || new Date()
  );

  const mutation = useInterventionMutation();
  const { data: sites } = useSites();
  const { data: employees } = useEmployees();

  const form = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      siteId: intervention?.site_id || '',
      title: intervention?.title || '',
      description: intervention?.description || '',
      startDate: intervention
        ? format(new Date(intervention.start_time), 'yyyy-MM-dd')
        : format(startDate || new Date(), 'yyyy-MM-dd'),
      startTime: intervention
        ? format(new Date(intervention.start_time), 'HH:mm')
        : '09:00',
      endDate: intervention
        ? format(new Date(intervention.end_time), 'yyyy-MM-dd')
        : format(endDate || new Date(), 'yyyy-MM-dd'),
      endTime: intervention
        ? format(new Date(intervention.end_time), 'HH:mm')
        : '17:00',
      status: (intervention?.status as any) || 'scheduled',
      employeeIds: intervention?.employee_ids || [],
    },
  });

  useEffect(() => {
    if (startDate) {
      form.setValue('startDate', format(startDate, 'yyyy-MM-dd'));
    }
  }, [startDate, form]);

  useEffect(() => {
    if (endDate) {
      form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
    }
  }, [endDate, form]);

  const onSubmit = async (data: InterventionFormData) => {
    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      if (endDateTime <= startDateTime) {
        toast.error('L\'heure de fin doit être après l\'heure de début');
        return;
      }

      await mutation.mutateAsync({
        id: intervention?.id,
        siteId: data.siteId,
        title: data.title,
        description: data.description,
        startTime: startDateTime,
        endTime: endDateTime,
        status: data.status,
        employeeIds: data.employeeIds && data.employeeIds.length > 0 ? data.employeeIds : undefined,
      });

      toast.success(
        intervention ? 'Intervention modifiée avec succès' : 'Intervention créée avec succès'
      );
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const selectedEmployeeIds = form.watch('employeeIds') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle intervention
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {intervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Chantier */}
          <div className="space-y-2">
            <Label htmlFor="siteId">Chantier *</Label>
            <Select
              value={form.watch('siteId')}
              onValueChange={(value) => form.setValue('siteId', value)}
            >
              <SelectTrigger id="siteId">
                <SelectValue placeholder="Sélectionner un chantier" />
              </SelectTrigger>
              <SelectContent>
                {sites?.map((site: any) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.siteId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.siteId.message}
              </p>
            )}
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Ex: Taille des haies"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Détails de l'intervention..."
              rows={3}
            />
          </div>

          {/* Date et heure de début */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'PPP', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Heure de début *</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register('startTime')}
              />
            </div>
          </div>

          {/* Date et heure de fin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'PPP', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Heure de fin *</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register('endTime')}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: any) => form.setValue('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Planifiée</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employés */}
          {employees && employees.length > 0 && (
            <div className="space-y-2">
              <Label>Employés assignés</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {employees.map((employee: any) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={(checked) => {
                        const currentIds = form.getValues('employeeIds') || [];
                        if (checked) {
                          form.setValue('employeeIds', [...currentIds, employee.id]);
                        } else {
                          form.setValue(
                            'employeeIds',
                            currentIds.filter((id) => id !== employee.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`employee-${employee.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {employee.first_name} {employee.last_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Enregistrement...'
                : intervention
                ? 'Modifier'
                : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

