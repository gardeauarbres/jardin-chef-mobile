import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInterventions, InterventionWithSite } from '@/hooks/useInterventions';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isWithinInterval, addDays, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  onInterventionClick?: (intervention: InterventionWithSite) => void;
  onDateClick?: (date: Date) => void;
}

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

export function CalendarView({ onInterventionClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Calculer la plage de dates selon la vue
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: fr }),
          end: endOfWeek(currentDate, { locale: fr }),
        };
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        };
    }
  }, [currentDate, viewMode]);

  const { data: interventions, isLoading } = useInterventions(dateRange.start, dateRange.end);

  // Grouper les interventions par jour
  const interventionsByDate = useMemo(() => {
    const grouped: Record<string, InterventionWithSite[]> = {};
    
    interventions?.forEach((intervention) => {
      const startDate = new Date(intervention.start_time);
      const dateKey = format(startDate, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(intervention);
    });

    return grouped;
  }, [interventions]);

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        setCurrentDate((prev) => {
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          return newDate;
        });
        break;
      case 'week':
        setCurrentDate((prev) => addDays(prev, direction === 'next' ? 7 : -7));
        break;
      case 'day':
        setCurrentDate((prev) => addDays(prev, direction === 'next' ? 1 : -1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Créer les modifiers pour react-day-picker
  const modifiers = useMemo(() => {
    const daysWithInterventions = Object.keys(interventionsByDate).map((key) => new Date(key));
    return {
      hasInterventions: daysWithInterventions,
    };
  }, [interventionsByDate]);

  // Vue liste pour semaine/jour
  const renderListView = () => {
    const days = viewMode === 'week' 
      ? eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
      : [currentDate];

    return (
      <div className="space-y-4">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayInterventions = interventionsByDate[dateKey] || [];

          return (
            <Card key={dateKey}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(day, 'EEEE d MMMM yyyy', { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayInterventions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucune intervention prévue</p>
                ) : (
                  <div className="space-y-2">
                    {dayInterventions.map((intervention) => (
                      <Card
                        key={intervention.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => onInterventionClick?.(intervention)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={statusColors[intervention.status]}>
                                  {statusLabels[intervention.status]}
                                </Badge>
                                <h4 className="font-semibold">{intervention.title}</h4>
                              </div>
                              {intervention.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {intervention.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(intervention.start_time), 'HH:mm')} - {format(new Date(intervention.end_time), 'HH:mm')}
                                </div>
                                {intervention.site && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {intervention.site.title}
                                  </div>
                                )}
                                {intervention.employee_ids && intervention.employee_ids.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {intervention.employee_ids.length} employé(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">
              {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
              {viewMode === 'week' && `Semaine du ${format(dateRange.start, 'd MMMM', { locale: fr })}`}
              {viewMode === 'day' && format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h2>
          </div>
        </div>
        <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Vue mensuelle</SelectItem>
            <SelectItem value="week">Vue hebdomadaire</SelectItem>
            <SelectItem value="day">Vue journalière</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contenu selon la vue */}
      {viewMode === 'month' ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(date);
                    onDateClick?.(date);
                  }
                }}
                className="rounded-md border"
                modifiers={modifiers}
                modifiersClassNames={{
                  hasInterventions: 'bg-blue-100 dark:bg-blue-900/30',
                }}
              />
              {/* Liste des interventions du mois */}
              {Object.entries(interventionsByDate).length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Interventions du mois</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {Object.entries(interventionsByDate)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([dateKey, dayInterventions]) => (
                        <div key={dateKey} className="text-sm">
                          <div className="font-medium mb-1">
                            {format(new Date(dateKey), 'EEEE d MMMM', { locale: fr })}
                          </div>
                          {dayInterventions.map((intervention) => (
                            <div
                              key={intervention.id}
                              className={cn(
                                'ml-4 mb-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80',
                                statusColors[intervention.status] || 'bg-gray-500',
                                'text-white'
                              )}
                              onClick={() => onInterventionClick?.(intervention)}
                            >
                              {format(new Date(intervention.start_time), 'HH:mm')} - {intervention.title}
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        renderListView()
      )}

      {/* Statistiques */}
      {interventions && interventions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{interventions.length}</div>
              <div className="text-sm text-muted-foreground">Interventions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {interventions.filter((i) => i.status === 'scheduled').length}
              </div>
              <div className="text-sm text-muted-foreground">Planifiées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {interventions.filter((i) => i.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {interventions.filter((i) => i.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Terminées</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

