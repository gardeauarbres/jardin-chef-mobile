import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Invoice {
  id: string;
  user_id: string;
  quote_id: string;
  site_id: string;
  client_id: string;
  invoice_number: string;
  title: string;
  description: string | null;
  amount: number;
  tax_rate: number | null;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  sent_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithRelations extends Invoice {
  quotes?: {
    id: string;
    title: string;
    amount: number;
  };
  sites?: {
    id: string;
    title: string;
  };
  clients?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    address: string;
  };
}

export function useInvoices() {
  const { user } = useAuth();

  return useQuery<InvoiceWithRelations[]>({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          quotes (
            id,
            title,
            amount
          ),
          sites (
            id,
            title
          ),
          clients (
            id,
            first_name,
            last_name,
            email,
            address
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Table invoices does not exist yet. Run the migration first.');
          return [];
        }
        throw error;
      }

      return (data || []) as InvoiceWithRelations[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 secondes
  });
}

export function useInvoiceMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quoteId,
      siteId,
      clientId,
      invoiceNumber,
      title,
      description,
      amount,
      taxRate,
      dueDate,
      status,
      notes,
    }: {
      id?: string;
      quoteId: string;
      siteId: string;
      clientId: string;
      invoiceNumber?: string;
      title: string;
      description?: string;
      amount: number;
      taxRate?: number;
      dueDate: Date;
      status?: Invoice['status'];
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculer la TVA et le montant TTC
      const taxRateValue = taxRate ?? 20.0;
      const taxAmount = (amount * taxRateValue) / 100;
      const totalAmount = amount + taxAmount;

      // Générer le numéro de facture si non fourni
      let finalInvoiceNumber = invoiceNumber;
      if (!finalInvoiceNumber) {
        const { data: numberData, error: numberError } = await supabase
          .rpc('generate_invoice_number');
        
        if (numberError) {
          // Fallback si la fonction n'existe pas
          const year = new Date().getFullYear();
          const { data: lastInvoice } = await supabase
            .from('invoices')
            .select('invoice_number')
            .eq('user_id', user.id)
            .like('invoice_number', `FACT-${year}-%`)
            .order('invoice_number', { ascending: false })
            .limit(1)
            .single();

          if (lastInvoice) {
            const match = lastInvoice.invoice_number.match(/\d+$/);
            const lastNum = match ? parseInt(match[0]) : 0;
            finalInvoiceNumber = `FACT-${year}-${String(lastNum + 1).padStart(3, '0')}`;
          } else {
            finalInvoiceNumber = `FACT-${year}-001`;
          }
        } else {
          finalInvoiceNumber = numberData;
        }
      }

      const invoiceData = {
        user_id: user.id,
        quote_id: quoteId,
        site_id: siteId,
        client_id: clientId,
        invoice_number: finalInvoiceNumber,
        title,
        description: description || null,
        amount,
        tax_rate: taxRateValue,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: status || 'draft',
        issue_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        notes: notes || null,
      };

      if (id) {
        // Update
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as Invoice;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();

        if (error) throw error;
        return data as Invoice;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useInvoiceDelete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      return invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Fonction pour générer automatiquement une facture depuis un devis accepté
export function useGenerateInvoiceFromQuote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invoiceMutation = useInvoiceMutation();

  return useMutation({
    mutationFn: async ({
      quoteId,
      siteId,
      dueDateDays = 30, // Délai de paiement par défaut : 30 jours
    }: {
      quoteId: string;
      siteId: string;
      dueDateDays?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Récupérer le devis
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            id,
            first_name,
            last_name,
            email,
            address
          )
        `)
        .eq('id', quoteId)
        .eq('user_id', user.id)
        .single();

      if (quoteError) throw quoteError;
      if (!quote) throw new Error('Devis non trouvé');

      // Vérifier qu'il n'existe pas déjà une facture pour ce devis
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('quote_id', quoteId)
        .eq('user_id', user.id)
        .single();

      if (existingInvoice) {
        throw new Error('Une facture existe déjà pour ce devis');
      }

      // Calculer la date d'échéance
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDateDays);

      // Créer la facture
      return await invoiceMutation.mutateAsync({
        quoteId: quote.id,
        siteId,
        clientId: quote.client_id,
        title: `Facture - ${quote.title}`,
        description: quote.description,
        amount: quote.amount,
        taxRate: 20.0, // TVA par défaut 20%
        dueDate,
        status: 'draft',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

/**
 * Hook pour envoyer une facture par email
 */
export function useSendInvoiceEmail() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Récupérer la facture avec toutes les relations
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            first_name,
            last_name,
            email,
            address,
            phone
          )
        `)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single();

      if (invoiceError) throw invoiceError;
      if (!invoice) throw new Error('Facture non trouvée');
      if (!invoice.clients) throw new Error('Client non trouvé');
      if (!invoice.clients.email) throw new Error('Le client n\'a pas d\'email');

      // Récupérer le nom de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const userName = profile
        ? `${profile.first_name} ${profile.last_name}`
        : undefined;

      // Générer le PDF en base64
      const { generateInvoicePDFBase64 } = await import('@/lib/pdfExport');
      const pdfBase64 = generateInvoicePDFBase64(
        {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          title: invoice.title,
          description: invoice.description,
          amount: invoice.amount,
          tax_rate: invoice.tax_rate,
          tax_amount: invoice.tax_amount,
          total_amount: invoice.total_amount,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          client: {
            first_name: invoice.clients.first_name,
            last_name: invoice.clients.last_name,
            email: invoice.clients.email,
            phone: invoice.clients.phone || undefined,
            address: invoice.clients.address || undefined,
          },
        },
        userName
      );

      // Envoyer l'email
      const { sendInvoiceEmail } = await import('@/lib/emailService');
      await sendInvoiceEmail({
        to: invoice.clients.email,
        invoiceNumber: invoice.invoice_number,
        clientName: `${invoice.clients.first_name} ${invoice.clients.last_name}`,
        pdfBase64,
        pdfFileName: `facture-${invoice.invoice_number}.pdf`,
        amount: invoice.total_amount,
        dueDate: invoice.due_date,
      });

      // Mettre à jour le statut de la facture
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

