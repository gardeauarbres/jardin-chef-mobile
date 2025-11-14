// Supabase Edge Function pour envoyer des factures par email via Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_API_URL = 'https://api.resend.com/emails'

// Variables Supabase - doivent être configurées comme secrets dans Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''

interface EmailRequest {
  to: string
  invoiceNumber: string
  clientName: string
  pdfBase64: string
  pdfFileName: string
  amount: number
  dueDate: string
}

serve(async (req) => {
  // Gérer les requêtes CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Vérifier la clé API Resend
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY n\'est pas configurée dans Supabase' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Récupérer le token d'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Vérifier que les variables Supabase sont disponibles
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Variables Supabase manquantes:', {
        SUPABASE_URL: SUPABASE_URL ? 'définie' : 'manquante',
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'définie' : 'manquante',
      })
      return new Response(
        JSON.stringify({ error: 'Configuration Supabase manquante' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Créer le client Supabase
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Erreur d\'authentification:', {
        error: authError,
        hasUser: !!user,
        authHeaderPrefix: authHeader?.substring(0, 20) + '...',
      })
      return new Response(
        JSON.stringify({ 
          error: 'Non autorisé',
          details: authError?.message || 'Token invalide ou expiré'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Parser le body de la requête
    const emailData: EmailRequest = await req.json()

    // Convertir la date d'échéance en format français
    const dueDateFormatted = new Date(emailData.dueDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Préparer le contenu de l'email
    const emailContent = {
      from: 'Jardin Chef <onboarding@resend.dev>',
      to: [emailData.to],
      subject: `Facture ${emailData.invoiceNumber} - Jardin Chef`,
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
            </style>
          </head>
          <body>
            <div class="header">
              <h1>JARDIN CHEF</h1>
              <p>Gestion pour Paysagistes</p>
            </div>
            <div class="content">
              <p>Bonjour ${emailData.clientName},</p>
              
              <p>Vous trouverez ci-joint votre facture <strong>${emailData.invoiceNumber}</strong>.</p>
              
              <div class="invoice-info">
                <p><strong>Montant total :</strong></p>
                <div class="amount">${emailData.amount.toFixed(2)} €</div>
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
          filename: emailData.pdfFileName,
          content: emailData.pdfBase64,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    }

    // Envoyer l'email via Resend
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Resend API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKeyPrefix: RESEND_API_KEY?.substring(0, 10) + '...',
      })
      
      // Message d'erreur plus détaillé
      let errorMessage = errorData.message || `Erreur lors de l'envoi de l'email: ${response.statusText}`
      
      if (errorData.name === 'restricted_api_key') {
        errorMessage = 'La clé API Resend est restreinte. Vérifiez que vous utilisez une clé avec les permissions complètes dans Supabase Secrets.'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message || 'Erreur lors de l\'envoi de l\'email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès', data }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Erreur dans la fonction Edge:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

