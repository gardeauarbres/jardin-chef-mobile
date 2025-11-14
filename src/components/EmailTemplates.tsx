import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Eye, Edit, Trash2, Plus, Copy, FileText, Bell, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'invoice' | 'quote' | 'reminder' | 'general';
  subject: string;
  body: string;
  variables: string[];
  isDefault: boolean;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'invoice-new',
    name: 'Nouvelle facture',
    category: 'invoice',
    subject: 'Facture {{invoice_number}} - {{company_name}}',
    body: `Bonjour {{client_name}},

Veuillez trouver ci-joint la facture {{invoice_number}} d'un montant de {{total_amount}}€.

Détails de la facture :
- Numéro : {{invoice_number}}
- Date d'émission : {{issue_date}}
- Date d'échéance : {{due_date}}
- Montant HT : {{amount}}€
- TVA ({{tax_rate}}%) : {{tax_amount}}€
- Montant TTC : {{total_amount}}€

Merci de procéder au règlement avant la date d'échéance.

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
{{company_name}}
{{company_email}}
{{company_phone}}`,
    variables: ['client_name', 'invoice_number', 'total_amount', 'issue_date', 'due_date', 'amount', 'tax_rate', 'tax_amount', 'company_name', 'company_email', 'company_phone'],
    isDefault: true,
  },
  {
    id: 'quote-new',
    name: 'Nouveau devis',
    category: 'quote',
    subject: 'Devis {{quote_number}} - {{company_name}}',
    body: `Bonjour {{client_name}},

Nous vous remercions pour votre demande.

Veuillez trouver ci-joint notre devis {{quote_number}} pour les travaux suivants :

{{description}}

Montant total : {{total_amount}}€ TTC

Ce devis est valable jusqu'au {{valid_until}}.

N'hésitez pas à nous contacter pour toute question ou précision.

Nous restons à votre disposition.

Cordialement,
{{company_name}}
{{company_email}}
{{company_phone}}`,
    variables: ['client_name', 'quote_number', 'description', 'total_amount', 'valid_until', 'company_name', 'company_email', 'company_phone'],
    isDefault: true,
  },
  {
    id: 'quote-accepted',
    name: 'Devis accepté',
    category: 'quote',
    subject: 'Confirmation - Devis {{quote_number}} accepté',
    body: `Bonjour {{client_name}},

Nous vous remercions d'avoir accepté notre devis {{quote_number}}.

Nous allons maintenant planifier les travaux et vous tiendrons informé(e) de l'avancement.

Début des travaux prévu : {{start_date}}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
{{company_name}}`,
    variables: ['client_name', 'quote_number', 'start_date', 'company_name'],
    isDefault: true,
  },
  {
    id: 'reminder-gentle',
    name: 'Rappel amical',
    category: 'reminder',
    subject: 'Rappel amical - Facture {{invoice_number}}',
    body: `Bonjour {{client_name}},

Nous vous contactons concernant la facture {{invoice_number}} d'un montant de {{total_amount}}€, dont l'échéance était fixée au {{due_date}}.

Il s'agit peut-être d'un simple oubli de votre part.

Nous vous serions reconnaissants de bien vouloir procéder au paiement dans les plus brefs délais.

En cas de problème, n'hésitez pas à nous contacter.

Cordialement,
{{company_name}}`,
    variables: ['client_name', 'invoice_number', 'total_amount', 'due_date', 'company_name'],
    isDefault: true,
  },
  {
    id: 'appointment-confirmation',
    name: 'Confirmation de rendez-vous',
    category: 'general',
    subject: 'Confirmation de rendez-vous - {{appointment_date}}',
    body: `Bonjour {{client_name}},

Nous confirmons votre rendez-vous :

Date : {{appointment_date}}
Heure : {{appointment_time}}
Lieu : {{appointment_location}}
Objet : {{appointment_subject}}

En cas d'empêchement, merci de nous prévenir au plus tôt.

À bientôt,
{{company_name}}
{{company_phone}}`,
    variables: ['client_name', 'appointment_date', 'appointment_time', 'appointment_location', 'appointment_subject', 'company_name', 'company_phone'],
    isDefault: true,
  },
];

