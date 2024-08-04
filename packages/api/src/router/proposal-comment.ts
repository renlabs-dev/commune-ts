import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, sql } from "@commune-ts/db";
import {
  proposalCommentDigestView,
  proposalCommentSchema,
  commentInteractionSchema,
  commentReportSchema
} from "@commune-ts/db/schema";

import {
  COMMENT_INTERACTION_INSERT_SCHEMA,
  COMMENT_REPORT_INSERT_SCHEMA,
  PROPOSAL_COMMENT_INSERT_SCHEMA
} from "@commune-ts/db/validation";

import { publicProcedure } from "../trpc";

export const proposalCommentRouter = {
  // GET
  byProposalId: publicProcedure
    .input(z.object({ proposalId: z.number() }))
    .query(({ ctx, input }) => {
    return ctx.db.select().from(proposalCommentDigestView).where(
      eq(proposalCommentDigestView.proposalId, input.proposalId)).execute();
  }),
  // POST
  createComment: publicProcedure
    .input(PROPOSAL_COMMENT_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(proposalCommentSchema).values(input);
    }),
  createCommentReport: publicProcedure
    .input(COMMENT_REPORT_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(commentReportSchema).values(input);
    }),
  castVote: publicProcedure
    .input(COMMENT_INTERACTION_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(commentInteractionSchema).values(input).onConflictDoUpdate({
        target: [commentInteractionSchema.commentId, commentInteractionSchema.userKey],
        set: {
          voteType: input.voteType,
        },
      });
    }),
  deleteVote: publicProcedure
    .input(z.object({ commentId: z.string(), userKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(commentInteractionSchema)
        .where(
          sql`${commentInteractionSchema.commentId} = ${input.commentId} AND ${commentInteractionSchema.userKey} = ${input.userKey}`,
        );
  }),
} satisfies TRPCRouterRecord;
