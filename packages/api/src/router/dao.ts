import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, isNull } from "@commune-ts/db";

import "@commune-ts/db/schema";

import { daoVoteSchema } from "@commune-ts/db/schema";
import { DAO_VOTE_INSERT_SCHEMA } from "@commune-ts/db/validation";

import { publicProcedure } from "../trpc";

export const daoRouter = {
  // GET
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.daoVoteSchema.findMany({
        where: and(
          eq(daoVoteSchema.daoId, input.id),
          isNull(daoVoteSchema.deletedAt),
        ),
      });
    }),
  byCadre: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.cadreSchema.findMany();
  }),
  // POST
  createVote: publicProcedure
    .input(DAO_VOTE_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(daoVoteSchema).values(input).execute();
    }),
  // deleted_at
  deleteVote: publicProcedure
    .input(z.object({ userKey: z.string(), daoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(daoVoteSchema)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(daoVoteSchema.userKey, input.userKey),
            eq(daoVoteSchema.daoId, input.daoId),
          ),
        );
    }),
} satisfies TRPCRouterRecord;
