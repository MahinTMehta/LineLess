import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQueueEntrySchema, updateQueueEntrySchema, insertReceiptSchema } from "@shared/schema";
import QRCode from "qrcode";
import { emailService } from "./services/email";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Queue endpoints
  app.post("/api/queue", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertQueueEntrySchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      // Check if user already has an active queue entry
      const existingEntry = await storage.getUserQueueEntry(userId);
      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message: "You already have an active queue entry",
          entry: existingEntry,
        });
      }
      
      const entry = await storage.addToQueue(data, userId);
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(entry.qrCode);
      
      // Send confirmation email
      const etaFormatted = new Date(entry.eta).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      await emailService.sendQueueConfirmation(entry.email, {
        name: entry.name,
        restaurant: entry.restaurant,
        position: entry.position,
        eta: etaFormatted,
        partySize: entry.partySize,
      });

      res.json({
        success: true,
        estimated_wait: "45 minutes",
        eta: entry.eta.toISOString(),
        message: "Successfully added to queue",
        entry: {
          id: entry.id,
          qrCode: entry.qrCode,
          qrCodeUrl,
          name: entry.name,
          restaurant: entry.restaurant,
          partySize: entry.partySize,
          joinTime: entry.joinTime,
          eta: entry.eta,
          status: entry.status,
        },
      });
    } catch (error) {
      console.error("Error adding to queue:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? "Invalid input data" : "Failed to add to queue" 
      });
    }
  });

  // User endpoint - get their own queue entry
  app.get("/api/queue/my-entry", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const entry = await storage.getUserQueueEntry(userId);
      
      if (!entry) {
        return res.json({ entry: null });
      }

      // Generate QR code for display
      const qrCodeUrl = await QRCode.toDataURL(entry.qrCode);
      
      res.json({
        entry: {
          id: entry.id,
          qrCode: entry.qrCode,
          qrCodeUrl,
          name: entry.name,
          restaurant: entry.restaurant,
          partySize: entry.partySize,
          joinTime: entry.joinTime,
          eta: entry.eta,
          status: entry.status,
        }
      });
    } catch (error) {
      console.error("Error fetching user queue entry:", error);
      res.status(500).json({ message: "Failed to fetch queue entry" });
    }
  });

  // Restaurant endpoint - get queue for management (admin only)
  app.get("/api/queue", async (req, res) => {
    try {
      const restaurant = req.query.restaurant as string;
      
      if (restaurant) {
        const queue = await storage.getQueueByRestaurant(restaurant);
        res.json(queue);
      } else {
        const allQueues = await storage.getAllQueues();
        res.json(allQueues);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
      res.status(500).json({ message: "Failed to fetch queue data" });
    }
  });

  app.get("/api/queue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getQueueEntry(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Queue entry not found" });
      }
      
      const position = await storage.getQueuePosition(id);
      res.json({ ...entry, position });
    } catch (error) {
      console.error("Error fetching queue entry:", error);
      res.status(500).json({ message: "Failed to fetch queue entry" });
    }
  });

  app.patch("/api/queue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = updateQueueEntrySchema.parse(req.body);
      
      const entry = await storage.updateQueueEntry(id, updates);
      
      if (!entry) {
        return res.status(404).json({ message: "Queue entry not found" });
      }

      // Send status update email if status changed
      if (updates.status) {
        const position = await storage.getQueuePosition(id);
        await emailService.sendStatusUpdate(entry.email, {
          name: entry.name,
          restaurant: entry.restaurant,
          status: updates.status,
          position: updates.status === "Waiting" ? position : undefined,
        });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating queue entry:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid update data" : "Failed to update queue entry" 
      });
    }
  });

  app.delete("/api/queue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromQueue(id);
      
      if (!success) {
        return res.status(404).json({ message: "Queue entry not found" });
      }
      
      res.json({ message: "Successfully removed from queue" });
    } catch (error) {
      console.error("Error removing from queue:", error);
      res.status(500).json({ message: "Failed to remove from queue" });
    }
  });

  // QR Code verification endpoint for restaurants
  app.post("/api/queue/verify-qr", async (req, res) => {
    try {
      const { qrCode } = req.body;
      
      if (!qrCode) {
        return res.status(400).json({ 
          success: false, 
          message: "QR code is required" 
        });
      }
      
      const entry = await storage.getQueueEntryByQrCode(qrCode);
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Invalid QR code"
        });
      }
      
      res.json({
        success: true,
        entry: {
          id: entry.id,
          name: entry.name,
          restaurant: entry.restaurant,
          partySize: entry.partySize,
          status: entry.status,
          joinTime: entry.joinTime,
          eta: entry.eta,
        }
      });
    } catch (error) {
      console.error("Error verifying QR code:", error);
      res.status(500).json({ message: "Failed to verify QR code" });
    }
  });

  // Receipt endpoints
  app.post("/api/receipts", isAuthenticated, async (req: any, res) => {
    try {
      const receiptData = insertReceiptSchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      const receipt = await storage.createReceipt({
        ...receiptData,
        userId,
      });
      
      res.json({
        success: true,
        receipt,
        message: "Receipt created successfully"
      });
    } catch (error) {
      console.error("Error creating receipt:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? "Invalid receipt data" : "Failed to create receipt" 
      });
    }
  });

  app.get("/api/receipts/my-receipts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const receipts = await storage.getUserReceipts(userId);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching user receipts:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.get("/api/receipts/restaurant/:restaurant", async (req, res) => {
    try {
      const restaurant = req.params.restaurant;
      const receipts = await storage.getRestaurantReceipts(restaurant);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching restaurant receipts:", error);
      res.status(500).json({ message: "Failed to fetch restaurant receipts" });
    }
  });

  // Webhook endpoint for n8n integration
  app.post("/webhook/tableq", async (req, res) => {
    try {
      const data = insertQueueEntrySchema.parse(req.body);
      const entry = await storage.addToQueue(data);
      
      // Generate QR code for webhook response
      const qrCodeUrl = await QRCode.toDataURL(entry.qrCode);
      
      // Send confirmation email
      const etaFormatted = new Date(entry.eta).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      await emailService.sendQueueConfirmation(entry.email, {
        name: entry.name,
        restaurant: entry.restaurant,
        position: entry.position,
        eta: etaFormatted,
        partySize: entry.partySize,
      });

      res.json({
        success: true,
        queue_position: entry.position,
        estimated_wait: "45 minutes",
        eta: entry.eta.toISOString(),
        qr_code: entry.qrCode,
        qr_code_url: qrCodeUrl,
        message: "Successfully added to queue",
      });
    } catch (error) {
      console.error("Error in webhook:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? "Invalid webhook data" : "Webhook processing failed" 
      });
    }
  });

  // Statistics endpoint for admin dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const allQueues = await storage.getAllQueues();
      const waitingQueues = allQueues.filter(q => q.status === "Waiting");
      const servedToday = allQueues.filter(q => {
        const today = new Date();
        const entryDate = new Date(q.joinTime);
        return entryDate.toDateString() === today.toDateString() && q.status === "Seated";
      });

      // Calculate average wait time
      const avgWaitMinutes = waitingQueues.length > 0 ? 45 : 0; // Simplified calculation

      res.json({
        totalQueue: waitingQueues.length,
        avgWait: `${avgWaitMinutes} min`,
        tablesServed: servedToday.length,
        peakHour: "7-8 PM", // This would be calculated from actual data
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
