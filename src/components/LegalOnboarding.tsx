import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Lock,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { useAcceptLegal } from '@/hooks/useLegalAcceptances';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface LegalOnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'privacy',
    title: 'Politique de confidentialité',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    tldr: 'Vos données sont sécurisées et ne sont jamais partagées avec des tiers.',
    key: 'privacy_policy' as const,
  },
  {
    id: 'legal',
    title: 'Mentions légales',
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    tldr: 'Informations sur l\'éditeur et l\'hébergement de l\'application.',
    key: 'legal_notice' as const,
  },
  {
    id: 'terms',
    title: 'Conditions d\'utilisation',
    icon: Lock,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    tldr: 'Règles d\'utilisation pour garantir une expérience optimale pour tous.',
    key: 'terms_of_service' as const,
  },
];

export default function LegalOnboarding({ onComplete }: LegalOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptances, setAcceptances] = useState({
    privacy_policy: false,
    legal_notice: false,
    terms_of_service: false,
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const acceptMutation = useAcceptLegal();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleAccept = (key: 'privacy_policy' | 'legal_notice' | 'terms_of_service') => {
    setAcceptances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!allAccepted) {
      toast.error('Veuillez accepter tous les documents pour continuer');
      return;
    }

    setIsCompleting(true);

    try {
      await acceptMutation.mutateAsync(acceptances);

      // 🎉 Confettis !
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      });

      toast.success('Félicitations ! Votre compte est prêt 🎉');

      // Petit délai pour l'effet confetti
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>

            <div>
              <CardTitle className="text-3xl font-bold">
                Bienvenue sur Jardin Chef ! 🌿
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Avant de commencer, prenons 2 minutes pour sécuriser votre compte
              </CardDescription>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Étape {currentStep + 1} sur {steps.length}</span>
                <Badge variant="secondary" className="font-mono">
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Step Header */}
                <div className={`flex items-center gap-4 p-4 rounded-lg ${currentStepData.bgColor}`}>
                  <div className={`p-3 bg-background rounded-full ${currentStepData.color}`}>
                    <currentStepData.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStepData.tldr}
                    </p>
                  </div>
                </div>

                {/* TL;DR Info */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm space-y-2">
                      <p className="font-medium">📋 En résumé :</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {currentStepData.tldr}
                      </p>
                    </div>
                  </div>

                  <Link 
                    to={`/legal/${currentStepData.id}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    target="_blank"
                  >
                    Lire le document complet
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Acceptance Checkbox */}
                <div className="flex items-start gap-3 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                  <Checkbox
                    id={currentStepData.key}
                    checked={acceptances[currentStepData.key]}
                    onCheckedChange={() => handleAccept(currentStepData.key)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={currentStepData.key}
                    className="text-sm font-medium leading-relaxed cursor-pointer flex-1"
                  >
                    J'ai lu et j'accepte {currentStepData.title.toLowerCase()}
                  </label>
                  {acceptances[currentStepData.key] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  Précédent
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!acceptances[currentStepData.key]}
                  className="flex-1"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!allAccepted || isCompleting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isCompleting ? (
                    'Finalisation...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Commencer !
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      acceptances[step.key]
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {acceptances[step.key] ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-muted" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          🔒 Vos données sont sécurisées et conformes au RGPD
        </p>
      </motion.div>
    </div>
  );
}

