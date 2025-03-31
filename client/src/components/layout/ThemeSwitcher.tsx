import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  Monitor, 
  MapPin, 
  Palette, 
  Circle, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { 
    theme, 
    setTheme, 
    toggleAppearance, 
    regionalThemes, 
    setRegionalTheme 
  } = useTheme();
  
  // Theme variant options
  const variants = [
    { name: "Professional", value: "professional" as const },
    { name: "Tint", value: "tint" as const },
    { name: "Vibrant", value: "vibrant" as const }
  ];
  
  // Predefined color options
  const colors = [
    { name: "Blue", value: "hsl(210, 90%, 50%)" },
    { name: "Green", value: "hsl(160, 60%, 40%)" },
    { name: "Purple", value: "hsl(245, 60%, 60%)" },
    { name: "Orange", value: "hsl(35, 90%, 55%)" },
    { name: "Pink", value: "hsl(330, 80%, 60%)" },
    { name: "Gray", value: "hsl(220, 15%, 40%)" },
    { name: "Light Blue", value: "hsl(210, 90%, 95%)" },
  ];
  
  // Border radius options
  const radiusOptions = [
    { name: "None", value: 0 },
    { name: "Small", value: 0.5 },
    { name: "Medium", value: 1.0 },
    { name: "Large", value: 1.5 },
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
          {theme.appearance === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme.appearance === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="mt-2 text-xs font-normal text-muted-foreground">
            Appearance
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 p-1">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 justify-start px-2",
                theme.appearance === "light" && "border-2 border-primary"
              )}
              onClick={() => setTheme({ ...theme, appearance: "light" })}
            >
              <Sun className="mr-1 h-4 w-4" />
              <span>Light</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 justify-start px-2",
                theme.appearance === "dark" && "border-2 border-primary"
              )}
              onClick={() => setTheme({ ...theme, appearance: "dark" })}
            >
              <Moon className="mr-1 h-4 w-4" />
              <span>Dark</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 justify-start px-2",
                theme.appearance === "system" && "border-2 border-primary"
              )}
              onClick={() => setTheme({ ...theme, appearance: "system" })}
            >
              <Monitor className="mr-1 h-3.5 w-3.5" />
              <span>System</span>
            </Button>
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Color Scheme
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1 p-1">
            {colors.map((color) => (
              <Button
                key={color.value}
                variant="outline"
                size="sm"
                className="h-8 p-1"
                style={{ 
                  backgroundColor: color.value, 
                  border: theme.primary === color.value ? '2px solid black' : '1px solid #ccc'
                }}
                onClick={() => setTheme({ ...theme, primary: color.value })}
                title={color.name}
              >
                {theme.primary === color.value && (
                  <Check className="h-5 w-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                )}
              </Button>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Style Variant
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 p-1">
            {variants.map((variant) => (
              <Button
                key={variant.value}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 justify-start px-2",
                  theme.variant === variant.value && "border-2 border-primary"
                )}
                onClick={() => setTheme({ ...theme, variant: variant.value })}
              >
                <Palette className="mr-1 h-4 w-4" />
                <span>{variant.name}</span>
              </Button>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Border Radius
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1 p-1">
            {radiusOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 justify-center",
                  theme.radius === option.value && "border-2 border-primary"
                )}
                onClick={() => setTheme({ ...theme, radius: option.value })}
              >
                <span>{option.name}</span>
              </Button>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Regional Presets
        </DropdownMenuLabel>
        <div className="max-h-40 overflow-y-auto p-1">
          {regionalThemes.map((regionalTheme) => (
            <Button
              key={regionalTheme.name}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full h-8 justify-start mb-1",
                theme.region === regionalTheme.name && "bg-muted"
              )}
              onClick={() => setRegionalTheme(regionalTheme.name)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              <span>{regionalTheme.name}</span>
              <div 
                className="ml-auto h-4 w-4 rounded-full"
                style={{ backgroundColor: regionalTheme.theme.primary }}
              />
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}