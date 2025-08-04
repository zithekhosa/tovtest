import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware to verify Supabase JWT and attach user info to req.user
export async function supabaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  // Create a user object with the role from user_metadata
  const userWithRole = {
    ...data.user,
    role: data.user.user_metadata?.role || 'tenant' // Default to tenant if no role specified
  };
  
  // Attach user info to request
  (req as any).user = userWithRole;
  next();
}

// Helper to require authentication in routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Example: use supabaseAuthMiddleware as global or per-route middleware
// app.use(supabaseAuthMiddleware); // for all routes
// app.get('/api/protected', supabaseAuthMiddleware, (req, res) => { ... });
