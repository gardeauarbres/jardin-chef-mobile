import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortOption<T> = {
  key: keyof T | string;
  label: string;
  getValue?: (item: T) => any;
};

interface SortableListProps<T> {
  items: T[];
  sortOptions: SortOption<T>[];
  defaultSort?: { key: keyof T | string; direction: 'asc' | 'desc' };
  onSortChange?: (sortedItems: T[]) => void;
  children: (sortedItems: T[]) => React.ReactNode;
}

export function SortableList<T>({
  items,
  sortOptions,
  defaultSort,
  onSortChange,
  children,
}: SortableListProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | string>(
    defaultSort?.key || sortOptions[0]?.key || ''
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    defaultSort?.direction || 'desc'
  );

  const sortedItems = [...items].sort((a, b) => {
    const option = sortOptions.find((opt) => opt.key === sortKey);
    const getValue = option?.getValue || ((item: T) => (item as any)[sortKey]);

    const aValue = getValue(a);
    const bValue = getValue(b);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue, 'fr', { sensitivity: 'base' });
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), 'fr');
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSortChange = (key: keyof T | string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const currentOption = sortOptions.find((opt) => opt.key === sortKey);

  return (
    <>
      <div className="flex items-center justify-end mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Trier par: {currentOption?.label || 'Par défaut'}
              {sortDirection === 'asc' ? (
                <ArrowUp className="h-3 w-3 ml-2" />
              ) : (
                <ArrowDown className="h-3 w-3 ml-2" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={String(option.key)}
                onClick={() => handleSortChange(option.key)}
              >
                {option.label}
                {sortKey === option.key && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children(sortedItems)}
    </>
  );
}

