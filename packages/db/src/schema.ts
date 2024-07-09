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
export const module = createTable("module", {
  uid: serial("uid").primaryKey().notNull(),
  key: varchar("key", { length: 256 }).unique().notNull(),
  emission: integer("emission").default(0).notNull(),
  incentive: integer("incentive").default(0).notNull(),
  dividend: integer("dividend").default(0).notNull(),
  delegationFee: integer("delegation_fee").default(0).notNull(),
  metadataUri: text("metadata_uri"),
  isActive: boolean("is_active").default(true).notNull(),
  registrationBlock: integer("registration_block").default(0).notNull(),
  lastSeenBlock: integer("last_seen_block").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Data for the relation a user have with a specific module.
 * The user can set a weight (vote) for a module, and favorite it.
 */
export const userModuleData = createTable("user_module_data", {
  userAddress: ss58Address("user_address").primaryKey(),
  moduleAddress: ss58Address("module_address").references(() => module.key),
  userStakedValue: integer("user_staked_value").default(0),
  weight: integer("weight").default(0),
});

export const moduleStakeData = createTable("module_stake_data", {
  moduleAddress: ss58Address("module_address").primaryKey(),
  totalStaked: integer("total_stake").default(0),
});

/**
 * A report made by a user about a module.  registrationBlock: integer("registration_block").default(0).notNull(),
 */
export const moduleReport = createTable("module_report", {
  id: serial("id").primaryKey(),
  userAddress: ss58Address("address"),
  moduleAddress: ss58Address("address").references(() => module.key),
  content: text("content"),
  reason: varchar("reason", { length: 16 }),
});

// New Tables

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
