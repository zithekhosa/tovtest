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

// Regional theme presets for different regions of Africa
const regionalThemes: RegionalTheme[] = [
  // Botswana Themes
  {
    name: "Gaborone",
    theme: {
      variant: "tint",
      primary: "hsl(210, 90%, 50%)",
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
      appearance: "dark",
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
      appearance: "dark",
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
  },
  
  // South Africa Themes
  {
    name: "Johannesburg",
    theme: {
      variant: "professional",
      primary: "hsl(215, 80%, 45%)",
      appearance: "light",
      radius: 1.0,
      region: "Johannesburg"
    }
  },
  {
    name: "Cape Town",
    theme: {
      variant: "vibrant",
      primary: "hsl(195, 80%, 50%)",
      appearance: "dark",
      radius: 1.0,
      region: "Cape Town"
    }
  },
  
  // Nigeria Themes
  {
    name: "Lagos",
    theme: {
      variant: "professional",
      primary: "hsl(120, 60%, 40%)",
      appearance: "light",
      radius: 0.5,
      region: "Lagos"
    }
  },
  {
    name: "Abuja",
    theme: {
      variant: "tint",
      primary: "hsl(110, 70%, 45%)",
      appearance: "dark",
      radius: 0.5,
      region: "Abuja"
    }
  },
  
  // Kenya Themes
  {
    name: "Nairobi",
    theme: {
      variant: "vibrant",
      primary: "hsl(0, 80%, 50%)",
      appearance: "light",
      radius: 0.5,
      region: "Nairobi"
    }
  },
  {
    name: "Mombasa",
    theme: {
      variant: "professional",
      primary: "hsl(200, 80%, 50%)",
      appearance: "dark",
      radius: 1.0,
      region: "Mombasa"
    }
  },
  
  // Ghana Themes
  {
    name: "Accra",
    theme: {
      variant: "vibrant",
      primary: "hsl(45, 90%, 50%)",
      appearance: "light",
      radius: 0.5,
      region: "Accra"
    }
  },
  
  // Morocco Themes
  {
    name: "Casablanca",
    theme: {
      variant: "professional",
      primary: "hsl(15, 70%, 50%)",
      appearance: "dark",
      radius: 1.0,
      region: "Casablanca"
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