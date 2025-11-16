import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPolicy() {
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
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Protection de vos données personnelles</CardTitle>
            <CardDescription>
              Jardin Chef s'engage à protéger votre vie privée et vos données personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">1. Données collectées</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous collectons uniquement les données nécessaires au fonctionnement de l'application :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Informations de compte (email, nom, prénom)</li>
                <li>Données professionnelles (entreprise, SIRET, adresse)</li>
                <li>Données de facturation et devis</li>
                <li>Informations clients et chantiers</li>
                <li>Données d'utilisation de l'application</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">2. Utilisation des données</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fournir et améliorer nos services</li>
                <li>Générer vos devis et factures</li>
                <li>Gérer vos clients et chantiers</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Vous envoyer des notifications importantes</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">3. Partage des données</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous ne partageons <strong>jamais</strong> vos données avec des tiers à des fins commerciales.
                Vos données peuvent être transmises uniquement :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>À nos prestataires techniques (hébergement sécurisé)</li>
                <li>Sur obligation légale (autorités compétentes)</li>
                <li>Avec votre consentement explicite</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">4. Sécurité</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Chiffrement des données en transit (HTTPS/SSL)</li>
                <li>Chiffrement des données au repos</li>
                <li>Authentification sécurisée</li>
                <li>Sauvegardes régulières</li>
                <li>Accès restreint aux données</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">5. Vos droits (RGPD)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : supprimer vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
                <li><strong>Droit d'opposition</strong> : refuser un traitement</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">6. Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies strictement nécessaires pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Améliorer les performances de l'application</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">7. Conservation des données</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos données tant que votre compte est actif. Après suppression de votre compte,
                vos données sont supprimées sous 30 jours, sauf obligation légale de conservation.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">8. Contact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question relative à vos données personnelles ou pour exercer vos droits,
                contactez-nous à : <strong>chantiers@gardeauarbres.fr</strong>
              </p>
            </section>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-center">
                🔒 <strong>Votre vie privée est notre priorité.</strong> Nous respectons le RGPD et protégeons vos données.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

