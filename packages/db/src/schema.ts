import { sql } from "drizzle-orm";
import {
  bigint,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ss58Address = (name: string) => varchar(name, { length: 256 });

export const createTable = pgTableCreator((name) => `${name}`);

/**
 * Modules registered on the Commune chain.
 *
 * atBlock == lastSeenBlock           --> registered
 * atBlock <  lastSeenBlock           --> deregistered
 * |lastSeenBlock - atBlock| < 1 week --> should be deleted
 */
export const moduleData = createTable("module_data", {
  id: serial("id").primaryKey(),
  moduleKey: ss58Address("module_key").notNull(),

  netuid: integer("netuid").notNull(),
  metadataUri: text("metadata_uri"),

  atBlock: integer("at_block").notNull(),
  registrationBlock: integer("registration_block"),

  emission: bigint("total_staked", { mode: "bigint" }),
  incentive: bigint("total_staked", { mode: "bigint" }),
  dividend: bigint("total_staked", { mode: "bigint" }),
  delegationFee: integer("delegation_fee"),

  totalStaked: bigint("total_staked", { mode: "bigint" }),
  totalStakers: integer("total_stakers"),
  totalRewards: bigint("total_staked", { mode: "bigint" }),

  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  deletedAt: timestamp("deleted_at").default(sql`NULL`),
});

/**
 * Data for the relation a user have with a specific module.
 * The user can set a weight (vote) for a module, and favorite it.
 */
export const userModuleData = createTable(
  "user_module_data",
  {
    id: serial("id").primaryKey(),
    userKey: ss58Address("user_key").notNull(),
    moduleKey: ss58Address("module_key")
      .references(() => moduleData.moduleKey)
      .notNull(),
    weight: integer("weight").default(0).notNull(),
  },
  (t) => ({
    unq: unique().on(t.userKey, t.moduleKey),
  }),
);

export const userModuleDataPostSchema = createInsertSchema(userModuleData, {
  userKey: z.string(),
  moduleKey: z.string(),
  weight: z.number(),
}).omit({
  id: true,
});

/**
 * A report made by a user about a module.
 */
export const moduleReport = createTable("module_report", {
  id: serial("id").primaryKey(),
  userKey: ss58Address("user_key"),
  moduleKey: ss58Address("module_key")
    .references(() => moduleData.moduleKey)
    .notNull(),
  content: text("content"),
  reason: varchar("reason", { length: 16 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const moduleReportPostSchema = createInsertSchema(moduleReport, {
  userKey: z.string(),
  moduleKey: z.string(),
  content: z.string(),
  reason: z.string(),
}).omit({
  id: true,
  createdAt: true,
});
