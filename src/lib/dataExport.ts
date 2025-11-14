/**
 * Service d'export de données en Excel et CSV
 */
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

/**
 * Exporte des données en fichier Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Données'
): void {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  try {
    // Créer un nouveau workbook
    const wb = XLSX.utils.book_new();

    // Convertir les données en worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajuster la largeur des colonnes
    if (data.length > 0 && Object.keys(data[0]).length > 0) {
      const colWidths = Object.keys(data[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...data.map((row) => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }

    // Ajouter le worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Télécharger le fichier
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw new Error(`Erreur lors de l'export Excel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Exporte des données en fichier CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  try {
    // Créer un workbook temporaire
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Données');

    // Convertir en CSV
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Créer un blob et télécharger
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL après un court délai
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    throw new Error(`Erreur lors de l'export CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Exporte les clients en Excel/CSV
 */
export function exportClients(
  clients: Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    created_at?: string;
  }>,
  format: 'excel' | 'csv' = 'excel'
): void {
  if (!clients || clients.length === 0) {
    throw new Error('Aucun client à exporter');
  }

  try {
    const exportData = clients.map((client) => ({
      'ID': client.id || '',
      'Prénom': client.first_name || '',
      'Nom': client.last_name || '',
      'Téléphone': client.phone || '',
      'Email': client.email || '',
      'Adresse': client.address || '',
      'Date de création': client.created_at
        ? format(new Date(client.created_at), 'dd/MM/yyyy', { locale: fr })
        : '',
    }));

    const today = new Date();
    const filename = `clients_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (format === 'excel') {
      exportToExcel(exportData, filename, 'Clients');
    } else {
      exportToCSV(exportData, filename);
    }
  } catch (error) {
    console.error('Erreur dans exportClients:', error);
    throw error;
  }
}

/**
 * Exporte les devis en Excel/CSV
 */
export function exportQuotes(
  quotes: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    created_at: string;
    clients?: {
      first_name: string;
      last_name: string;
    };
  }>,
  format: 'excel' | 'csv' = 'excel'
): void {
  if (!quotes || quotes.length === 0) {
    throw new Error('Aucun devis à exporter');
  }

  try {
    const statusLabels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
    };

    const exportData = quotes.map((quote) => ({
      'ID': quote.id || '',
      'Titre': quote.title || '',
      'Description': quote.description || '',
      'Montant HT (€)': quote.amount ? quote.amount.toFixed(2) : '0.00',
      'Client': quote.clients
        ? `${quote.clients.first_name || ''} ${quote.clients.last_name || ''}`.trim()
        : '',
      'Statut': statusLabels[quote.status] || quote.status || '',
      'Date de création': quote.created_at
        ? format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: fr })
        : '',
    }));

    const today = new Date();
    const filename = `devis_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (format === 'excel') {
      exportToExcel(exportData, filename, 'Devis');
    } else {
      exportToCSV(exportData, filename);
    }
  } catch (error) {
    console.error('Erreur dans exportQuotes:', error);
    throw error;
  }
}

/**
 * Exporte les factures en Excel/CSV
 */
export function exportInvoices(
  invoices: Array<{
    id: string;
    invoice_number: string;
    title: string;
    description: string | null;
    amount: number;
    tax_rate: number | null;
    tax_amount: number;
    total_amount: number;
    status: string;
    issue_date: string;
    due_date: string;
    paid_date: string | null;
    sent_date: string | null;
    clients?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }>,
  format: 'excel' | 'csv' = 'excel'
): void {
  if (!invoices || invoices.length === 0) {
    throw new Error('Aucune facture à exporter');
  }

  try {
    const statusLabels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };

    const exportData = invoices.map((invoice) => ({
      'Numéro': invoice.invoice_number || '',
      'Titre': invoice.title || '',
      'Description': invoice.description || '',
      'Montant HT (€)': invoice.amount ? invoice.amount.toFixed(2) : '0.00',
      'Taux TVA (%)': invoice.tax_rate ? invoice.tax_rate.toFixed(2) : '0.00',
      'Montant TVA (€)': invoice.tax_amount ? invoice.tax_amount.toFixed(2) : '0.00',
      'Montant TTC (€)': invoice.total_amount ? invoice.total_amount.toFixed(2) : '0.00',
      'Client': invoice.clients
        ? `${invoice.clients.first_name || ''} ${invoice.clients.last_name || ''}`.trim()
        : '',
      'Email client': invoice.clients?.email || '',
      'Statut': statusLabels[invoice.status] || invoice.status || '',
      'Date d\'émission': invoice.issue_date
        ? format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: fr })
        : '',
      'Date d\'échéance': invoice.due_date
        ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })
        : '',
      'Date de paiement': invoice.paid_date
        ? format(new Date(invoice.paid_date), 'dd/MM/yyyy', { locale: fr })
        : '',
      'Date d\'envoi': invoice.sent_date
        ? format(new Date(invoice.sent_date), 'dd/MM/yyyy', { locale: fr })
        : '',
    }));

    const today = new Date();
    const filename = `factures_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (format === 'excel') {
      exportToExcel(exportData, filename, 'Factures');
    } else {
      exportToCSV(exportData, filename);
    }
  } catch (error) {
    console.error('Erreur dans exportInvoices:', error);
    throw error;
  }
}

