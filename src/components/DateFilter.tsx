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
import { fr } from 'date-fns/locale';
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
          locale={fr}
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !startDate && !endDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            <>
              {format(startDate, 'dd/MM/yyyy', { locale: fr })} -{' '}
              {format(endDate, 'dd/MM/yyyy', { locale: fr })}
            </>
          ) : startDate ? (
            `À partir du ${format(startDate, 'dd/MM/yyyy', { locale: fr })}`
          ) : endDate ? (
            `Jusqu'au ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`
          ) : (
            <span>Période</span>
          )}
          {(startDate || endDate) && (
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
              selected={startDate || undefined}
              onSelect={(date) => onDateRangeChange(date || null, endDate)}
              initialFocus
              locale={fr}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date de fin</label>
            <Calendar
              mode="single"
              selected={endDate || undefined}
              onSelect={(date) => onDateRangeChange(startDate, date || null)}
              initialFocus
              locale={fr}
            />
          </div>
          {(startDate || endDate) && (
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

