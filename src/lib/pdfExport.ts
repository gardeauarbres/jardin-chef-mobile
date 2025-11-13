import jsPDF from 'jspdf';

interface InvoiceData {
  id: string;
  invoice_number: string;
  title: string;
  description?: string | null;
  amount: number;
  tax_rate?: number | null;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  client?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const exportInvoiceToPDF = (invoice: InvoiceData, userName?: string) => {
  const doc = new jsPDF();
  
  // Couleurs
  const primaryColor = [74, 222, 128]; // #4ade80
  const textColor = [0, 0, 0];
  const grayColor = [128, 128, 128];
  
  let yPos = 20;
  
  // En-tête avec couleur
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('JARDIN CHEF', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestion pour Paysagistes', 20, 32);
  
  yPos = 50;
  
  // Informations de la facture
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 20, yPos);
  
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`N° ${invoice.invoice_number}`, 20, yPos);
  
  yPos += 15;
  
  // Informations client
  if (invoice.client) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Facturé à :', 20, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${invoice.client.first_name} ${invoice.client.last_name}`, 20, yPos);
    
    if (invoice.client.address) {
      yPos += 5;
      doc.text(invoice.client.address, 20, yPos);
    }
    
    if (invoice.client.email) {
      yPos += 5;
      doc.text(`Email: ${invoice.client.email}`, 20, yPos);
    }
    
    if (invoice.client.phone) {
      yPos += 5;
      doc.text(`Téléphone: ${invoice.client.phone}`, 20, yPos);
    }
  }
  
  // Informations de facturation (à droite)
  const rightX = 120;
  yPos = 60;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  const issueDate = new Date(invoice.issue_date);
  doc.text(`Date d'émission: ${issueDate.toLocaleDateString('fr-FR')}`, rightX, yPos);
  
  yPos += 5;
  const dueDate = new Date(invoice.due_date);
  doc.text(`Date d'échéance: ${dueDate.toLocaleDateString('fr-FR')}`, rightX, yPos);
  
  yPos += 5;
  doc.text(`Statut: ${invoice.status.toUpperCase()}`, rightX, yPos);
  
  if (userName) {
    yPos += 5;
    doc.text(`Édité par: ${userName}`, rightX, yPos);
  }
  
  yPos = 110;
  
  // Ligne de séparation
  doc.setDrawColor(...grayColor);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  
  // Détails de la facture
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(invoice.title, 20, yPos);
  
  if (invoice.description) {
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(invoice.description, 170);
    doc.text(descriptionLines, 20, yPos);
    yPos += descriptionLines.length * 5;
  }
  
  yPos += 15;
  
  // Tableau des montants
  doc.setDrawColor(...textColor);
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, 170, 30, 'FD');
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text('Montant HT', 30, yPos);
  doc.text(`${invoice.amount.toFixed(2)} €`, 150, yPos, { align: 'right' });
  
  yPos += 8;
  const taxRate = invoice.tax_rate || 20.0;
  doc.text(`TVA (${taxRate}%)`, 30, yPos);
  doc.text(`${invoice.tax_amount.toFixed(2)} €`, 150, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Montant TTC', 30, yPos);
  doc.text(`${invoice.total_amount.toFixed(2)} €`, 150, yPos, { align: 'right' });
  
  yPos += 20;
  
  // Notes de bas de page
  if (yPos < 250) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...grayColor);
    doc.text('Merci de votre confiance !', 20, 280);
  }
  
  // Sauvegarder le PDF
  doc.save(`facture-${invoice.invoice_number}.pdf`);
};

interface QuoteData {
  id: string;
  title: string;
  description: string;
  amount: number;
  deposit_percentage?: number | null;
  deposit_amount?: number | null;
  status: string;
  created_at: string;
  client?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const exportQuoteToPDF = (quote: QuoteData, userName?: string) => {
  const doc = new jsPDF();
  
  // Couleurs
  const primaryColor = [74, 222, 128]; // #4ade80
  const textColor = [0, 0, 0];
  const grayColor = [128, 128, 128];
  
  let yPos = 20;
  
  // En-tête avec couleur
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('JARDIN CHEF', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestion pour Paysagistes', 20, 32);
  
  yPos = 50;
  
  // Informations du devis
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 20, yPos);
  
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`N° ${quote.id.substring(0, 8).toUpperCase()}`, 20, yPos);
  
  yPos += 8;
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('fr-FR')}`, 20, yPos);
  
  yPos += 15;
  
  // Informations client
  if (quote.client) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('CLIENT', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.client.first_name} ${quote.client.last_name}`, 20, yPos);
    
    if (quote.client.email) {
      yPos += 6;
      doc.text(`Email: ${quote.client.email}`, 20, yPos);
    }
    
    if (quote.client.phone) {
      yPos += 6;
      doc.text(`Téléphone: ${quote.client.phone}`, 20, yPos);
    }
    
    if (quote.client.address) {
      yPos += 6;
      doc.text(`Adresse: ${quote.client.address}`, 20, yPos);
    }
    
    yPos += 10;
  }
  
  // Ligne de séparation
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Titre du devis
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(quote.title || 'Devis', 20, yPos);
  
  yPos += 10;
  
  // Description
  if (quote.description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(quote.description, 170);
    doc.text(descriptionLines, 20, yPos);
    yPos += descriptionLines.length * 6 + 5;
  }
  
  yPos += 5;
  
  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Montants
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const montantHT = quote.amount;
  const tva = 0; // TVA à 0% par défaut (modifiable)
  const montantTTC = montantHT + tva;
  
  // Montant HT
  doc.text('Montant HT:', 120, yPos);
  doc.text(`${montantHT.toFixed(2)} €`, 170, yPos, { align: 'right' });
  
  if (quote.deposit_percentage && quote.deposit_percentage > 0) {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Acompte (${quote.deposit_percentage}%):`, 120, yPos);
    doc.text(`${(quote.deposit_amount || 0).toFixed(2)} €`, 170, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    const reste = montantTTC - (quote.deposit_amount || 0);
    doc.text('Reste à payer:', 120, yPos);
    doc.text(`${reste.toFixed(2)} €`, 170, yPos, { align: 'right' });
  }
  
  yPos += 10;
  
  // Ligne de séparation épaisse
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(120, yPos, 190, yPos);
  yPos += 8;
  
  // Total TTC
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL TTC:', 120, yPos);
  doc.text(`${montantTTC.toFixed(2)} €`, 170, yPos, { align: 'right' });
  
  yPos += 20;
  
  // Statut
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé',
  };
  doc.text(`Statut: ${statusLabels[quote.status] || quote.status}`, 20, yPos);
  
  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  yPos = pageHeight - 30;
  
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Ce devis est valable 30 jours à compter de sa date d\'émission.', 20, yPos);
  yPos += 5;
  doc.text('Merci de votre confiance.', 20, yPos);
  
  if (userName) {
    yPos += 5;
    doc.text(`Établi par: ${userName}`, 20, yPos);
  }
  
  // Nom du fichier
  const fileName = `Devis_${quote.title?.replace(/[^a-z0-9]/gi, '_') || quote.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Télécharger le PDF
  doc.save(fileName);
};

