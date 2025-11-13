import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini avec la clé API depuis les variables d'environnement
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Debug: afficher l'état de la clé API (uniquement en développement)
if (import.meta.env.DEV) {
  console.log('[Gemini Debug] VITE_GEMINI_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NON DÉFINIE');
  console.log('[Gemini Debug] Toutes les variables VITE_*:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

if (!apiKey) {
  console.warn('⚠️ VITE_GEMINI_API_KEY n\'est pas définie. Les fonctionnalités IA seront désactivées.');
  console.warn('💡 Vérifiez que:');
  console.warn('   1. Le fichier .env contient VITE_GEMINI_API_KEY=votre-clé');
  console.warn('   2. Le serveur de développement a été redémarré après l\'ajout de la variable');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Liste des modèles à essayer dans l'ordre de préférence
// gemini-2.0-flash est le modèle le plus récent et performant
const MODEL_NAMES = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Fonction helper pour obtenir un modèle fonctionnel
function getAvailableModel() {
  if (!genAI) return null;
  
  // Essayer le premier modèle par défaut
  try {
    return genAI.getGenerativeModel({ model: MODEL_NAMES[0] });
  } catch (error) {
    console.warn(`[Gemini] Modèle ${MODEL_NAMES[0]} non disponible, utilisation du fallback`);
  }
  
  // Si le premier échoue, essayer les autres
  for (let i = 1; i < MODEL_NAMES.length; i++) {
    try {
      return genAI.getGenerativeModel({ model: MODEL_NAMES[i] });
    } catch (error) {
      // Continuer à essayer
    }
  }
  
  // Si aucun modèle ne fonctionne, retourner le premier quand même
  // L'erreur sera gérée lors de l'utilisation
  return genAI.getGenerativeModel({ model: MODEL_NAMES[0] });
}

const model = getAvailableModel();

/**
 * Génère une description détaillée pour un devis de paysagiste
 */
// Fonction helper pour attendre un délai (pour éviter les erreurs 429)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction helper pour essayer plusieurs modèles en cas d'échec avec retry et backoff
async function tryWithMultipleModels(prompt: string, retries: number = 3): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  let lastError: any = null;
  
  for (const modelName of MODEL_NAMES) {
    // Essayer avec retry pour ce modèle
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Ajouter un petit délai entre les tentatives pour éviter les erreurs 429
        if (attempt > 0) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 secondes
          console.log(`[Gemini] Retry ${attempt}/${retries} après ${backoffDelay}ms...`);
          await delay(backoffDelay);
        }
        
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        const result = await currentModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || '';
        
        // Si c'est une erreur 404 (modèle non trouvé), essayer le modèle suivant
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.warn(`[Gemini] Modèle ${modelName} non disponible, essai du suivant...`);
          break; // Sortir de la boucle de retry pour ce modèle
        }
        
        // Si c'est une erreur 429 (quota dépassé), attendre et réessayer
        if (errorMessage.includes('429') || errorMessage.includes('Resource exhausted')) {
          if (attempt < retries - 1) {
            const backoffDelay = Math.min(2000 * Math.pow(2, attempt), 30000); // Max 30 secondes pour 429
            console.warn(`[Gemini] Quota dépassé (429), attente de ${backoffDelay}ms avant retry...`);
            await delay(backoffDelay);
            continue; // Réessayer avec ce modèle
          } else {
            // Si toutes les tentatives ont échoué avec 429, essayer le modèle suivant
            console.warn(`[Gemini] Modèle ${modelName} toujours en erreur 429, essai du suivant...`);
            break;
          }
        }
        
        // Pour les autres erreurs, relancer immédiatement
        throw error;
      }
    }
  }
  
  // Si tous les modèles ont échoué
  if (lastError?.message?.includes('429')) {
    throw new Error('Quota API Gemini dépassé. Veuillez attendre quelques minutes avant de réessayer.');
  }
  throw new Error(`Aucun modèle Gemini disponible. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
}

export async function generateQuoteDescription(title: string): Promise<string> {
  if (!model) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  try {
    const prompt = `Tu es un expert en paysagisme français. Génère une description professionnelle et détaillée pour un devis de travaux paysagers.

Titre du projet: ${title}

Génère une description de 3-5 phrases qui inclut:
- Les travaux à effectuer de manière précise
- Les matériaux et techniques utilisés
- Les avantages et résultats attendus
- Un ton professionnel et rassurant

Réponds UNIQUEMENT avec la description, sans introduction ni conclusion.`;

    return await tryWithMultipleModels(prompt);
  } catch (error) {
    console.error('Erreur lors de la génération de description:', error);
    throw new Error('Impossible de générer la description. Veuillez réessayer.');
  }
}

/**
 * Suggère un prix pour un devis de paysagiste
 */
export async function suggestQuotePrice(title: string, description?: string): Promise<{
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;
  reasoning: string;
}> {
  if (!model) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  try {
    const prompt = `Tu es un expert en estimation de prix pour travaux paysagers en France.

Titre du projet: ${title}
${description ? `Description: ${description}` : ''}

Estime un prix pour ces travaux en euros. Considère:
- La complexité des travaux
- Les matériaux nécessaires
- La main d'œuvre
- Les prix moyens du marché français

Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans code block):
{
  "minPrice": nombre minimum en euros,
  "maxPrice": nombre maximum en euros,
  "suggestedPrice": prix suggéré en euros,
  "reasoning": "explication courte en français (2-3 phrases)"
}`;

    const text = await tryWithMultipleModels(prompt);
    
    // Nettoyer le texte pour extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      minPrice: Math.round(parsed.minPrice),
      maxPrice: Math.round(parsed.maxPrice),
      suggestedPrice: Math.round(parsed.suggestedPrice),
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error('Erreur lors de la suggestion de prix:', error);
    throw new Error('Impossible de suggérer un prix. Veuillez réessayer.');
  }
}

/**
 * Génère un pourcentage d'acompte suggéré
 */
export async function suggestDepositPercentage(amount: number): Promise<number> {
  if (!model) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  try {
    const prompt = `Pour un devis de travaux paysagers de ${amount}€, quel pourcentage d'acompte serait approprié ?

