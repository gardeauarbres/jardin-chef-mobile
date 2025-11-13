import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useInvoiceMutation, Invoice, useGenerateInvoiceFromQuote } from '@/hooks/useInvoices';
import { useQuotes, useSites } from '@/hooks/useSupabaseQuery';
import { toast } from 'sonner';
import { CalendarIcon, Plus, FileText } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const invoiceSchema = z.object({
  quoteId: z.string().uuid('Veuillez sélectionner un devis'),
  siteId: z.string().uuid('Veuillez sélectionner un chantier'),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Le montant doit être un nombre valide'),
  taxRate: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Le taux de TVA doit être un nombre valide'),
  dueDate: z.date(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  quoteId?: string; // Pour pré-remplir depuis un devis
  siteId?: string; // Pour pré-remplir depuis un chantier
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function InvoiceForm({
  invoice,
  quoteId,
  siteId,
  onSuccess,
  trigger,
}: InvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    invoice ? new Date(invoice.due_date) : addDays(new Date(), 30)
  );

  const mutation = useInvoiceMutation();
  const generateFromQuote = useGenerateInvoiceFromQuote();
  const { data: quotes } = useQuotes();
  const { data: sites } = useSites();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      quoteId: invoice?.quote_id || quoteId || '',
      siteId: invoice?.site_id || siteId || '',
      title: invoice?.title || '',
      description: invoice?.description || '',
      amount: invoice?.amount.toString() || '',
      taxRate: invoice?.tax_rate?.toString() || '20.0',
      dueDate: invoice ? new Date(invoice.due_date) : addDays(new Date(), 30),
      status: (invoice?.status as any) || 'draft',
      notes: invoice?.notes || '',
    },
  });

  useEffect(() => {
    if (dueDate) {
      form.setValue('dueDate', dueDate);
    }
  }, [dueDate, form]);

  // Pré-remplir depuis le devis sélectionné
  useEffect(() => {
    const selectedQuoteId = form.watch('quoteId');
    if (selectedQuoteId && quotes) {
      const quote = quotes.find((q: any) => q.id === selectedQuoteId);
      if (quote) {
        form.setValue('title', `Facture - ${quote.title}`);
        form.setValue('description', quote.description);
        form.setValue('amount', quote.amount.toString());
        
        // Trouver le chantier associé au devis
        if (sites) {
          const associatedSite = sites.find((s: any) => s.quote_id === quote.id);
          if (associatedSite) {
            form.setValue('siteId', associatedSite.id);
          }
        }
      }
    }
  }, [form.watch('quoteId'), quotes, sites, form]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      // Trouver le client depuis le devis
      const quote = quotes?.find((q: any) => q.id === data.quoteId);
      if (!quote) {
        toast.error('Devis non trouvé');
        return;
      }

      await mutation.mutateAsync({
        id: invoice?.id,
        quoteId: data.quoteId,
        siteId: data.siteId,
        clientId: quote.client_id,
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        taxRate: parseFloat(data.taxRate),
        dueDate: data.dueDate,
        status: data.status,
        notes: data.notes,
      });

      toast.success(
        invoice ? 'Facture modifiée avec succès' : 'Facture créée avec succès'
      );
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleGenerateFromQuote = async () => {
    const selectedQuoteId = form.watch('quoteId');
    const selectedSiteId = form.watch('siteId');
    
    if (!selectedQuoteId || !selectedSiteId) {
      toast.error('Veuillez sélectionner un devis et un chantier');
      return;
    }

    try {
      await generateFromQuote.mutateAsync({
        quoteId: selectedQuoteId,
        siteId: selectedSiteId,
      });
      toast.success('Facture générée automatiquement depuis le devis');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    }
  };

  const selectedQuote = quotes?.find((q: any) => q.id === form.watch('quoteId'));
  const canGenerateFromQuote = selectedQuote?.status === 'accepted' && !invoice;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Devis */}
          <div className="space-y-2">
            <Label htmlFor="quoteId">Devis *</Label>
            <Select
              value={form.watch('quoteId')}
              onValueChange={(value) => form.setValue('quoteId', value)}
              disabled={!!invoice}
            >
              <SelectTrigger id="quoteId">
                <SelectValue placeholder="Sélectionner un devis" />
              </SelectTrigger>
              <SelectContent>
                {quotes?.map((quote: any) => (
                  <SelectItem key={quote.id} value={quote.id}>
                    {quote.title} - {quote.amount}€ ({quote.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.quoteId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.quoteId.message}
              </p>
            )}
            {canGenerateFromQuote && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateFromQuote}
                disabled={generateFromQuote.isPending}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generateFromQuote.isPending
                  ? 'Génération...'
                  : 'Générer automatiquement depuis le devis'}
              </Button>
            )}
          </div>

          {/* Chantier */}
          <div className="space-y-2">
            <Label htmlFor="siteId">Chantier *</Label>
            <Select
              value={form.watch('siteId')}
              onValueChange={(value) => form.setValue('siteId', value)}
              disabled={!!invoice}
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
              placeholder="Ex: Facture - Aménagement jardin"
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
              placeholder="Détails de la facture..."
              rows={3}
            />
          </div>

          {/* Montant et TVA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant HT (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA (%) *</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                {...form.register('taxRate')}
              />
              {form.formState.errors.taxRate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taxRate.message}
                </p>
              )}
            </div>
          </div>

          {/* Calcul automatique du TTC */}
          {form.watch('amount') && form.watch('taxRate') && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex justify-between text-sm">
                <span>Montant HT:</span>
                <span>{parseFloat(form.watch('amount') || '0').toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA ({form.watch('taxRate')}%):</span>
                <span>
                  {(
                    (parseFloat(form.watch('amount') || '0') *
                      parseFloat(form.watch('taxRate') || '0')) /
                    100
                  ).toFixed(2)}{' '}
                  €
                </span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Montant TTC:</span>
                <span>
                  {(
                    parseFloat(form.watch('amount') || '0') +
                    (parseFloat(form.watch('amount') || '0') *
                      parseFloat(form.watch('taxRate') || '0')) /
                      100
                  ).toFixed(2)}{' '}
                  €
                </span>
              </div>
            </div>
          )}

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label>Date d'échéance *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Notes internes (non visibles par le client)..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending || generateFromQuote.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending || generateFromQuote.isPending}>
              {mutation.isPending
                ? 'Enregistrement...'
                : invoice
                ? 'Modifier'
                : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

