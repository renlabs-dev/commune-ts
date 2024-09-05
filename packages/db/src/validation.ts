import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { DaoApplicationStatus, DaoApplicationVote } from "@commune-ts/types";

import {
  commentInteractionSchema,
  commentReportSchema,
  DaoApplicationVoteEnum,
  daoVoteSchema,
  moduleReport,
  proposalCommentSchema,
  ReportReason,
  userModuleData,
  VoteType,
} from "./schema";

export const PROPOSAL_COMMENT_INSERT_SCHEMA = createInsertSchema(
  proposalCommentSchema,
  {
    content: z
      .string()
      .min(1)
      .max(512)
      .transform((v) => v.trim())
      .refine((s) => s.length, "Comment should not be blank"),
    userKey: z.string().min(1),
    userName: z.string().optional(),
    proposalId: z.number().int(),
    type: z.enum(["PROPOSAL", "DAO"] as const),
  },
).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

export const COMMENT_INTERACTION_INSERT_SCHEMA = createInsertSchema(
  commentInteractionSchema,
  {
    commentId: z.string(),
    userKey: z.string(),
    voteType: z.nativeEnum(VoteType),
  },
).omit({
  id: true,
  createdAt: true,
});

export const COMMENT_REPORT_INSERT_SCHEMA = createInsertSchema(
  commentReportSchema,
  {
    commentId: z.string(),
    userKey: z.string(),
    reason: z.nativeEnum(ReportReason),
    content: z
      .string()
      .min(1)
      .max(512)
      .transform((v) => v.trim())
      .refine((s) => s.length, "Comment should not be blank"),
  },
).omit({
  id: true,
  createdAt: true,
});

export const MODULE_REPORT_INSERT_SCHEMA = createInsertSchema(moduleReport, {
  userKey: z.string(),
  moduleId: z.number().int(),
  content: z
    .string()
    .min(1)
    .max(512)
    .transform((v) => v.trim())
    .refine((s) => s.length, "Comment should not be blank"),
  reason: z.nativeEnum(ReportReason),
}).omit({
  id: true,
  createdAt: true,
});

export const USER_MODULE_DATA_INSERT_SCHEMA = createInsertSchema(
  userModuleData,
  {
    weight: z.number().positive(),
  },
).omit({
  id: true,
});

export const DAO_VOTE_INSERT_SCHEMA = createInsertSchema(daoVoteSchema).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
