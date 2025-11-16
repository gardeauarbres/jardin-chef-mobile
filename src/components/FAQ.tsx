import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Package, 
  Building2, 
  FileDown, 
  Camera, 
  Users, 
  MapPin, 
  Bot,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: any;
  tags: string[];
}

const faqData: FAQItem[] = [
  // TEMPLATES D'EMAILS
  {
    id: 'template-1',
    question: "C'est quoi un template d'email ?",
    answer: "Un template est un modèle d'email pré-rempli et réutilisable. Au lieu d'écrire le même email à chaque fois, vous créez un template avec des variables comme {nom_client} ou {montant} qui sont automatiquement remplacées par les vraies valeurs. Exemple : 'Bonjour {nom_client}, voici votre devis n°{numero_devis} de {montant}€'.",
    category: 'Templates',
    icon: Mail,
    tags: ['email', 'template', 'automatisation']
  },
  {
    id: 'template-2',
    question: "Comment créer un template d'email ?",
    answer: "1. Allez dans Menu Plus → Templates d'emails\n2. Cliquez sur 'Nouveau template'\n3. Remplissez : Nom, Catégorie (Devis/Facture/Rappel), Sujet, Message\n4. Utilisez les variables disponibles : {nom_client}, {montant}, {numero_devis}, etc.\n5. Cliquez sur 'Créer'\n\nVous pouvez prévisualiser le template en temps réel dans le panneau de droite.",
    category: 'Templates',
    icon: Mail,
    tags: ['créer', 'template', 'guide']
  },
  {
    id: 'template-3',
    question: "Quelles variables puis-je utiliser dans les templates ?",
    answer: "Variables communes : {nom_client}, {prenom_client}, {nom_entreprise}, {email_entreprise}, {telephone_entreprise}\n\nDevis : {numero_devis}, {montant}, {date_devis}, {description}\n\nFactures : {numero_facture}, {montant}, {date_facture}, {date_echeance}\n\nRappels : {numero_facture}, {montant}, {jours_retard}, {date_echeance}\n\nToutes les variables sont automatiquement remplacées lors de l'utilisation du template.",
    category: 'Templates',
    icon: Mail,
    tags: ['variables', 'template', 'personnalisation']
  },
  {
    id: 'template-4',
    question: "Comment utiliser un template ?",
    answer: "Méthode 1 (Rappels automatiques) :\n- Menu Plus → Rappels de paiement\n- Sélectionnez les factures\n- 'Envoyer des rappels' → Choisissez un template\n- Le message se remplit automatiquement\n\nMéthode 2 (Manuel) :\n- Templates d'emails → Cliquez sur le template\n- Copiez le contenu\n- Collez dans votre logiciel d'email\n- Les variables sont remplacées automatiquement",
    category: 'Templates',
    icon: Mail,
    tags: ['utilisation', 'template', 'rappel']
  },

  // GESTION DES STOCKS
  {
    id: 'stock-1',
    question: "Comment fonctionne la gestion des stocks ?",
    answer: "La gestion des stocks vous permet de suivre vos matériaux (terre, plants, outils, etc.). Chaque matériau a : un nom, une quantité actuelle, un stock minimum (pour les alertes), un prix unitaire, et une unité de mesure (m³, kg, unité, etc.). Le stock se met à jour automatiquement quand vous assignez des matériaux à un chantier.",
    category: 'Stocks',
    icon: Package,
    tags: ['stock', 'inventaire', 'matériaux']
  },
  {
    id: 'stock-2',
    question: "Comment ajouter un matériau ?",
    answer: "1. Menu Plus → Gestion des stocks\n2. Cliquez sur 'Nouveau matériau'\n3. Remplissez : Nom, Description, Catégorie, Unité (m³, kg, unité...)\n4. Définissez : Quantité actuelle, Stock minimum (alerte), Prix unitaire\n5. (Optionnel) Fournisseur, Emplacement\n6. Cliquez sur 'Créer'\n\nVous verrez le matériau apparaître dans la liste avec un badge de couleur selon le stock.",
    category: 'Stocks',
    icon: Package,
    tags: ['ajouter', 'matériau', 'stock']
  },
  {
    id: 'stock-3',
    question: "Le stock se déduit-il automatiquement sur les chantiers ?",
    answer: "OUI ! Quand vous assignez des matériaux à un chantier :\n1. Allez dans Chantiers → Modifier un chantier\n2. Section 'Matériaux utilisés' → 'Ajouter un matériau'\n3. Choisissez le matériau et la quantité\n4. Le stock est automatiquement déduit !\n\nSi vous supprimez l'assignation, le stock est restauré. L'historique des mouvements est enregistré dans 'Historique'.",
    category: 'Stocks',
    icon: Package,
    tags: ['automatique', 'chantier', 'déduction']
  },
  {
    id: 'stock-4',
    question: "Comment voir l'historique des mouvements de stock ?",
    answer: "Dans Gestion des stocks :\n1. Cliquez sur un matériau\n2. Bouton 'Historique' (icône horloge)\n3. Vous verrez tous les mouvements : Entrées (in), Sorties (out), Ajustements\n4. Pour chaque mouvement : Date, Type, Quantité, Raison, Chantier associé (si applicable)\n\nVous pouvez aussi ajouter manuellement des mouvements avec le bouton 'Mouvement'.",
    category: 'Stocks',
    icon: Package,
    tags: ['historique', 'mouvements', 'suivi']
  },

  // PROFIL D'ENTREPRISE
  {
    id: 'profile-1',
    question: "Pourquoi remplir le profil d'entreprise ?",
    answer: "⚠️ TRÈS IMPORTANT ! Le profil d'entreprise contient vos informations légales (nom, SIRET, TVA, adresse, contact). Ces infos apparaissent automatiquement sur TOUS vos documents PDF : factures, devis, fiches de paie.\n\nSans profil rempli, vos PDF seront incomplets et non conformes légalement.\n\nÀ remplir en PRIORITÉ avant toute utilisation !",
    category: 'Profil',
    icon: Building2,
    tags: ['profil', 'entreprise', 'priorité', 'pdf']
  },
  {
    id: 'profile-2',
    question: "Quelles informations dois-je renseigner ?",
    answer: "Informations obligatoires :\n- Nom de l'entreprise\n- SIRET (ou cochez 'Auto-entrepreneur')\n- Adresse complète (rue, code postal, ville)\n- Email professionnel\n- Téléphone\n- Prénom et nom du gérant\n\nInformations optionnelles :\n- Numéro de TVA\n- Site web\n- Complément d'adresse\n\nToutes ces infos apparaîtront sur vos PDF.",
    category: 'Profil',
    icon: Building2,
    tags: ['informations', 'siret', 'tva']
  },
  {
    id: 'profile-3',
    question: "Puis-je modifier mon profil après l'avoir créé ?",
    answer: "OUI, à tout moment ! Menu Plus → Profil d'entreprise → Modifiez les champs → Sauvegardez.\n\nLes modifications sont appliquées immédiatement. Les nouveaux PDF générés après la modification contiendront les nouvelles informations.\n\nLes anciens PDF déjà téléchargés ne seront pas modifiés (c'est normal).",
    category: 'Profil',
    icon: Building2,
    tags: ['modifier', 'profil', 'mise à jour']
  },

  // EXPORT / IMPORT
  {
    id: 'export-1',
    question: "Comment exporter mes données en Excel ?",
    answer: "Sur chaque page (Clients, Devis, Factures, etc.) :\n1. Menu ⋮ (trois points en haut à droite)\n2. 'Exporter' → Choisissez Excel (.xlsx) ou CSV\n3. Le fichier se télécharge automatiquement\n\nVous pouvez aussi sélectionner plusieurs éléments (mode sélection) et exporter uniquement la sélection.\n\nUtile pour : backups, comptabilité, analyses externes.",
    category: 'Export/Import',
    icon: FileDown,
    tags: ['export', 'excel', 'csv', 'backup']
  },
  {
    id: 'export-2',
    question: "Comment importer des données depuis Excel ?",
    answer: "1. Menu ⋮ → 'Importer'\n2. Choisissez votre fichier Excel/CSV\n3. L'app détecte automatiquement les colonnes\n4. Vérifiez le mapping des colonnes (Nom → first_name, etc.)\n5. Validez les données (format email, téléphone...)\n6. Cliquez sur 'Importer'\n\nLes données sont ajoutées à votre base. Les doublons (même email) sont ignorés.",
    category: 'Export/Import',
    icon: FileDown,
    tags: ['import', 'excel', 'csv', 'données']
  },

  // PDF & DOCUMENTS
  {
    id: 'pdf-1',
    question: "Comment générer une facture en PDF ?",
    answer: "Méthode 1 (Dashboard) :\n- Section 'Documents à envoyer'\n- Cliquez sur le bouton de téléchargement à côté de la facture\n\nMéthode 2 (Page Factures) :\n- Allez dans Factures\n- Cliquez sur une facture\n- Bouton 'Télécharger PDF'\n\nLe PDF inclut automatiquement vos infos d'entreprise du profil !",
    category: 'PDF',
    icon: FileDown,
    tags: ['pdf', 'facture', 'télécharger']
  },
  {
    id: 'pdf-2',
    question: "Les PDF incluent-ils mes informations d'entreprise ?",
    answer: "OUI ! Si vous avez rempli votre profil d'entreprise, tous les PDF (factures, devis, fiches de paie) incluent automatiquement :\n- Nom de l'entreprise\n- SIRET / TVA\n- Adresse complète\n- Email et téléphone\n- Nom du gérant\n\n⚠️ Si le profil n'est pas rempli, le PDF sera incomplet. Remplissez-le d'abord !",
    category: 'PDF',
    icon: FileDown,
    tags: ['pdf', 'profil', 'entreprise']
  },

  // CHANTIERS & PHOTOS
  {
    id: 'site-1',
    question: "Comment ajouter des photos à un chantier ?",
    answer: "1. Allez dans Chantiers → Modifier un chantier existant\n2. Section 'Galerie photos'\n3. Cliquez sur 'Ajouter des photos'\n4. Sélectionnez une ou plusieurs photos\n5. Ajoutez une légende (optionnel)\n6. Les photos sont uploadées automatiquement\n\nVous pouvez supprimer des photos en cliquant sur la poubelle. Les photos sont stockées sur Supabase Storage.",
    category: 'Chantiers',
    icon: Camera,
    tags: ['photos', 'chantier', 'galerie']
  },
  {
    id: 'site-2',
    question: "Comment suivre la progression d'un chantier ?",
    answer: "Dans la fiche du chantier, vous avez :\n- Statut : Actif / Terminé / En pause\n- Progression : 0 à 100% (curseur)\n- Montant total et Montant payé\n- Date de début et fin\n- Matériaux utilisés\n- Photos\n\nMettez à jour régulièrement pour suivre l'avancement. Le Dashboard affiche les chantiers actifs avec leur progression.",
    category: 'Chantiers',
    icon: Camera,
    tags: ['progression', 'chantier', 'suivi']
  },

  // EMPLOYÉS
  {
    id: 'employee-1',
    question: "Comment générer une fiche de paie PDF ?",
    answer: "1. Dashboard → Section 'Documents à envoyer'\n2. Liste des employés avec heures à payer\n3. Cliquez sur le bouton de téléchargement PDF\n\nOu :\n1. Menu Plus → Employés\n2. Cliquez sur un employé\n3. Section 'Historique des heures'\n4. Bouton 'Télécharger PDF'\n\nLe PDF inclut : nom, période, heures, taux horaire, montant total, et vos infos d'entreprise.",
    category: 'Employés',
    icon: Users,
    tags: ['fiche de paie', 'pdf', 'employé']
  },
  {
    id: 'employee-2',
    question: "Comment saisir les heures d'un employé ?",
    answer: "1. Menu Plus → Employés\n2. Bouton 'Saisir heures' (en haut)\n3. Sélectionnez l'employé\n4. Date du travail\n5. Nombre d'heures\n6. (Optionnel) Description\n7. Enregistrez\n\nLe calcul (heures × taux horaire) se fait automatiquement. L'employé apparaît dans 'Documents à envoyer' avec le montant dû.",
    category: 'Employés',
    icon: Users,
    tags: ['heures', 'employé', 'saisie']
  },

  // NAVIGATION GPS
  {
    id: 'gps-1',
    question: "Comment utiliser la navigation GPS ?",
    answer: "Sur les fiches Clients et Chantiers, cliquez sur le bouton 📍 à côté de l'adresse.\n\nUn menu s'ouvre avec :\n- Google Maps (Web/App)\n- Waze (App)\n- Apple Maps (iOS/Mac)\n- Copier l'adresse\n\nChoisissez votre app préférée, elle s'ouvre automatiquement avec l'itinéraire calculé vers l'adresse du client/chantier.",
    category: 'Navigation',
    icon: MapPin,
    tags: ['gps', 'navigation', 'itinéraire']
  },

  // ASSISTANT IA
  {
    id: 'ai-1',
    question: "Qu'est-ce que l'Assistant IA ?",
    answer: "L'Assistant IA (Gemini) est disponible sur chaque page avec l'icône ✨ Sparkles.\n\nIl peut vous aider à :\n- Rédiger des descriptions professionnelles (devis, chantiers)\n- Suggérer des améliorations de texte\n- Répondre à vos questions sur l'utilisation de l'app\n- Générer du contenu personnalisé\n\nCliquez sur l'icône, posez votre question, et l'IA vous répond en quelques secondes !",
    category: 'IA',
    icon: Bot,
    tags: ['ia', 'assistant', 'gemini', 'aide']
  },
  {
    id: 'ai-2',
    question: "Comment obtenir de l'aide personnalisée ?",
    answer: "🤖 Assistant IA disponible partout !\n\nSi vous avez une question spécifique non couverte par cette FAQ :\n\n1. Cliquez sur l'icône ✨ (Sparkles) en haut de n'importe quelle page\n2. Décrivez votre problème ou question en détail\n3. L'Assistant IA vous donnera une réponse personnalisée\n\nExemples de questions :\n- 'Comment créer un devis pour un aménagement de jardin ?'\n- 'Aide-moi à rédiger une description professionnelle'\n- 'Comment gérer plusieurs employés sur un chantier ?'\n\nL'IA comprend le contexte de votre page actuelle !",
    category: 'IA',
    icon: Sparkles,
    tags: ['aide', 'ia', 'assistant', 'personnalisé']
  },
];

