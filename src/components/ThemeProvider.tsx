import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export type ThemeColor = "green" | "blue" | "purple" | "red" | "orange" | "teal" | "pink" | "indigo";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  themeColor: "green",
  setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "jardin-chef-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window === 'undefined') return "green";
    try {
      return (localStorage.getItem(`${storageKey}-color`) as ThemeColor) || "green";
    } catch {
      return "green";
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Appliquer les couleurs du thème selon la couleur choisie
    const colorMap: Record<ThemeColor, { hue: number; darkHue: number }> = {
      green: { hue: 142, darkHue: 142 },
      blue: { hue: 217, darkHue: 217 },
      purple: { hue: 262, darkHue: 262 },
      red: { hue: 0, darkHue: 0 },
      orange: { hue: 25, darkHue: 25 },
      teal: { hue: 180, darkHue: 180 },
      pink: { hue: 330, darkHue: 330 },
      indigo: { hue: 239, darkHue: 239 },
    };

    const colors = colorMap[themeColor];
    
    // Appliquer les variables CSS pour la couleur primaire
    root.style.setProperty('--primary-hue', colors.hue.toString());
    root.style.setProperty('--primary-dark-hue', colors.darkHue.toString());
    
    // Mettre à jour les couleurs primaires
    if (root.classList.contains('dark')) {
      root.style.setProperty('--primary', `${colors.darkHue} 55% 50%`);
      root.style.setProperty('--primary-glow', `${colors.darkHue} 65% 60%`);
      root.style.setProperty('--ring', `${colors.darkHue} 55% 50%`);
      root.style.setProperty('--success', `${colors.darkHue} 55% 50%`);
    } else {
      root.style.setProperty('--primary', `${colors.hue} 60% 45%`);
      root.style.setProperty('--primary-glow', `${colors.hue} 70% 55%`);
      root.style.setProperty('--ring', `${colors.hue} 60% 45%`);
      root.style.setProperty('--success', `${colors.hue} 60% 45%`);
    }
  }, [themeColor, theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, theme);
        }
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
      setTheme(theme);
    },
    themeColor,
    setThemeColor: (color: ThemeColor) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storageKey}-color`, color);
        }
      } catch (error) {
        console.error('Error saving theme color to localStorage:', error);
      }
      setThemeColorState(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

