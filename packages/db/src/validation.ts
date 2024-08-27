import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  commentInteractionSchema,
  commentReportSchema,
  proposalCommentSchema,
  ReportReason,
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
