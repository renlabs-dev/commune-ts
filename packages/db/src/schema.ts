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

  netuid: integer("netuid").notNull(),
  moduleKey: ss58Address("module_key").notNull(),

  atBlock: integer("at_block").notNull(),

  name: text("name"),

  registrationBlock: integer("registration_block"),
  addressUri: text("address_uri"),
  metadataUri: text("metadata_uri"),

  emission: bigint("emission", { mode: "bigint" }),
  incentive: bigint("incentive", { mode: "bigint" }),
  dividend: bigint("dividend", { mode: "bigint" }),
  delegationFee: integer("delegation_fee"),

  totalStaked: bigint("total_staked", { mode: "bigint" }),
  totalStakers: integer("total_stakers"),
  totalRewards: bigint("total_rewards", { mode: "bigint" }),

  createdAt: timestamp("created_at", {withTimezone: true, mode: "date"}).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: "date"}).defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", {withTimezone: true, mode: "date"}).default(null),
}, (t) => ({
  unq: unique().on(t.netuid, t.moduleKey),
}),);

/**
 * Data for the relation a user have with a specific module.
 * The user can set a weight (vote) for a module, and favorite it.
 */
export const userModuleData = createTable(
  "user_module_data",
  {
    id: serial("id").primaryKey(),
    userKey: ss58Address("user_key").notNull(),
    moduleId: integer("module_id")
      .references(() => moduleData.id)
      .notNull(),
    weight: integer("weight").default(0).notNull(),
  },
  (t) => ({
    unq: unique().on(t.userKey, t.moduleId),
  }),
);

export const userModuleDataPostSchema = createInsertSchema(userModuleData, {
  userKey: z.string(),
  moduleId: z.number().int(),
  weight: z.number().positive(),
}).omit({
  id: true,
});


export enum ReportReason {
  Spam = "Spam",
  HarassmentOrBullying = "HarassmentOrBullying",
  HateSpeech = "HateSpeech",
  ViolenceOrHarm = "ViolenceOrHarm",
  SexualContent = "SexualContent",
}

/**
 * A report made by a user about a module.
 */
export const moduleReport = createTable("module_report", {
  id: serial("id").primaryKey(),
  userKey: ss58Address("user_key"),
  moduleId: integer("module_id")
    .references(() => moduleData.id)
    .notNull(),
  content: text("content"),
  reason: varchar("reason", { length: 16 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moduleReportPostSchema = createInsertSchema(moduleReport, {
  userKey: z.string(),
  moduleId: z.number().int(),
  content: z.string(),
  reason: z.string(),
}).omit({
  id: true,
});
