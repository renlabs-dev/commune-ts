import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@commune-ts/db";

import "@commune-ts/db/schema";

import { daoVoteSchema } from "@commune-ts/db/schema";
import { DAO_VOTE_INSERT_SCHEMA } from "@commune-ts/db/validation";

import { publicProcedure } from "../trpc";

export const daoRouter = {
  // GET
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.daoVoteSchema.findFirst({
        where: eq(daoVoteSchema.id, input.id),
      });
    }),
  // POST
  create: publicProcedure
    .input(DAO_VOTE_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(daoVoteSchema).values({
        daoId: input.daoId,
        votingKey: input.votingKey,
        daoVoteType: input.daoVoteType,
      });
    }),
  update: publicProcedure
    .input(DAO_VOTE_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(daoVoteSchema)
        .set({
          daoId: input.daoId,
          votingKey: input.votingKey,
          daoVoteType: input.daoVoteType,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(daoVoteSchema.votingKey, input.votingKey),
            eq(daoVoteSchema.daoId, input.daoId),
          ),
        );
    }),
} satisfies TRPCRouterRecord;
