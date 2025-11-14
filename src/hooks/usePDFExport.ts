import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook pour gérer l'état de chargement des exports PDF
 * Affiche un toast de chargement et gère les erreurs automatiquement
 */
export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportWithLoading = async <T extends any[]>(
    exportFunction: (...args: T) => void | Promise<void>,
    ...args: T
  ): Promise<void> => {
    setIsExporting(true);
    
    // Toast de chargement
    const loadingToast = toast.loading('Génération du PDF en cours...');

    try {
      await exportFunction(...args);
      toast.dismiss(loadingToast);
      toast.success('PDF généré avec succès');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error exporting PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportWithLoading,
  };
};

