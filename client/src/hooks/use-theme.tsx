import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = {
  variant: "professional" | "tint" | "vibrant";
  primary: string;
  appearance: "light" | "dark" | "system";
  radius: number;
  region?: string;
};

type RegionalTheme = {
  name: string;
  theme: Theme;
};

// Regional theme presets for different regions of Botswana
const regionalThemes: RegionalTheme[] = [
  {
    name: "Gaborone",
    theme: {
      variant: "tint",
      primary: "hsl(210, 90%, 95%)",
      appearance: "light",
      radius: 0.5,
      region: "Gaborone"
    }
  },
  {
    name: "Francistown",
    theme: {
      variant: "professional",
      primary: "hsl(210, 90%, 50%)",
      appearance: "light",
      radius: 0.5,
      region: "Francistown"
    }
  },
  {
    name: "Maun",
    theme: {
      variant: "vibrant",
      primary: "hsl(35, 90%, 55%)",
      appearance: "light", 
      radius: 0.5,
      region: "Maun"
    }
  },
  {
    name: "Palapye",
    theme: {
      variant: "professional",
      primary: "hsl(160, 60%, 40%)",
      appearance: "light",
      radius: 0.5,
      region: "Palapye"
    }
  },
  {
    name: "Jwaneng",
    theme: {
      variant: "vibrant",
      primary: "hsl(245, 60%, 60%)",
      appearance: "light",
      radius: 0.5,
      region: "Jwaneng"
    }
  }
];

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleAppearance: () => void;
  regionalThemes: RegionalTheme[];
  setRegionalTheme: (region: string) => void;
};

const defaultTheme: Theme = {
  variant: "tint",
  primary: "hsl(210, 90%, 95%)",
  appearance: "light",
  radius: 0.5
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("tov-theme");
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem("tov-theme", JSON.stringify(theme));

    // Update theme.json via custom endpoint
    fetch("/api/update-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(theme),
    }).catch(err => console.error("Failed to update theme:", err));

    // Apply system preference if set to "system"
    if (theme.appearance === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", theme.appearance === "dark");
    }
  }, [theme]);

  // Listen for system preference changes if theme is set to "system"
  useEffect(() => {
    if (theme.appearance === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme.appearance]);

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

  const setRegionalTheme = (region: string) => {
    const foundTheme = regionalThemes.find(rt => rt.name === region);
    if (foundTheme) {
      setTheme(foundTheme.theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleAppearance, 
      regionalThemes,
      setRegionalTheme 
    }}>
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