import {
  users,
  queueEntries,
  receipts,
  type User,
  type UpsertUser,
  type QueueEntry,
  type InsertQueueEntry,
  type UpdateQueueEntry,
  type Receipt,
  type InsertReceipt,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Queue methods
  addToQueue(entry: InsertQueueEntry, userId?: string): Promise<QueueEntry>;
  getQueueEntry(id: number): Promise<QueueEntry | undefined>;
  getQueueEntryByQrCode(qrCode: string): Promise<QueueEntry | undefined>;
  getUserQueueEntry(userId: string): Promise<QueueEntry | undefined>;
  getQueueByRestaurant(restaurant: string): Promise<QueueEntry[]>;
  getAllQueues(): Promise<QueueEntry[]>;
  updateQueueEntry(id: number, updates: UpdateQueueEntry): Promise<QueueEntry | undefined>;
  removeFromQueue(id: number): Promise<boolean>;
  getQueuePosition(id: number): Promise<number>;
  updateQueuePositions(restaurant: string): Promise<void>;
  
  // Receipt methods
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  getUserReceipts(userId: string): Promise<Receipt[]>;
  getRestaurantReceipts(restaurant: string): Promise<Receipt[]>;
  updateReceipt(id: number, updates: Partial<Receipt>): Promise<Receipt | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Queue methods - using database
  async addToQueue(insertEntry: InsertQueueEntry, userId?: string): Promise<QueueEntry> {
    const joinTime = new Date(insertEntry.joinTime);
    const eta = new Date(joinTime.getTime() + 45 * 60 * 1000);
    const qrCode = uuidv4(); // Generate unique QR code
    
    // Calculate position in queue for this restaurant
    const existingEntries = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.restaurant, insertEntry.restaurant));
    
    const waitingEntries = existingEntries.filter(entry => entry.status === "Waiting");
    const position = waitingEntries.length + 1;
    
    const [newEntry] = await db
      .insert(queueEntries)
      .values({
        name: insertEntry.name,
        email: insertEntry.email,
        restaurant: insertEntry.restaurant,
        partySize: insertEntry.partySize,
        qrCode,
        joinTime,
        eta,
        status: "Waiting" as const,
        position,
        userId: userId || null,
      })
      .returning();
    
    return newEntry;
  }

  async getQueueEntryByQrCode(qrCode: string): Promise<QueueEntry | undefined> {
    const [entry] = await db.select().from(queueEntries).where(eq(queueEntries.qrCode, qrCode));
    return entry;
  }

  async getUserQueueEntry(userId: string): Promise<QueueEntry | undefined> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(and(
        eq(queueEntries.userId, userId),
        eq(queueEntries.status, "Waiting")
      ));
    return entry;
  }

  async getQueueEntry(id: number): Promise<QueueEntry | undefined> {
    const [entry] = await db.select().from(queueEntries).where(eq(queueEntries.id, id));
    return entry;
  }

  async getQueueByRestaurant(restaurant: string): Promise<QueueEntry[]> {
    return await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.restaurant, restaurant));
  }

  async getAllQueues(): Promise<QueueEntry[]> {
    return await db.select().from(queueEntries);
  }

  async updateQueueEntry(id: number, updates: UpdateQueueEntry): Promise<QueueEntry | undefined> {
    const [updated] = await db
      .update(queueEntries)
      .set(updates)
      .where(eq(queueEntries.id, id))
      .returning();
    
    if (updated && updates.status && (updates.status === "Seated" || updates.status === "Cancelled")) {
      await this.updateQueuePositions(updated.restaurant);
    }
    
    return updated;
  }

  async removeFromQueue(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(queueEntries)
      .where(eq(queueEntries.id, id))
      .returning();
    
    if (deleted) {
      await this.updateQueuePositions(deleted.restaurant);
      return true;
    }
    return false;
  }

  async getQueuePosition(id: number): Promise<number> {
    const entry = await this.getQueueEntry(id);
    if (!entry) return 0;
    
    const restaurantEntries = await this.getQueueByRestaurant(entry.restaurant);
    const waitingEntries = restaurantEntries
      .filter(e => e.status === "Waiting")
      .sort((a, b) => new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime());
    
    return waitingEntries.findIndex(e => e.id === id) + 1;
  }

  async updateQueuePositions(restaurant: string): Promise<void> {
    const restaurantEntries = await this.getQueueByRestaurant(restaurant);
    const waitingEntries = restaurantEntries
      .filter(entry => entry.status === "Waiting")
      .sort((a, b) => new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime());
    
    for (let i = 0; i < waitingEntries.length; i++) {
      await db
        .update(queueEntries)
        .set({ position: i + 1 })
        .where(eq(queueEntries.id, waitingEntries[i].id));
    }
  }

  // Receipt methods
  async createReceipt(receiptData: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db
      .insert(receipts)
      .values(receiptData)
      .returning();
    return receipt;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt;
  }

  async getUserReceipts(userId: string): Promise<Receipt[]> {
    return await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId));
  }

  async getRestaurantReceipts(restaurant: string): Promise<Receipt[]> {
    return await db
      .select()
      .from(receipts)
      .where(eq(receipts.restaurant, restaurant));
  }

  async updateReceipt(id: number, updates: Partial<Receipt>): Promise<Receipt | undefined> {
    const [updated] = await db
      .update(receipts)
      .set(updates)
      .where(eq(receipts.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
