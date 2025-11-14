import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Bell, Mail, Calendar, CheckCircle, Clock, AlertCircle, Send, FileText } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { toast } from 'sonner';
import { getEmailTemplatesByCategory, prepareReminderEmail } from '@/lib/emailService';
import { EmailTemplate } from '@/components/EmailTemplates';

interface ReminderSystemProps {
  invoices: any[];
}

interface Reminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  daysLate: number;
  lastReminder?: Date;
  reminderCount: number;
  nextReminderDate?: Date;
}

const REMINDER_TEMPLATES = {
  first: {
    name: 'Premier rappel (J+7)',
    subject: 'Rappel de paiement - Facture {{invoice_number}}',
    body: `Bonjour {{client_name}},

Nous vous contactons concernant la facture {{invoice_number}} d'un montant de {{amount}}€, dont l'échéance était fixée au {{due_date}}.

À ce jour, nous n'avons pas reçu votre règlement. Il s'agit peut-être d'un simple oubli de votre part.

Nous vous serions reconnaissants de bien vouloir procéder au paiement dans les plus brefs délais.

En cas de problème ou de question, n'hésitez pas à nous contacter.

Cordialement,
{{user_name}}`,
  },
  second: {
    name: 'Deuxième rappel (J+15)',
    subject: 'Relance de paiement - Facture {{invoice_number}}',
    body: `Bonjour {{client_name}},

Nous revenons vers vous concernant la facture {{invoice_number}} d'un montant de {{amount}}€, échue depuis {{days_late}} jours.

Malgré notre premier rappel, nous n'avons toujours pas reçu votre règlement.

Nous vous prions de bien vouloir régulariser cette situation rapidement afin d'éviter tout désagrément.

Si vous rencontrez des difficultés, merci de nous contacter pour trouver une solution.

Cordialement,
{{user_name}}`,
  },
  third: {
    name: 'Troisième rappel (J+30)',
    subject: 'URGENT - Dernier rappel avant mise en demeure - Facture {{invoice_number}}',
    body: `Bonjour {{client_name}},

Nous vous contactons une dernière fois concernant la facture {{invoice_number}} d'un montant de {{amount}}€, échue depuis {{days_late}} jours.

Malgré nos précédents rappels, nous n'avons toujours pas reçu votre paiement.

Nous vous informons que sans règlement sous 7 jours, nous serons dans l'obligation d'engager une procédure de recouvrement.

Nous restons à votre disposition pour toute question.

Cordialement,
{{user_name}}`,
  },
};

