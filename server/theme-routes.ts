import { Express } from "express";
import fs from "fs";
import path from "path";

export function registerThemeRoutes(app: Express) {
  // Endpoint to update theme.json
  app.post("/api/update-theme", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const theme = req.body;
      
      // Validate theme data
      if (!theme || 
          !theme.variant || 
          !theme.primary || 
          !theme.appearance || 
          typeof theme.radius !== 'number') {
        return res.status(400).json({ 
          message: "Invalid theme data. Required fields: variant, primary, appearance, radius" 
        });
      }
      
      // Write to theme.json file
      const themePath = path.resolve('theme.json');
      
      // Filter out region property before saving to theme.json
      const { region, ...themeWithoutRegion } = theme;
      
      await fs.promises.writeFile(
        themePath, 
        JSON.stringify(themeWithoutRegion, null, 2)
      );
      
      res.json({ message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
}