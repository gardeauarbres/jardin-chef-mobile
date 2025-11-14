import { useState, useRef } from 'react';
import { usePhotoUpload } from '@/hooks/usePhotos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

interface PhotoUploadProps {
  siteId: string;
  onUploadSuccess?: () => void;
}

export function PhotoUpload({ siteId, onUploadSuccess }: PhotoUploadProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'before' | 'after' | 'progress' | 'other'>('before');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = usePhotoUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 10MB avant compression)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 10MB)');
      return;
    }

    setFile(selectedFile);

    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner une photo');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        siteId,
        file,
        type,
        description: description.trim() || undefined,
      });

      toast.success('Photo uploadée avec succès');
      setFile(null);
      setPreview(null);
      setDescription('');
      setType('before');
      setOpen(false);
      
      // Attendre un peu avant de rafraîchir pour laisser le temps à la DB de se mettre à jour
      setTimeout(() => {
        onUploadSuccess?.();
      }, 500);
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload de la photo');
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setDescription('');
    setType('before');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Ajouter une photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une photo</DialogTitle>
          <DialogDescription>
            Téléchargez une photo pour ce chantier
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          {preview && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="photo-file">Photo</Label>
            <Input
              id="photo-file"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, WebP (max 10MB)
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="photo-type">Type de photo</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="photo-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Avant</SelectItem>
                <SelectItem value="after">Après</SelectItem>
                <SelectItem value="progress">En cours</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="photo-description">Description (optionnel)</Label>
            <Textarea
              id="photo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={uploadMutation.isPending}>
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