interface EmailTemplatesProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export const EmailTemplates = ({ onSelectTemplate }: EmailTemplatesProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('email-templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewData, setPreviewData] = useState({
    client_name: 'Jean Dupont',
    invoice_number: 'FAC-2024-001',
    quote_number: 'DEV-2024-001',
    total_amount: '1250.00',
    amount: '1041.67',
    tax_rate: '20',
    tax_amount: '208.33',
    issue_date: '14/11/2024',
    due_date: '14/12/2024',
    valid_until: '14/12/2024',
    description: 'Entretien du jardin et taille des haies',
    start_date: '20/11/2024',
    appointment_date: '20/11/2024',
    appointment_time: '14h00',
    appointment_location: '123 Rue des Jardins, 75001 Paris',
    appointment_subject: 'Consultation pour aménagement paysager',
    company_name: 'Jardin Chef',
    company_email: 'contact@jardinchef.fr',
    company_phone: '01 23 45 67 89',
  });

  useEffect(() => {
    localStorage.setItem('email-templates', JSON.stringify(templates));
  }, [templates]);

  const filteredTemplates = templates.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.id.startsWith('new-')) {
      // Nouveau template
      const newTemplate = {
        ...editingTemplate,
        id: `custom-${Date.now()}`,
        isDefault: false,
      };
      setTemplates([...templates, newTemplate]);
      toast.success('Template créé avec succès');
    } else {
      // Mise à jour
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)));
      toast.success('Template mis à jour');
    }

    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template?.isDefault) {
      toast.error('Impossible de supprimer un template par défaut');
      return;
    }

    setTemplates(templates.filter((t) => t.id !== id));
    toast.success('Template supprimé');
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (copie)`,
      isDefault: false,
    };
    setTemplates([...templates, newTemplate]);
    toast.success('Template dupliqué');
  };

  const handleNewTemplate = () => {
    setEditingTemplate({
      id: 'new-' + Date.now(),
      name: 'Nouveau template',
      category: 'general',
      subject: '',
      body: '',
      variables: [],
      isDefault: false,
    });
    setIsEditing(true);
  };

  const fillTemplate = (text: string): string => {
    let filled = text;
    Object.entries(previewData).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return filled;
  };

  const getCategoryIcon = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'general':
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'invoice':
        return 'Facture';
      case 'quote':
        return 'Devis';
      case 'reminder':
        return 'Rappel';
      case 'general':
        return 'Général';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Templates d'emails
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalisez vos emails pour factures, devis et rappels
          </p>
        </div>
        <Button onClick={handleNewTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="invoice">Factures</SelectItem>
            <SelectItem value="quote">Devis</SelectItem>
            <SelectItem value="reminder">Rappels</SelectItem>
            <SelectItem value="general">Général</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(template.category)}
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Par défaut
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Objet :</p>
                <p className="text-sm font-medium truncate">{template.subject}</p>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Aperçu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Aperçu du template</DialogTitle>
                      <DialogDescription>{template.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Objet :</label>
                        <div className="p-3 bg-muted rounded-md">
                          {fillTemplate(template.subject)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Message :</label>
                        <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                          {fillTemplate(template.body)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          Variables disponibles :
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id.startsWith('new-') ? 'Nouveau template' : 'Modifier le template'}
            </DialogTitle>
            <DialogDescription>
              Utilisez les variables entre accolades doubles (ex: {`{{client_name}}`})
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom du template</label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="Ex: Nouvelle facture"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select
                    value={editingTemplate.category}
                    onValueChange={(value: EmailTemplate['category']) =>
                      setEditingTemplate({ ...editingTemplate, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Facture</SelectItem>
                      <SelectItem value="quote">Devis</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                      <SelectItem value="general">Général</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Objet de l'email</label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                  placeholder="Ex: Facture {{invoice_number}}"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Corps du message</label>
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, body: e.target.value })
                  }
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="Bonjour {{client_name}},&#10;&#10;..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Aperçu en temps réel</label>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Objet :</p>
                    <p className="font-semibold">{fillTemplate(editingTemplate.subject)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                    {fillTemplate(editingTemplate.body)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

