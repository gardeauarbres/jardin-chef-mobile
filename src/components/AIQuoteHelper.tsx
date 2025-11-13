import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateQuoteDescription, suggestQuotePrice, suggestDepositPercentage } from '@/lib/gemini';
import { toast } from 'sonner';

interface AIQuoteHelperProps {
  title: string;
  description: string;
  amount: string;
  onDescriptionGenerated: (description: string) => void;
  onPriceSuggested: (price: number) => void;
  onDepositSuggested: (percentage: number) => void;
}

export const AIQuoteHelper = ({
  title,
  description,
  amount,
  onDescriptionGenerated,
  onPriceSuggested,
  onDepositSuggested,
}: AIQuoteHelperProps) => {
  const [loading, setLoading] = useState<'description' | 'price' | 'deposit' | null>(null);

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      toast.error('Veuillez d\'abord saisir un titre');
      return;
    }

    setLoading('description');
    try {
      const generated = await generateQuoteDescription(title);
      onDescriptionGenerated(generated);
      toast.success('Description générée avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setLoading(null);
    }
  };

  const handleSuggestPrice = async () => {
    if (!title.trim()) {
      toast.error('Veuillez d\'abord saisir un titre');
      return;
    }

    setLoading('price');
    try {
      const suggestion = await suggestQuotePrice(title, description || undefined);
      onPriceSuggested(suggestion.suggestedPrice);
      toast.success(`Prix suggéré: ${suggestion.suggestedPrice}€ (${suggestion.reasoning})`, {
        duration: 5000,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suggestion de prix');
    } finally {
      setLoading(null);
    }
  };

  const handleSuggestDeposit = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Veuillez d\'abord saisir un montant');
      return;
    }

    setLoading('deposit');
    try {
      const percentage = await suggestDepositPercentage(amountNum);
      onDepositSuggested(percentage);
      toast.success(`Acompte suggéré: ${percentage}%`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suggestion d\'acompte');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerateDescription}
        disabled={loading !== null}
        className="text-xs"
      >
        {loading === 'description' ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1" />
        )}
        Générer description
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSuggestPrice}
        disabled={loading !== null}
        className="text-xs"
      >
        {loading === 'price' ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1" />
        )}
        Suggérer prix
      </Button>
      {amount && parseFloat(amount) > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggestDeposit}
          disabled={loading !== null}
          className="text-xs"
        >
          {loading === 'deposit' ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Suggérer acompte
        </Button>
      )}
    </div>
  );
};