Considère les pratiques courantes en France pour les travaux paysagers.

Réponds UNIQUEMENT avec un nombre entre 0 et 100 (sans unité, sans explication).`;

    const text = await tryWithMultipleModels(prompt);
    
    // Extraire le nombre
    const match = text.match(/\d+/);
    if (!match) {
      // Valeur par défaut si pas de réponse valide
      return amount > 5000 ? 30 : 20;
    }
    
    const percentage = parseInt(match[0], 10);
    return Math.min(Math.max(percentage, 0), 100);
  } catch (error) {
    console.error('Erreur lors de la suggestion d\'acompte:', error);
    // Valeur par défaut en cas d'erreur
    return amount > 5000 ? 30 : 20;
  }
}

/**
 * Assistant conversationnel pour l'aide
 */
export async function askAssistant(question: string, context?: {
  currentPage?: string;
  userData?: any;
}): Promise<string> {
  if (!model) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  try {
    const contextInfo = context?.currentPage 
      ? `L'utilisateur est actuellement sur la page: ${context.currentPage}.`
      : '';

    const prompt = `Tu es un assistant virtuel pour une application de gestion pour paysagistes appelée "Jardin Chef Mobile".

${contextInfo}

Question de l'utilisateur: ${question}

Réponds de manière concise, utile et professionnelle en français. Si la question concerne l'utilisation de l'application, donne des instructions claires. Si c'est une question générale sur le paysagisme, réponds en tant qu'expert.

Réponds UNIQUEMENT avec la réponse, sans introduction ni conclusion.`;

    return await tryWithMultipleModels(prompt);
  } catch (error) {
    console.error('Erreur lors de la question à l\'assistant:', error);
    throw new Error('Impossible d\'obtenir une réponse. Veuillez réessayer.');
  }
}

/**
 * Analyse les données pour donner des insights business
 */
export async function analyzeBusinessData(data: {
  totalClients: number;
  totalQuotes: number;
  acceptedQuotes: number;
  totalRevenue: number;
  monthlyRevenue: number;
}): Promise<string> {
  if (!model) {
    throw new Error('Gemini API n\'est pas configurée. Vérifiez VITE_GEMINI_API_KEY.');
  }

  try {
    const prompt = `Analyse ces données business d'un paysagiste et donne des insights utiles:

- Total clients: ${data.totalClients}
- Total devis: ${data.totalQuotes}
- Devis acceptés: ${data.acceptedQuotes}
- Revenus totaux: ${data.totalRevenue}€
- Revenus ce mois: ${data.monthlyRevenue}€

Calcule le taux de conversion et donne 3-4 recommandations concrètes pour améliorer le business.

Réponds UNIQUEMENT avec l'analyse et les recommandations en français, de manière concise et actionnable.`;

    return await tryWithMultipleModels(prompt);
  } catch (error) {
    console.error('Erreur lors de l\'analyse business:', error);
    throw new Error('Impossible d\'analyser les données. Veuillez réessayer.');
  }
}

