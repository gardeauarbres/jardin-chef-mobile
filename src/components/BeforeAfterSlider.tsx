import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Photo } from '@/hooks/usePhotos';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforePhotos: Photo[];
  afterPhotos: Photo[];
}

export function BeforeAfterSlider({ beforePhotos, afterPhotos }: BeforeAfterSliderProps) {
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  const currentBefore = beforePhotos[beforeIndex];
  const currentAfter = afterPhotos[afterIndex];

  const nextBefore = () => {
    setBeforeIndex((prev) => (prev + 1) % beforePhotos.length);
  };

  const prevBefore = () => {
    setBeforeIndex((prev) => (prev - 1 + beforePhotos.length) % beforePhotos.length);
  };

  const nextAfter = () => {
    setAfterIndex((prev) => (prev + 1) % afterPhotos.length);
  };

  const prevAfter = () => {
    setAfterIndex((prev) => (prev - 1 + afterPhotos.length) % afterPhotos.length);
  };

  if (!currentBefore || !currentAfter) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
        {/* Image "Avant" */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={currentBefore.url}
            alt="Avant"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Image "Après" */}
        <div className="absolute inset-0">
          <img
            src={currentAfter.url}
            alt="Après"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          Avant
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          Après
        </div>
      </div>

      {/* Contrôles */}
      <div className="space-y-4">
        {/* Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avant</span>
            <span>Après</span>
          </div>
          <Slider
            value={[sliderPosition]}
            onValueChange={([value]) => setSliderPosition(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Navigation des photos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Navigation "Avant" */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Photo Avant</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevBefore}
                disabled={beforePhotos.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center text-sm">
                {beforeIndex + 1} / {beforePhotos.length}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextBefore}
                disabled={beforePhotos.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation "Après" */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Photo Après</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevAfter}
                disabled={afterPhotos.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center text-sm">
                {afterIndex + 1} / {afterPhotos.length}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextAfter}
                disabled={afterPhotos.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

