import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import imageRoutes from "./imageRoutes.js";
import restaurantRoutes from "./restaurantRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import menuRoutes from "./menuRoutes.js";
import driverRoutes from "./driverRoutes.js";
import ledgerRoutes from "./ledgerRoutes.js";
import searchRoutes from "./searchRoutes.js";
import customerRoutes from "./customerRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Image upload routes
  app.use("/api/images", imageRoutes);
  
  // Restaurant routes
  app.use("/api/restaurants", restaurantRoutes);
  
  // Category routes
  app.use("/api/categories", categoryRoutes);
  
  // Menu routes
  app.use("/api/menu", menuRoutes);
  
  // Driver routes
  app.use("/api/drivers", driverRoutes);
  
  // Ledger routes
  app.use("/api/ledger", ledgerRoutes);
  
  // Search routes
  app.use("/api/search", searchRoutes);
  
  // Customer routes
  app.use("/api/customers", customerRoutes);
  
  // Notification routes
  app.use("/api/notifications", notificationRoutes);

  // put other application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
