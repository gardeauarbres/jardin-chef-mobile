import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme, ThemeColor } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const themeColors: { value: ThemeColor; label: string; color: string }[] = [
  { value: 'green', label: 'Vert', color: 'bg-green-500' },
  { value: 'blue', label: 'Bleu', color: 'bg-blue-500' },
  { value: 'purple', label: 'Violet', color: 'bg-purple-500' },
  { value: 'red', label: 'Rouge', color: 'bg-red-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'teal', label: 'Sarcelle', color: 'bg-teal-500' },
  { value: 'pink', label: 'Rose', color: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
];

export const ThemeColorPicker = () => {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="min-h-[44px] min-w-[44px]">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">Couleur du thème</h4>
          <div className="grid grid-cols-4 gap-2">
            {themeColors.map((colorOption) => (
              <button
                key={colorOption.value}
                onClick={() => setThemeColor(colorOption.value)}
                className={cn(
                  "h-10 w-10 rounded-md border-2 transition-all hover:scale-110",
                  colorOption.color,
                  themeColor === colorOption.value
                    ? "border-foreground ring-2 ring-ring ring-offset-2"
                    : "border-transparent"
                )}
                title={colorOption.label}
                aria-label={`Changer la couleur du thème en ${colorOption.label}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {themeColors.find(c => c.value === themeColor)?.label}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

