// CACHE BUSTER v2.0
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = {
  variant: "professional" | "tint" | "vibrant";
  primary: string;
  appearance: "light" | "dark" | "system";
  radius: number;
};

type RegionalTheme = {
  name: string;
  theme: Theme;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleAppearance: () => void;
  regionalThemes: RegionalTheme[];
  setRegionalTheme: (regionName: string) => void;
};

const defaultTheme: Theme = {
  variant: "professional",
  primary: "rgb(15, 23, 42)", // Clean dark slate
  appearance: "light",
  radius: 0.5
};

const regionalThemes: RegionalTheme[] = [
  // All regions use the clean white theme
  { name: "Gaborone", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Francistown", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Maun", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Palapye", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Jwaneng", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  
  // South Africa
  { name: "Johannesburg", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Cape Town", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  
  // East Africa
  { name: "Nairobi", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Mombasa", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  
  // West Africa
  { name: "Lagos", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Abuja", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  { name: "Accra", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
  
  // North Africa
  { name: "Casablanca", theme: { variant: "professional", primary: "rgb(15, 23, 42)", appearance: "light", radius: 0.5 } },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("tov-theme");
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem("tov-theme", JSON.stringify(theme));

    // Apply theme to document
    if (theme.appearance === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", theme.appearance === "dark");
    }
  }, [theme]);

  const toggleAppearance = () => {
    setTheme(prev => {
      const appearances: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
      const currentIndex = appearances.indexOf(prev.appearance);
      const nextIndex = (currentIndex + 1) % appearances.length;
      return {
        ...prev,
        appearance: appearances[nextIndex]
      };
    });
  };

  const setRegionalTheme = (regionName: string) => {
    const regionalTheme = regionalThemes.find(rt => rt.name === regionName);
    if (regionalTheme) {
      setTheme(regionalTheme.theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleAppearance, regionalThemes, setRegionalTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}