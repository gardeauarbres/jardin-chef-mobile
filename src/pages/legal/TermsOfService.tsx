import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/legal')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Lock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Conditions Générales d'Utilisation</h1>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions d'utilisation de Jardin Chef</CardTitle>
            <CardDescription>
              Règles et conditions d'utilisation de l'application pour garantir une expérience optimale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">1. Objet</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités et conditions 
                dans lesquelles Jardin Chef met à disposition son application web de gestion pour les professionnels 
                du paysage et de l'entretien de jardins.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">2. Acceptation des CGU</h3>
              <p className="text-muted-foreground leading-relaxed">
                L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU. 
                En créant un compte, vous reconnaissez avoir lu, compris et accepté ces conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">3. Inscription et compte utilisateur</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour utiliser l'application, vous devez :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Être majeur et capable juridiquement</li>
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Ne pas partager votre compte avec des tiers</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">4. Services proposés</h3>
              <p className="text-muted-foreground leading-relaxed">
                Jardin Chef propose les fonctionnalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Gestion de clients et prospects</li>
                <li>Création et suivi de devis</li>
                <li>Gestion de chantiers et calendrier</li>
                <li>Facturation et suivi des paiements</li>
                <li>Gestion d'employés et heures de travail</li>
                <li>Gestion de stock et matériaux</li>
                <li>Génération de documents PDF</li>
                <li>Statistiques et analyses</li>
                <li>Assistant IA</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">5. Obligations de l'utilisateur</h3>
              <p className="text-muted-foreground leading-relaxed">
                En utilisant l'application, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Utiliser l'application de manière licite et conforme</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                <li>Ne pas utiliser l'application pour des activités illégales</li>
                <li>Ne pas transmettre de virus ou code malveillant</li>
                <li>Ne pas collecter de données d'autres utilisateurs</li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">6. Disponibilité du service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous efforçons de maintenir l'application disponible 24h/24 et 7j/7. Toutefois, nous nous 
                réservons le droit de suspendre temporairement l'accès pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maintenance technique programmée</li>
                <li>Mise à jour et amélioration des services</li>
                <li>Intervention d'urgence en cas de panne</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Nous ne pouvons être tenus responsables des interruptions indépendantes de notre volonté.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">7. Tarification</h3>
              <p className="text-muted-foreground leading-relaxed">
                L'application propose différentes formules d'abonnement détaillées sur notre site. 
                Les tarifs sont exprimés en euros TTC et peuvent être modifiés avec un préavis de 30 jours.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Le paiement s'effectue par carte bancaire de manière sécurisée. Aucun remboursement 
                n'est effectué en cas de résiliation en cours d'abonnement.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">8. Propriété intellectuelle</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tous les éléments de l'application (structure, design, code, contenu, logos, marques) 
                sont protégés par le droit d'auteur et restent la propriété exclusive de Jardin Chef.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vous conservez la propriété de toutes les données que vous saisissez dans l'application.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">9. Résiliation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez résilier votre compte à tout moment depuis les paramètres de l'application. 
                Nous nous réservons le droit de suspendre ou résilier votre compte en cas de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Non-respect des présentes CGU</li>
                <li>Non-paiement des sommes dues</li>
                <li>Utilisation frauduleuse ou abusive</li>
                <li>Atteinte à la sécurité du service</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">10. Responsabilité</h3>
              <p className="text-muted-foreground leading-relaxed">
                Notre responsabilité est limitée aux dommages directs et prévisibles. Nous ne sommes 
                pas responsables :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Des pertes de données dues à une erreur de votre part</li>
                <li>Des dommages indirects (perte de revenus, d'opportunités)</li>
                <li>Des actes de tiers (piratage, virus)</li>
                <li>De l'utilisation incorrecte de l'application</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">11. Modifications des CGU</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
                seront informés par email des modifications importantes. La poursuite de l'utilisation 
                après modification vaut acceptation des nouvelles CGU.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">12. Droit applicable et juridiction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut 
                de résolution amiable, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">13. Contact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces CGU, contactez-nous à : <strong>chantiers@gardeauarbres.fr</strong>
              </p>
            </section>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-center">
                ✅ En utilisant Jardin Chef, vous acceptez ces conditions et vous engagez à les respecter.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

