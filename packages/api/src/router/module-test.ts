import type { TRPCRouterRecord } from "@trpc/server";

import { moduleTest, moduleTestPostSchema } from "@commune-ts/db/schema";

import { publicProcedure } from "../trpc";

export const moduleTestRouter = {
  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.moduleTest.findFirst({
      orderBy: (weight, { desc }) => [desc(weight.createdAt)],
    });
  }),
  create: publicProcedure
    .input(moduleTestPostSchema)
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await ctx.db.insert(moduleTest).values({
        weight: input.weight,
      });
    }),
} satisfies TRPCRouterRecord;
