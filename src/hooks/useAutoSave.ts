import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseAutoSaveOptions {
  form: UseFormReturn<any>;
  key: string;
  interval?: number; // en millisecondes
  enabled?: boolean;
}

export const useAutoSave = ({ form, key, interval = 30000, enabled = true }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((value) => {
      const currentValue = JSON.stringify(value);
      
      // Ne sauvegarder que si les valeurs ont changé
      if (currentValue !== lastSavedRef.current) {
        // Annuler le timeout précédent
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Programmer une sauvegarde après le délai
        timeoutRef.current = setTimeout(() => {
          try {
            localStorage.setItem(`autosave_${key}`, currentValue);
            lastSavedRef.current = currentValue;
          } catch (error) {
            console.warn('Impossible de sauvegarder automatiquement:', error);
          }
        }, interval);
      }
    });

    // Charger les données sauvegardées au montage
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        form.reset(parsed);
        lastSavedRef.current = saved;
      }
    } catch (error) {
      console.warn('Impossible de charger la sauvegarde automatique:', error);
    }

    // Sauvegarder avant de quitter la page
    const handleBeforeUnload = () => {
      const currentValue = JSON.stringify(form.getValues());
      try {
        localStorage.setItem(`autosave_${key}`, currentValue);
      } catch (error) {
        console.warn('Impossible de sauvegarder avant de quitter:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form, key, interval, enabled]);

  const clearAutoSave = () => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      lastSavedRef.current = '';
    } catch (error) {
      console.warn('Impossible de supprimer la sauvegarde automatique:', error);
    }
  };

  return { clearAutoSave };
};

