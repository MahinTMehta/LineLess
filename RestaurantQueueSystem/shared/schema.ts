import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queueEntries = pgTable("queue_entries", {
  id: serial("id").primaryKey(),
  qrCode: varchar("qr_code", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  restaurant: varchar("restaurant", { length: 255 }).notNull(),
  partySize: integer("party_size").notNull(),
  joinTime: timestamp("join_time").notNull(),
  eta: timestamp("eta").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Waiting"),
  position: integer("position").notNull().default(1),
  userId: varchar("user_id"),
});

// Receipts table for storing transaction records
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  queueEntryId: integer("queue_entry_id").references(() => queueEntries.id),
  userId: varchar("user_id").references(() => users.id),
  restaurant: varchar("restaurant", { length: 255 }).notNull(),
  items: jsonb("items").notNull(), // Array of menu items
  subtotal: integer("subtotal").notNull(), // Amount in cents
  tax: integer("tax").notNull(), // Tax amount in cents
  tip: integer("tip").default(0), // Tip amount in cents
  total: integer("total").notNull(), // Total amount in cents
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQueueEntrySchema = createInsertSchema(queueEntries).omit({
  id: true,
  qrCode: true,
  eta: true,
  status: true,
  position: true,
  userId: true,
}).extend({
  joinTime: z.string().or(z.date()).transform((val) => new Date(val)),
});

export const updateQueueEntrySchema = createInsertSchema(queueEntries).omit({
  id: true,
}).partial();

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;
export type QueueEntry = typeof queueEntries.$inferSelect;
export type UpdateQueueEntry = z.infer<typeof updateQueueEntrySchema>;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
