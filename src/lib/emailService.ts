/**
 * Service d'envoi d'email pour les factures
 * Utilise Resend API pour envoyer des emails avec pièces jointes PDF
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

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
 * Envoie une facture par email via Resend API
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
  if (!RESEND_API_KEY) {
    throw new Error(
      'VITE_RESEND_API_KEY n\'est pas configurée. Veuillez ajouter votre clé API Resend dans le fichier .env'
    );
  }

  // Convertir la date d'échéance en format français
  const dueDateFormatted = new Date(dueDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const emailContent = {
    from: 'Jardin Chef <onboarding@resend.dev>', // À configurer avec votre domaine vérifié dans Resend (ou utiliser onboarding@resend.dev pour les tests)
    to: [to],
    subject: `Facture ${invoiceNumber} - Jardin Chef`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4ade80;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .invoice-info {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #4ade80;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #4ade80;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JARDIN CHEF</h1>
            <p>Gestion pour Paysagistes</p>
          </div>
          <div class="content">
            <p>Bonjour ${clientName},</p>
            
            <p>Vous trouverez ci-joint votre facture <strong>${invoiceNumber}</strong>.</p>
            
            <div class="invoice-info">
              <p><strong>Montant total :</strong></p>
              <div class="amount">${amount.toFixed(2)} €</div>
              <p><strong>Date d'échéance :</strong> ${dueDateFormatted}</p>
            </div>
            
            <p>Merci de régler cette facture avant la date d'échéance indiquée.</p>
            
            <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>L'équipe Jardin Chef</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
          </div>
        </body>
      </html>
    `,
    attachments: [
      {
        filename: pdfFileName,
        content: pdfBase64,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Erreur lors de l'envoi de l'email: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Erreur lors de l\'envoi de l\'email');
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
  return !!RESEND_API_KEY;
}

