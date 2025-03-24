import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./utils";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Use session secret from environment or fallback to a random value
  // In production, this should be set as an environment variable
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log(`Password match result: ${passwordMatches}`);
        
        if (!passwordMatches) {
          return done(null, false);
        } else {
          console.log(`Successful login for: ${username}, role: ${user.role}`);
          return done(null, user);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).send("Username already exists");
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).send("Email already exists");
      }

      // Create the new user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user data without the password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login API called with:", req.body);
    
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      console.log("Passport authenticate result:", { error: err ? err.message : null, userFound: !!user, info });
      
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed: Invalid username or password");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return next(err);
        }
        
        console.log("Login successful for user:", user.username);
        // Return user data without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return user data without the password
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}
