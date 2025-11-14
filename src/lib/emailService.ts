import { EmailTemplate } from '@/components/EmailTemplates';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

interface TemplateVariables {
  [key: string]: string;
}

/**
 * Récupère un template d'email par son ID
 */
export function getEmailTemplate(templateId: string): EmailTemplate | null {
  const saved = localStorage.getItem('email-templates');
  if (!saved) return null;

  const templates: EmailTemplate[] = JSON.parse(saved);
  return templates.find((t) => t.id === templateId) || null;
}

/**
 * Récupère tous les templates d'une catégorie
 */
export function getEmailTemplatesByCategory(
  category: EmailTemplate['category']
): EmailTemplate[] {
  const saved = localStorage.getItem('email-templates');
  if (!saved) return [];

  const templates: EmailTemplate[] = JSON.parse(saved);
  return templates.filter((t) => t.category === category);
}

/**
 * Remplit un template avec les variables fournies
 */
export function fillEmailTemplate(
  template: EmailTemplate,
  variables: TemplateVariables
): EmailData {
  let subject = template.subject;
  let body = template.body;

  // Remplacer toutes les variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return {
    to: variables.client_email || '',
    subject,
    body,
  };
}

/**
 * Prépare un email pour une facture
 */
export function prepareInvoiceEmail(
  invoice: any,
  templateId: string = 'invoice-new'
): EmailData | null {
  const template = getEmailTemplate(templateId);
  if (!template) return null;

  const client = invoice.clients || invoice.client;
  const variables: TemplateVariables = {
    client_name: client
      ? `${client.first_name} ${client.last_name}`
      : 'Client',
    client_email: client?.email || '',
    invoice_number: invoice.invoice_number || '',
    total_amount: invoice.total_amount?.toFixed(2) || '0.00',
    amount: invoice.amount?.toFixed(2) || '0.00',
    tax_rate: invoice.tax_rate?.toString() || '20',
    tax_amount: invoice.tax_amount?.toFixed(2) || '0.00',
    issue_date: invoice.issue_date
      ? new Date(invoice.issue_date).toLocaleDateString('fr-FR')
      : '',
    due_date: invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString('fr-FR')
      : '',
    company_name: 'Jardin Chef',
    company_email: 'contact@jardinchef.fr',
    company_phone: '01 23 45 67 89',
  };

  return fillEmailTemplate(template, variables);
}

/**
 * Prépare un email pour un devis
 */
export function prepareQuoteEmail(
  quote: any,
  templateId: string = 'quote-new'
): EmailData | null {
  const template = getEmailTemplate(templateId);
  if (!template) return null;

  const client = quote.clients || quote.client;
  const variables: TemplateVariables = {
    client_name: client
      ? `${client.first_name} ${client.last_name}`
      : 'Client',
    client_email: client?.email || '',
    quote_number: quote.quote_number || '',
    description: quote.description || 'Travaux de jardinage',
    total_amount: quote.total_amount?.toFixed(2) || '0.00',
    valid_until: quote.valid_until
      ? new Date(quote.valid_until).toLocaleDateString('fr-FR')
      : '',
    company_name: 'Jardin Chef',
    company_email: 'contact@jardinchef.fr',
    company_phone: '01 23 45 67 89',
  };

  return fillEmailTemplate(template, variables);
}

/**
 * Prépare un email de rappel pour une facture
 */
export function prepareReminderEmail(
  invoice: any,
  templateId: string = 'reminder-gentle'
): EmailData | null {
  const template = getEmailTemplate(templateId);
  if (!template) return null;

  const client = invoice.clients || invoice.client;
  const variables: TemplateVariables = {
    client_name: client
      ? `${client.first_name} ${client.last_name}`
      : 'Client',
    client_email: client?.email || '',
    invoice_number: invoice.invoice_number || '',
    total_amount: invoice.total_amount?.toFixed(2) || '0.00',
    due_date: invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString('fr-FR')
      : '',
    company_name: 'Jardin Chef',
    company_email: 'contact@jardinchef.fr',
    company_phone: '01 23 45 67 89',
  };

  return fillEmailTemplate(template, variables);
}

/**
 * Simule l'envoi d'un email (à remplacer par un vrai service d'envoi)
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  // Pour l'instant, on simule l'envoi
  console.log('📧 Email simulé:', emailData);
  
  // TODO: Intégrer avec un service d'envoi d'emails (Resend, SendGrid, etc.)
  // Exemple avec Resend:
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'noreply@jardinchef.fr',
  //     to: emailData.to,
  //     subject: emailData.subject,
  //     text: emailData.body,
  //   }),
  // });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}
