import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LegalNotice() {
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
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mentions légales</h1>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Informations légales</CardTitle>
            <CardDescription>
              Informations légales relatives à l'éditeur et à l'hébergement de Jardin Chef.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">1. Éditeur de l'application</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Nom de l'application :</strong> Jardin Chef</p>
                <p><strong>Éditeur :</strong> Association Gard Eau Arbres</p>
                <p><strong>Forme juridique :</strong> Association loi 1901 à but non lucratif</p>
                <p><strong>Siège social :</strong> Le Bourg, 46120 Thémines, France</p>
                <p><strong>Président :</strong> Alain Ramon</p>
                <p><strong>Email :</strong> chantiers@gardeauarbres.fr</p>
                <p><strong>Téléphone :</strong> 07 45 29 39 80</p>
                <p><strong>Site web :</strong> <a href="https://www.gardeauarbres.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gardeauarbres.fr</a></p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">2. Directeur de la publication</h3>
              <p className="text-muted-foreground">
                Le directeur de la publication est : <strong>Alain Ramon</strong>, Président de l'association Gard Eau Arbres
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">3. Hébergement</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com</a></p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm mt-2">
                <p><strong>Base de données :</strong> Supabase Inc.</p>
                <p><strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapore 318992</p>
                <p><strong>Site web :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://supabase.com</a></p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">4. Propriété intellectuelle</h3>
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble du contenu de cette application (textes, images, vidéos, logos, icônes, etc.) 
                est la propriété exclusive de Jardin Chef, sauf mention contraire.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Toute reproduction, distribution, modification, adaptation, retransmission ou publication 
                de ces différents éléments est strictement interdite sans l'accord écrit de Jardin Chef.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">5. Responsabilité</h3>
              <p className="text-muted-foreground leading-relaxed">
                L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées 
                sur cette application. Toutefois, il ne peut garantir l'exactitude, la précision ou 
                l'exhaustivité des informations mises à disposition.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                L'éditeur décline toute responsabilité :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Pour toute imprécision, inexactitude ou omission portant sur des informations disponibles</li>
                <li>Pour tout dommage résultant d'une intrusion frauduleuse d'un tiers</li>
                <li>Pour tout dommage résultant d'une interruption ou d'un dysfonctionnement du service</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">6. Liens hypertextes</h3>
              <p className="text-muted-foreground leading-relaxed">
                L'application peut contenir des liens vers d'autres sites. L'éditeur n'exerce aucun contrôle 
                sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">7. Droit applicable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">8. Contact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant les mentions légales, vous pouvez nous contacter à : 
                <strong> chantiers@gardeauarbres.fr</strong>
              </p>
            </section>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-center">
                📄 Ces mentions légales sont conformes aux exigences légales françaises et européennes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

