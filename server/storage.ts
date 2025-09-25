import { 
  users, 
  customerProfiles,
  type User, 
  type InsertUser,
  type CustomerProfile,
  type InsertCustomerProfile
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer profile operations
  getCustomerProfile(userId: string): Promise<CustomerProfile | undefined>;
  createCustomerProfile(customerProfile: InsertCustomerProfile): Promise<CustomerProfile>;
  updateCustomerProfile(userId: string, updates: Partial<InsertCustomerProfile>): Promise<CustomerProfile>;
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomerProfile(userId: string): Promise<CustomerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId));
    return profile || undefined;
  }

  async createCustomerProfile(customerProfile: InsertCustomerProfile): Promise<CustomerProfile> {
    const [profile] = await db
      .insert(customerProfiles)
      .values(customerProfile)
      .returning();
    return profile;
  }

  async updateCustomerProfile(userId: string, updates: Partial<InsertCustomerProfile>): Promise<CustomerProfile> {
    const [profile] = await db
      .update(customerProfiles)
      .set(updates)
      .where(eq(customerProfiles.userId, userId))
      .returning();
    return profile;
  }
}

export const storage = new DatabaseStorage();