const categories = [
  'Tous',
  'Templates',
  'Stocks',
  'Profil',
  'Export/Import',
  'PDF',
  'Chantiers',
  'Employés',
  'Navigation',
  'IA'
];

export const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQ.map(item => item.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">FAQ - Aide & Questions</h1>
        </div>
        <p className="text-muted-foreground">
          Trouvez rapidement des réponses à vos questions les plus fréquentes
        </p>
      </div>

      {/* Alerte Assistant IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              🤖 Besoin d'aide personnalisée ?
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Cliquez sur l'icône <strong>✨ Sparkles</strong> en haut de n'importe quelle page pour poser une question spécifique à l'Assistant IA. 
              Il vous donnera une réponse détaillée et personnalisée selon votre contexte !
            </p>
          </div>
        </div>
      </Card>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans la FAQ (ex: template, stock, pdf...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Boutons Tout développer/réduire */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={expandAll}
          className="text-sm text-primary hover:underline"
        >
          Tout développer
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={collapseAll}
          className="text-sm text-primary hover:underline"
        >
          Tout réduire
        </button>
      </div>

      {/* Résultats */}
      {filteredFAQ.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucune question trouvée pour "{searchTerm}".
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Essayez avec d'autres mots-clés ou utilisez l'Assistant IA ✨
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFAQ.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.has(item.id);

            return (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {item.answer}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <Card className="bg-muted/50 p-6 text-center">
        <h3 className="font-semibold mb-2">Une question non répertoriée ?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Utilisez l'Assistant IA ✨ pour obtenir une réponse personnalisée,
          ou consultez la documentation complète dans les fichiers du projet.
        </p>
        <div className="flex justify-center gap-2 text-xs text-muted-foreground">
          <span>📚 README.md</span>
          <span>•</span>
          <span>🏗️ ARCHITECTURE.md</span>
          <span>•</span>
          <span>🚀 DEPLOYMENT.md</span>
        </div>
      </Card>
    </div>
  );
};

