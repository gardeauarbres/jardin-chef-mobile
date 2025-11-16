import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Lock, 
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLegalAcceptances } from '@/hooks/useLegalAcceptances';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MobileNav from '@/components/MobileNav';

const legalDocuments = [
  {
    id: 'privacy',
    title: 'Politique de confidentialité',
    description: 'Comment nous protégeons vos données personnelles',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    route: '/legal/privacy',
    key: 'privacy_policy_accepted' as const,
    dateKey: 'privacy_policy_accepted_at' as const,
  },
  {
    id: 'legal',
    title: 'Mentions légales',
    description: 'Informations sur l\'éditeur et l\'hébergement',
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    route: '/legal/legal-notice',
    key: 'legal_notice_accepted' as const,
    dateKey: 'legal_notice_accepted_at' as const,
  },
  {
    id: 'terms',
    title: 'Conditions d\'utilisation',
    description: 'Règles d\'utilisation de l\'application',
    icon: Lock,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    route: '/legal/terms',
    key: 'terms_of_service_accepted' as const,
    dateKey: 'terms_of_service_accepted_at' as const,
  },
];

export default function LegalHub() {
  const navigate = useNavigate();
  const { data: acceptances, isLoading } = useLegalAcceptances();

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/more')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Documents légaux</h1>
            <p className="text-sm text-muted-foreground">
              Consultez nos politiques et conditions
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {!isLoading && acceptances && (
          <Card className={`border-2 ${
            acceptances.privacy_policy_accepted && 
            acceptances.legal_notice_accepted && 
            acceptances.terms_of_service_accepted
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-orange-500/5 border-orange-500/20'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {acceptances.privacy_policy_accepted && 
                 acceptances.legal_notice_accepted && 
                 acceptances.terms_of_service_accepted ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">✅ Tous les documents sont acceptés</p>
                      <p className="text-sm text-muted-foreground">
                        Votre compte est conforme aux conditions d'utilisation
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">⚠️ Documents en attente</p>
                      <p className="text-sm text-muted-foreground">
                        Certains documents n'ont pas encore été acceptés
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Grid */}
        <div className="space-y-4">
          {legalDocuments.map((doc) => {
            const Icon = doc.icon;
            const isAccepted = acceptances?.[doc.key] ?? false;
            const acceptedDate = acceptances?.[doc.dateKey];

            return (
              <Card 
                key={doc.id}
                className={`border-2 ${doc.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => navigate(doc.route)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${doc.bgColor} flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${doc.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        {isAccepted ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Accepté
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 flex-shrink-0">
                            En attente
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {doc.description}
                      </p>

                      {/* Acceptance Date */}
                      {isAccepted && acceptedDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Accepté le {formatDate(acceptedDate)}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(doc.route);
                        }}
                      >
                        Consulter le document
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Box */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>📌 Important :</strong> Ces documents définissent vos droits et obligations 
                lors de l'utilisation de Jardin Chef.
              </p>
              <p>
                <strong>🔄 Mises à jour :</strong> Nous vous informerons par email en cas de 
                modification importante de ces documents.
              </p>
              <p>
                <strong>❓ Questions :</strong> Pour toute question, contactez-nous à 
                <strong> alain@gardeauarbres.fr</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}

