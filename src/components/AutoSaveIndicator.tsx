import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  className?: string;
}

export const AutoSaveIndicator = ({ isSaving = false, lastSaved = null, className }: AutoSaveIndicatorProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  if (!show && !lastSaved) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground transition-opacity",
        show ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <Save className="h-3 w-3" />
      <span>{isSaving ? 'Sauvegarde...' : lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
    </div>
  );
};

