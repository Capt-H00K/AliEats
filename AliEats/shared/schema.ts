import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  decimal, 
  integer, 
  boolean, 
  jsonb,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "restaurant", "driver", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending", 
  "confirmed", 
  "preparing", 
  "ready", 
  "picked_up", 
  "delivered", 
  "cancelled"
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const ledgerTypeEnum = pgEnum("ledger_type", ["earning", "fee", "settlement", "debt"]);

// Users table - enhanced with role-based system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("customer"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customer profiles
export const customerProfiles = pgTable("customer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  addresses: jsonb("addresses").$type<Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>>(),
  preferences: jsonb("preferences").$type<{
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    notifications?: {
      orderUpdates: boolean;
      promotions: boolean;
      newRestaurants: boolean;
    };
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Restaurant profiles
export const restaurantProfiles = pgTable("restaurant_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  address: jsonb("address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  }>(),
  contactInfo: jsonb("contact_info").$type<{
    phone: string;
    email: string;
    website?: string;
  }>(),
  bankDetails: jsonb("bank_details").$type<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  }>(),
  openingHours: jsonb("opening_hours").$type<{
    [key: string]: { open: string; close: string; isOpen: boolean };
  }>(),
  cuisineTypes: text("cuisine_types").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Driver profiles
export const driverProfiles = pgTable("driver_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleInfo: jsonb("vehicle_info").$type<{
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  }>(),
  bankDetails: jsonb("bank_details").$type<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  }>(),
  customFees: jsonb("custom_fees").$type<{
    deliveryFee: number;
    speedPointFee?: number;
    additionalFees?: Array<{ name: string; amount: number }>;
  }>(),
  isAvailable: boolean("is_available").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalDeliveries: integer("total_deliveries").default(0),
  currentDebt: decimal("current_debt", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Menu items
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurantProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time"), // in minutes
  nutritionInfo: jsonb("nutrition_info").$type<{
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    allergens?: string[];
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Menu item categories (many-to-many relationship)
export const menuItemCategories = pgTable("menu_item_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurantProfiles.id),
  driverId: varchar("driver_id").references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").notNull().default("pending"),
  items: jsonb("items").$type<Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: jsonb("delivery_address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  }>().notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ledger for tracking driver earnings, fees, and debts
export const ledgerEntries = pgTable("ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  type: ledgerTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  isSettled: boolean("is_settled").notNull().default(false),
  settledAt: timestamp("settled_at"),
  metadata: jsonb("metadata").$type<{
    feeType?: string;
    settlementId?: string;
    notes?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Settlements for driver payments
export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  settledEntries: text("settled_entries").array(), // Array of ledger entry IDs
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").references(() => restaurantProfiles.id),
  driverId: varchar("driver_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  type: text("type").notNull(), // "restaurant" or "driver"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Promotions
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").unique(),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  targetAudience: jsonb("target_audience").$type<{
    userIds?: string[];
    customerSegments?: string[];
    restaurantIds?: string[];
  }>(),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification tokens for push notifications
export const notificationTokens = pgTable("notification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  platform: text("platform").notNull(), // "web", "ios", "android"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  restaurantProfile: one(restaurantProfiles, {
    fields: [users.id],
    references: [restaurantProfiles.userId],
  }),
  driverProfile: one(driverProfiles, {
    fields: [users.id],
    references: [driverProfiles.userId],
  }),
  orders: many(orders),
  ledgerEntries: many(ledgerEntries),
  reviews: many(reviews),
  notificationTokens: many(notificationTokens),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
}));

export const restaurantProfilesRelations = relations(restaurantProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [restaurantProfiles.userId],
    references: [users.id],
  }),
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const driverProfilesRelations = relations(driverProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [driverProfiles.userId],
    references: [users.id],
  }),
  ledgerEntries: many(ledgerEntries),
  settlements: many(settlements),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurantProfiles, {
    fields: [menuItems.restaurantId],
    references: [restaurantProfiles.id],
  }),
  categories: many(menuItemCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItemCategories),
}));

export const menuItemCategoriesRelations = relations(menuItemCategories, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [menuItemCategories.menuItemId],
    references: [menuItems.id],
  }),
  category: one(categories, {
    fields: [menuItemCategories.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  restaurant: one(restaurantProfiles, {
    fields: [orders.restaurantId],
    references: [restaurantProfiles.id],
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
  }),
  ledgerEntries: many(ledgerEntries),
  reviews: many(reviews),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  driver: one(users, {
    fields: [ledgerEntries.driverId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [ledgerEntries.orderId],
    references: [orders.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  driver: one(users, {
    fields: [settlements.driverId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  restaurant: one(restaurantProfiles, {
    fields: [reviews.restaurantId],
    references: [restaurantProfiles.id],
  }),
  driver: one(users, {
    fields: [reviews.driverId],
    references: [users.id],
  }),
}));

export const notificationTokensRelations = relations(notificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [notificationTokens.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  role: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertCustomerProfileSchema = createInsertSchema(customerProfiles);
export const selectCustomerProfileSchema = createSelectSchema(customerProfiles);

export const insertRestaurantProfileSchema = createInsertSchema(restaurantProfiles);
export const selectRestaurantProfileSchema = createSelectSchema(restaurantProfiles);

export const insertDriverProfileSchema = createInsertSchema(driverProfiles);
export const selectDriverProfileSchema = createSelectSchema(driverProfiles);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const selectMenuItemSchema = createSelectSchema(menuItems);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries);
export const selectLedgerEntrySchema = createSelectSchema(ledgerEntries);

export const insertSettlementSchema = createInsertSchema(settlements);
export const selectSettlementSchema = createSelectSchema(settlements);

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);

export const insertPromotionSchema = createInsertSchema(promotions);
export const selectPromotionSchema = createSelectSchema(promotions);

export const insertNotificationTokenSchema = createInsertSchema(notificationTokens);
export const selectNotificationTokenSchema = createSelectSchema(notificationTokens);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCustomerProfile = z.infer<typeof insertCustomerProfileSchema>;
export type CustomerProfile = typeof customerProfiles.$inferSelect;

export type InsertRestaurantProfile = z.infer<typeof insertRestaurantProfileSchema>;
export type RestaurantProfile = typeof restaurantProfiles.$inferSelect;

export type InsertDriverProfile = z.infer<typeof insertDriverProfileSchema>;
export type DriverProfile = typeof driverProfiles.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;

export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Settlement = typeof settlements.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export type InsertNotificationToken = z.infer<typeof insertNotificationTokenSchema>;
export type NotificationToken = typeof notificationTokens.$inferSelect;
