import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const ss58Address = (name: string) => varchar(name, { length: 256 });

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

/**
 * A module on the Commune network considered by our system.
 */
export const moduleItem = createTable("moduleItem", {
  address: ss58Address("address").primaryKey(),
  lastSeenBlock: integer("last_seen_block"), // updated_at kinda
  metadataUri: text("metadata_uri"),
  // if uid is null (worker will set) the module is de-registered
  uid: varchar("uid", { length: 256 }),
  // other module data UwU
});

/**
 * Data for the relation a user have with a specific module.
 * The user can set a weight (vote) for a module, and favorite it.
 */
export const userModuleData = createTable("user_module_data", {
  userAddress: ss58Address("user_address").primaryKey(),
  moduleAddress: ss58Address("module_address").references(
    () => moduleItem.address,
  ),
  weight: integer("weight").default(0),
  favorite: boolean("favorite").default(false),
});

export const moduleReport = createTable("module_report", {
  id: serial("id").primaryKey(),
  userAddress: ss58Address("address"),
  moduleAddress: ss58Address("address").references(() => moduleItem.address),
  content: text("content"),
  reason: varchar("reason", { length: 16 }),
});

// Test Table
export const moduleTest = createTable("module_test", {
  id: serial("id").primaryKey(),
  weight: integer("weight").default(0),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const moduleTestPostSchema = createInsertSchema(moduleTest, {
  weight: z.number().int().min(0).max(100),
}).omit({
  id: true,
  createdAt: true,
});
