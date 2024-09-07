import { asc, eq, sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  pgView,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `${name}`);

export const ss58Address = (name: string) => varchar(name, { length: 256 });

/**
 * Modules registered on the Commune chain.
 *
 * atBlock == lastSeenBlock           --> registered
 * atBlock <  lastSeenBlock           --> deregistered
 * |lastSeenBlock - atBlock| < 1 week --> should be deleted
 */
export const moduleData = createTable(
  "module_data",
  {
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

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }).default(sql`null`),
  },
  (t) => ({
    unq: unique().on(t.netuid, t.moduleKey),
  }),
);

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

/**
 * A report made by a user about a module.
 */
export const ReportReasonEnum = pgEnum("reason", [
  "SPAM",
  "VIOLENCE",
  "HARASSMENT",
  "HATE_SPEECH",
  "SEXUAL_CONTENT",
]);

export const moduleReport = createTable("module_report", {
  id: serial("id").primaryKey(),
  userKey: ss58Address("user_key"),
  moduleId: integer("module_id")
    .references(() => moduleData.id)
    .notNull(),
  content: text("content"),
  reason: ReportReasonEnum("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * A comment made by a user on a proposal or DAO.
 */
export const governanceModelEnum = pgEnum("governance_model", [
  "PROPOSAL",
  "DAO",
]);

export const proposalCommentSchema = createTable(
  "proposal_comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: integer("proposal_id").notNull(),
    governanceModel: governanceModelEnum("governance_model"),
    userKey: ss58Address("user_key").notNull(),
    userName: text("user_name"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at").default(sql`null`),
  },
  (t) => ({
    proposalIdIndex: index("proposal_id_index").on(t.proposalId),
  }),
);

/**
 * A vote made by a user on a comment.
 */
export enum VoteType {
  UP = "UP",
  DOWN = "DOWN",
}

export const commentInteractionSchema = createTable(
  "comment_interaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .references(() => proposalCommentSchema.id)
      .notNull(),
    userKey: ss58Address("user_key").notNull(),
    voteType: varchar("vote_type", { length: 4 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    unq: unique().on(t.commentId, t.userKey),
    commentIdIndex: index("comment_id_index").on(t.commentId),
    commentVoteIndex: index("comment_vote_index").on(t.commentId, t.voteType),
  }),
);

/**
 * A view that aggregates votes on comments.
 * This view computes the number of upvotes and downvotes for each comment at write time.
 * so that we can query the data more efficiently.
 */
export const proposalCommentDigestView = pgView("comment_digest").as((qb) =>
  qb
    .select({
      id: proposalCommentSchema.id,
      proposalId: proposalCommentSchema.proposalId,
      userKey: proposalCommentSchema.userKey,
      governanceModel: proposalCommentSchema.governanceModel,
      userName: proposalCommentSchema.userName,
      content: proposalCommentSchema.content,
      createdAt: proposalCommentSchema.createdAt,
      upvotes:
        sql<number>`SUM(CASE WHEN ${commentInteractionSchema.voteType} = "UP" THEN 1 ELSE 0 END)`
          .mapWith(Number)
          .as("upvotes"),
      downvotes:
        sql<number>`SUM(CASE WHEN ${commentInteractionSchema.voteType} = ${VoteType.DOWN} THEN 1 ELSE 0 END)`
          .mapWith(Number)
          .as("downvotes"),
    })
    .from(proposalCommentSchema)
    .where(sql`${proposalCommentSchema.deletedAt} IS NULL`)
    .leftJoin(
      commentInteractionSchema,
      eq(proposalCommentSchema.id, commentInteractionSchema.commentId),
    )
    .groupBy(
      proposalCommentSchema.id,
      proposalCommentSchema.proposalId,
      proposalCommentSchema.userKey,
      proposalCommentSchema.governanceModel,
      proposalCommentSchema.content,
      proposalCommentSchema.createdAt,
    )
    .orderBy(asc(proposalCommentSchema.createdAt)),
);

/**
 * A report made by a user about comment.
 */
export const commentReportSchema = createTable("comment_report", {
  id: serial("id").primaryKey(),
  userKey: ss58Address("user_key"),
  commentId: uuid("comment_id")
    .references(() => proposalCommentSchema.id)
    .notNull(),
  content: text("content"),
  reason: ReportReasonEnum("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * A DAO (Decentralized Autonomous Organization) is a group of users that can vote on proposals.
 */
export const cadreSchema = createTable("cadre", {
  id: serial("id").primaryKey(),
  userKey: ss58Address("user_key").notNull().unique(),
  discordId: varchar("discord_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at").default(sql`null`),
});

/**
 * This table stores votes on S2 DAOs Applications.
 */
export const daoVoteTypeEnum = pgEnum("dao_vote_type", [
  "ACCEPT",
  "REFUSE",
  "REMOVE",
]);

export const daoVoteSchema = createTable(
  "dao_vote",
  {
    id: serial("id").primaryKey(),
    daoId: integer("dao_id").notNull(),
    userKey: ss58Address("user_key")
      .references(() => cadreSchema.userKey)
      .notNull(),
    daoVoteType: daoVoteTypeEnum("dao_vote_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at").default(sql`null`),
  },
  (t) => ({
    unq: unique().on(t.id, t.userKey, t.daoId),
  }),
);

/**
 * Auxiliary table to store the notification of a governance proposals / DAOs.
 */
export const governanceNotificationSchema = createTable(
  "governance_notification",
  {
    id: serial("id").primaryKey(),
    governanceModel: governanceModelEnum("governance_model").notNull(),
    proposalId: integer("proposal_id").notNull(),
    notifiedAt: timestamp("notified_at").defaultNow(),
  },
);
