import { usePhotos, usePhotoDelete, Photo } from '@/hooks/usePhotos';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PhotoUpload } from './PhotoUpload';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhotoGalleryProps {
  siteId: string;
}

const typeLabels: Record<Photo['type'], string> = {
  before: 'Avant',
  after: 'Après',
  progress: 'En cours',
  other: 'Autre',
};

const typeColors: Record<Photo['type'], string> = {
  before: 'bg-blue-500',
  after: 'bg-green-500',
  progress: 'bg-yellow-500',
  other: 'bg-gray-500',
};

export function PhotoGallery({ siteId }: PhotoGalleryProps) {
  const { data: photos, isLoading, refetch } = usePhotos(siteId);
  const deleteMutation = usePhotoDelete();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);

  // Debug: afficher les photos chargées
  if (import.meta.env.DEV) {
    console.log('[PhotoGallery] Photos chargées:', photos);
    console.log('[PhotoGallery] Site ID:', siteId);
    console.log('[PhotoGallery] Loading:', isLoading);
  }

  const handleDelete = async () => {
    if (!deletePhotoId) return;

    try {
      await deleteMutation.mutateAsync(deletePhotoId);
      toast.success('Photo supprimée');
      setDeletePhotoId(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const beforePhotos = photos?.filter((p) => p.type === 'before') || [];
  const afterPhotos = photos?.filter((p) => p.type === 'after') || [];
  const otherPhotos = photos?.filter((p) => p.type !== 'before' && p.type !== 'after') || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Photos</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photos du chantier</h3>
        <PhotoUpload siteId={siteId} onUploadSuccess={() => refetch()} />
      </div>

      {/* Comparaison Avant/Après */}
      {beforePhotos.length > 0 && afterPhotos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Comparaison Avant/Après</h4>
          <BeforeAfterSlider
            beforePhotos={beforePhotos}
            afterPhotos={afterPhotos}
          />
        </div>
      )}

      {/* Galerie par type */}
      {photos && photos.length > 0 ? (
        <div className="space-y-4">
          {/* Photos "Avant" */}
          {beforePhotos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${typeColors.before}`} />
                Avant ({beforePhotos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {beforePhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onView={() => setSelectedPhoto(photo)}
                    onDelete={() => setDeletePhotoId(photo.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Photos "Après" */}
          {afterPhotos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${typeColors.after}`} />
                Après ({afterPhotos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {afterPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onView={() => setSelectedPhoto(photo)}
                    onDelete={() => setDeletePhotoId(photo.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Autres photos */}
          {otherPhotos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Autres photos ({otherPhotos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onView={() => setSelectedPhoto(photo)}
                    onDelete={() => setDeletePhotoId(photo.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Aucune photo pour ce chantier</p>
          <PhotoUpload siteId={siteId} />
        </Card>
      )}

      {/* Dialog pour voir la photo en grand */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{typeLabels[selectedPhoto?.type || 'other']}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || 'Photo'}
                className="w-full rounded-lg"
              />
              {selectedPhoto.description && (
                <p className="text-sm text-muted-foreground">{selectedPhoto.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedPhoto.file_name && (
                    <span>Fichier: {selectedPhoto.file_name}</span>
                  )}
                </span>
                {selectedPhoto.file_size && (
                  <span>
                    {(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={(open) => !open && setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La photo sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  onView: () => void;
  onDelete: () => void;
}

function PhotoCard({ photo, onView, onDelete }: PhotoCardProps) {
  // Debug: afficher l'URL de la photo
  if (import.meta.env.DEV) {
    console.log('[PhotoCard] Photo URL:', photo.url);
  }

  return (
    <Card className="group relative overflow-hidden aspect-square">
      <img
        src={photo.url}
        alt={photo.description || 'Photo'}
        className="w-full h-full object-cover cursor-pointer"
        onClick={onView}
        onError={(e) => {
          console.error('[PhotoCard] Erreur de chargement de l\'image:', photo.url);
          console.error('[PhotoCard] Photo data:', photo);
          // Afficher une image de placeholder en cas d'erreur
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage non disponible%3C/text%3E%3C/svg%3E';
        }}
        onLoad={() => {
          if (import.meta.env.DEV) {
            console.log('[PhotoCard] Image chargée avec succès:', photo.url);
          }
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className={typeColors[photo.type]}>
          {typeLabels[photo.type]}
        </Badge>
      </div>
    </Card>
  );
}

