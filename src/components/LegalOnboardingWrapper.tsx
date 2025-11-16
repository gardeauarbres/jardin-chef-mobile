import { useState, useEffect } from 'react';
import { useLegalAcceptances, hasAcceptedAllLegal } from '@/hooks/useLegalAcceptances';
import { useAuth } from '@/hooks/useAuth';
import LegalOnboarding from './LegalOnboarding';

interface LegalOnboardingWrapperProps {
  children: React.ReactNode;
}

export default function LegalOnboardingWrapper({ children }: LegalOnboardingWrapperProps) {
  const { user } = useAuth();
  const { data: acceptances, isLoading } = useLegalAcceptances();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Si l'utilisateur est connecté et que les données sont chargées
    if (user && !isLoading) {
      // Vérifier si tous les documents sont acceptés
      const allAccepted = hasAcceptedAllLegal(acceptances);
      
      // Afficher l'onboarding si pas tous acceptés
      setShowOnboarding(!allAccepted);
    }
  }, [user, acceptances, isLoading]);

  // Ne rien afficher pendant le chargement
  if (isLoading) {
    return null;
  }

  // Si l'onboarding doit être affiché
  if (showOnboarding && user) {
    return (
      <LegalOnboarding 
        onComplete={() => {
          setShowOnboarding(false);
        }} 
      />
    );
  }

  // Sinon, afficher le contenu normal
  return <>{children}</>;
}

