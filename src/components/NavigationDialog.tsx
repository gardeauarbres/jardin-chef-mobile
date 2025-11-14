import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface NavigationDialogProps {
  address: string;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

export const NavigationDialog = ({
  address,
  title = 'Itinéraire',
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
}: NavigationDialogProps) => {
  const [open, setOpen] = useState(false);

  // Encoder l'adresse pour les URLs
  const encodedAddress = encodeURIComponent(address);

  // Générer les URLs pour chaque service
  const navigationLinks = {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    waze: `https://waze.com/ul?q=${encodedAddress}&navigate=yes`,
    appleMaps: `https://maps.apple.com/?address=${encodedAddress}`,
  };

  const handleCopyAddress = async () => {
    try {
      // Vérifier si le Clipboard API est disponible
      if (!navigator.clipboard) {
        // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Adresse copiée dans le presse-papiers');
          setOpen(false);
        } catch (err) {
          document.body.removeChild(textArea);
          toast.error('Impossible de copier l\'adresse. Veuillez la copier manuellement.');
        }
        return;
      }

      await navigator.clipboard.writeText(address);
      toast.success('Adresse copiée dans le presse-papiers');
      setOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la copie de l\'adresse');
    }
  };

  const handleOpenNavigation = (url: string, service: string) => {
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Le popup a été bloqué
        toast.error('Popup bloqué. Veuillez autoriser les popups pour ce site.');
      } else {
        toast.success(`Ouverture de ${service}...`);
        setOpen(false);
      }
    } catch (error) {
      toast.error(`Erreur lors de l'ouverture de ${service}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {showIcon && <MapPin className="h-4 w-4 mr-2" />}
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Choisir une application de navigation
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre application préférée pour l'itinéraire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Adresse */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Destination</p>
            <p className="text-sm">{address}</p>
          </div>

          {/* Options de navigation */}
          <div className="space-y-2">
            {/* Google Maps */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleOpenNavigation(navigationLinks.googleMaps, 'Google Maps')}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill="#4285F4"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Google Maps</p>
                  <p className="text-xs text-muted-foreground">Navigation GPS complète</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>

            {/* Waze */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleOpenNavigation(navigationLinks.waze, 'Waze')}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="10" r="8" fill="#00D8FF" />
                    <circle cx="9" cy="9" r="1.5" fill="white" />
                    <circle cx="15" cy="9" r="1.5" fill="white" />
                    <path d="M8 13c0 0 1 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Waze</p>
                  <p className="text-xs text-muted-foreground">Trafic en temps réel</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>

            {/* Apple Maps */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleOpenNavigation(navigationLinks.appleMaps, 'Apple Maps')}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      fill="#000000"
                      className="dark:fill-white"
                    />
                    <circle cx="12" cy="9" r="2.5" fill="white" className="dark:fill-black" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Apple Maps</p>
                  <p className="text-xs text-muted-foreground">Pour appareils Apple</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>

            {/* Copier l'adresse */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 border-dashed"
              onClick={handleCopyAddress}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Copy className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Copier l'adresse</p>
                  <p className="text-xs text-muted-foreground">Pour usage manuel</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

