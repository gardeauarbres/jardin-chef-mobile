/**
 * Service d'envoi d'email pour les factures
 * Utilise Supabase Edge Function pour envoyer des emails via Resend API
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface SendInvoiceEmailParams {
  to: string;
  invoiceNumber: string;
  clientName: string;
  pdfBase64: string;
  pdfFileName: string;
  amount: number;
  dueDate: string;
}

/**
 * Envoie une facture par email via Supabase Edge Function (qui utilise Resend API)
 */
export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  clientName,
  pdfBase64,
  pdfFileName,
  amount,
  dueDate,
}: SendInvoiceEmailParams): Promise<void> {
  if (!SUPABASE_URL) {
    throw new Error(
      'VITE_SUPABASE_URL n\'est pas configurée. Veuillez vérifier votre configuration.'
    );
  }

  // Récupérer le token d'authentification depuis Supabase
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Vous devez être connecté pour envoyer un email');
  }

  // Appeler la Edge Function Supabase
  const functionUrl = `${SUPABASE_URL}/functions/v1/send-invoice-email`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify({
        to,
        invoiceNumber,
        clientName,
        pdfBase64,
        pdfFileName,
        amount,
        dueDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erreur lors de l'envoi de l'email: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur inconnue lors de l\'envoi de l\'email');
  }
}

/**
 * Vérifie si le service d'email est configuré
 */
export function isEmailServiceConfigured(): boolean {
  return !!SUPABASE_URL;
}