export const ReminderSystem = ({ invoices }: ReminderSystemProps) => {
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [reminderTemplate, setReminderTemplate] = useState<'first' | 'second' | 'third'>('first');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [sentReminders, setSentReminders] = useState<Map<string, { date: Date; count: number }>>(
    () => {
      const saved = localStorage.getItem('invoice-reminders');
      if (saved) {
        const data = JSON.parse(saved);
        return new Map(Object.entries(data).map(([k, v]: [string, any]) => [k, { date: new Date(v.date), count: v.count }]));
      }
      return new Map();
    }
  );

  // Calculer les factures nécessitant des rappels
  const reminders = useMemo(() => {
    const today = new Date();
    const reminderList: Reminder[] = [];

    invoices.forEach((invoice: any) => {
      if (invoice.status === 'sent' || invoice.status === 'overdue') {
        if (!invoice.due_date) return;

        const dueDate = parseISO(invoice.due_date);
        const daysLate = differenceInDays(today, dueDate);

        if (daysLate > 0) {
          const clientName = invoice.clients
            ? `${invoice.clients.first_name} ${invoice.clients.last_name}`
            : 'Client inconnu';

          const reminderData = sentReminders.get(invoice.id);
          const reminderCount = reminderData?.count || 0;
          const lastReminder = reminderData?.date;

          // Déterminer si un nouveau rappel est nécessaire
          let needsReminder = false;
          let nextReminderDate: Date | undefined;

          if (reminderCount === 0 && daysLate >= 7) {
            needsReminder = true;
            nextReminderDate = new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          } else if (reminderCount === 1 && daysLate >= 15) {
            needsReminder = true;
            nextReminderDate = new Date(dueDate.getTime() + 15 * 24 * 60 * 60 * 1000);
          } else if (reminderCount === 2 && daysLate >= 30) {
            needsReminder = true;
            nextReminderDate = new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          if (needsReminder || daysLate > 0) {
            reminderList.push({
              id: invoice.id,
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoice_number,
              clientName,
              amount: invoice.total_amount,
              daysLate,
              lastReminder,
              reminderCount,
              nextReminderDate,
            });
          }
        }
      }
    });

    return reminderList.sort((a, b) => b.daysLate - a.daysLate);
  }, [invoices, sentReminders]);

  const getRecommendedTemplate = (reminder: Reminder): 'first' | 'second' | 'third' => {
    if (reminder.reminderCount === 0 || reminder.daysLate < 15) return 'first';
    if (reminder.reminderCount === 1 || reminder.daysLate < 30) return 'second';
    return 'third';
  };

  const fillTemplate = (template: string, reminder: Reminder, userName: string = 'Jardin Chef'): string => {
    const invoice = invoices.find(inv => inv.id === reminder.invoiceId);
    const dueDate = invoice?.due_date ? format(parseISO(invoice.due_date), 'dd/MM/yyyy', { locale: fr }) : '';

    return template
      .replace(/{{invoice_number}}/g, reminder.invoiceNumber)
      .replace(/{{client_name}}/g, reminder.clientName)
      .replace(/{{amount}}/g, reminder.amount.toFixed(2))
      .replace(/{{due_date}}/g, dueDate)
      .replace(/{{days_late}}/g, reminder.daysLate.toString())
      .replace(/{{user_name}}/g, userName);
  };

  const handleOpenDialog = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    const template = getRecommendedTemplate(reminder);
    setReminderTemplate(template);
    
    // Charger les templates personnalisés
    const customTemplates = getEmailTemplatesByCategory('reminder');
    setAvailableTemplates(customTemplates);
    
    const templateData = REMINDER_TEMPLATES[template];
    setCustomSubject(fillTemplate(templateData.subject, reminder));
    setCustomMessage(fillTemplate(templateData.body, reminder));
    setUseCustomTemplate(false);
  };

  const handleSelectCustomTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setUseCustomTemplate(true);
    
    if (selectedReminder) {
      const invoice = invoices.find(inv => inv.id === selectedReminder.invoiceId);
      if (invoice) {
        const emailData = prepareReminderEmail(invoice, templateId);
        if (emailData) {
          setCustomSubject(emailData.subject);
          setCustomMessage(emailData.body);
        }
      }
    }
  };

  const handleSendReminder = () => {
    if (!selectedReminder) return;

    // Simuler l'envoi d'email (à remplacer par un vrai service d'envoi)
    // Pour l'instant, on sauvegarde juste l'historique
    const newReminders = new Map(sentReminders);
    const currentCount = sentReminders.get(selectedReminder.id)?.count || 0;
    newReminders.set(selectedReminder.id, {
      date: new Date(),
      count: currentCount + 1,
    });
    
    setSentReminders(newReminders);
    
    // Sauvegarder dans localStorage
    const dataToSave = Object.fromEntries(
      Array.from(newReminders.entries()).map(([k, v]) => [k, { date: v.date.toISOString(), count: v.count }])
    );
    localStorage.setItem('invoice-reminders', JSON.stringify(dataToSave));

    toast.success(`Rappel envoyé à ${selectedReminder.clientName}`);
    setSelectedReminder(null);
  };

  const urgentReminders = reminders.filter(r => r.daysLate >= 30);
  const warningReminders = reminders.filter(r => r.daysLate >= 15 && r.daysLate < 30);
  const normalReminders = reminders.filter(r => r.daysLate >= 7 && r.daysLate < 15);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Rappels de paiement
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les relances pour vos factures impayées
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentReminders.length}</div>
            <div className="text-xs text-muted-foreground">+30 jours de retard</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningReminders.length}</div>
            <div className="text-xs text-muted-foreground">15-30 jours de retard</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              À relancer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{normalReminders.length}</div>
            <div className="text-xs text-muted-foreground">7-15 jours de retard</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des rappels */}
      <Card>
        <CardHeader>
          <CardTitle>Factures à relancer</CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucune facture en retard ! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{reminder.invoiceNumber}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm">{reminder.clientName}</span>
                      {reminder.daysLate >= 30 && (
                        <Badge variant="destructive" className="ml-2">
                          Urgent
                        </Badge>
                      )}
                      {reminder.daysLate >= 15 && reminder.daysLate < 30 && (
                        <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">
                          Attention
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{reminder.amount.toFixed(2)}€</span>
                      <span>•</span>
                      <span className="text-red-600">
                        {reminder.daysLate} jour{reminder.daysLate > 1 ? 's' : ''} de retard
                      </span>
                      {reminder.lastReminder && (
                        <>
                          <span>•</span>
                          <span>
                            Dernier rappel: {format(reminder.lastReminder, 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {reminder.reminderCount} rappel{reminder.reminderCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDialog(reminder)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer rappel
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Envoyer un rappel de paiement</DialogTitle>
                        <DialogDescription>
                          Facture {selectedReminder?.invoiceNumber} - {selectedReminder?.clientName}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Button
                            variant={!useCustomTemplate ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setUseCustomTemplate(false);
                              if (selectedReminder) {
                                const templateData = REMINDER_TEMPLATES[reminderTemplate];
                                setCustomSubject(fillTemplate(templateData.subject, selectedReminder));
                                setCustomMessage(fillTemplate(templateData.body, selectedReminder));
                              }
                            }}
                          >
                            Templates par défaut
                          </Button>
                          {availableTemplates.length > 0 && (
                            <Button
                              variant={useCustomTemplate ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUseCustomTemplate(true)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Mes templates ({availableTemplates.length})
                            </Button>
                          )}
                        </div>

                        {!useCustomTemplate ? (
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Template de rappel
                            </label>
                            <Select
                              value={reminderTemplate}
                              onValueChange={(value: 'first' | 'second' | 'third') => {
                                setReminderTemplate(value);
                                if (selectedReminder) {
                                  const templateData = REMINDER_TEMPLATES[value];
                                  setCustomSubject(fillTemplate(templateData.subject, selectedReminder));
                                  setCustomMessage(fillTemplate(templateData.body, selectedReminder));
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first">
                                  {REMINDER_TEMPLATES.first.name}
                                </SelectItem>
                                <SelectItem value="second">
                                  {REMINDER_TEMPLATES.second.name}
                                </SelectItem>
                                <SelectItem value="third">
                                  {REMINDER_TEMPLATES.third.name}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Choisir un template personnalisé
                            </label>
                            <Select
                              value={selectedTemplateId}
                              onValueChange={handleSelectCustomTemplate}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un template" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Objet de l'email
                          </label>
                          <Input
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder="Objet du message"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Message
                          </label>
                          <Textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setSelectedReminder(null)}>
                            Annuler
                          </Button>
                          <Button onClick={handleSendReminder}>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer le rappel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

