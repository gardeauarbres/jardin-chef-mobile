import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  label?: string;
  onDateChange: (date: Date | null) => void;
  selectedDate?: Date | null;
  placeholder?: string;
  className?: string;
}

export const DateFilter = ({
  label = 'Filtrer par date',
  onDateChange,
  selectedDate,
  placeholder = 'Sélectionner une date',
  className,
}: DateFilterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, 'PPP', { locale: fr })
          ) : (
            <span>{placeholder}</span>
          )}
          {selectedDate && (
            <X
              className="ml-2 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => {
            onDateChange(date || null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  className?: string;
}

export const DateRangeFilter = ({
  onDateRangeChange,
  startDate,
  endDate,
  className,
}: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    onDateRangeChange(null, null);
  };

  // S'assurer que startDate et endDate sont bien des Date ou undefined (pas null pour react-day-picker)
  const safeStartDate = startDate instanceof Date ? startDate : undefined;
  const safeEndDate = endDate instanceof Date ? endDate : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !safeStartDate && !safeEndDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {safeStartDate && safeEndDate ? (
            <>
              {format(safeStartDate, 'dd/MM/yyyy', { locale: fr })} -{' '}
              {format(safeEndDate, 'dd/MM/yyyy', { locale: fr })}
            </>
          ) : safeStartDate ? (
            `À partir du ${format(safeStartDate, 'dd/MM/yyyy', { locale: fr })}`
          ) : safeEndDate ? (
            `Jusqu'au ${format(safeEndDate, 'dd/MM/yyyy', { locale: fr })}`
          ) : (
            <span>Période</span>
          )}
          {(safeStartDate || safeEndDate) && (
            <X
              className="ml-2 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date de début</label>
            <Calendar
              mode="single"
              selected={safeStartDate}
              onSelect={(date) => {
                if (date) {
                  onDateRangeChange(date, safeEndDate || null);
                } else {
                  onDateRangeChange(null, safeEndDate || null);
                }
              }}
              initialFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date de fin</label>
            <Calendar
              mode="single"
              selected={safeEndDate}
              onSelect={(date) => {
                if (date) {
                  onDateRangeChange(safeStartDate || null, date);
                } else {
                  onDateRangeChange(safeStartDate || null, null);
                }
              }}
              initialFocus
            />
          </div>
          {(safeStartDate || safeEndDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

