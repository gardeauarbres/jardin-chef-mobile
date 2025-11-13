import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini avec la clé API depuis les variables d'environnement
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY n\'est pas définie. Les fonctionnalités IA seront désactivées.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null;

/**
 * Génère une description détaillée pour un devis de paysagiste
 */
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erreur lors de l\'analyse business:', error);
    throw new Error('Impossible d\'analyser les données. Veuillez réessayer.');
  }
}

