import { useClients, useQuotes, useSites, usePayments, useEmployees, useTimesheets } from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/hooks/useAuth';
import { Download, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const DataExport = () => {
  const { user } = useAuth();
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: sites = [] } = useSites();
  const { data: payments = [] } = usePayments();
  const { data: employees = [] } = useEmployees();
  const { data: timesheets = [] } = useTimesheets();

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      clients,
      quotes,
      sites,
      payments,
      employees,
      timesheets,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jardin-chef-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/"/g, '""');
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllToCSV = () => {
    if (clients.length > 0) exportToCSV(clients, `clients-${new Date().toISOString().split('T')[0]}.csv`);
    if (quotes.length > 0) exportToCSV(quotes, `quotes-${new Date().toISOString().split('T')[0]}.csv`);
    if (sites.length > 0) exportToCSV(sites, `sites-${new Date().toISOString().split('T')[0]}.csv`);
    if (payments.length > 0) exportToCSV(payments, `payments-${new Date().toISOString().split('T')[0]}.csv`);
    if (employees.length > 0) exportToCSV(employees, `employees-${new Date().toISOString().split('T')[0]}.csv`);
    if (timesheets.length > 0) exportToCSV(timesheets, `timesheets-${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <Database className="h-4 w-4 mr-2" />
          Exporter tout en JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAllToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter tout en CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

