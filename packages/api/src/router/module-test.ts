import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../trpc";

export const moduleTestRouter = {
  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.moduleTest.findFirst({
      orderBy: (weight, { desc }) => [desc(weight.createdAt)],
    });
  }),
  // create: publicProcedure
  //   .input(moduleTestPostSchema)
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.insert(moduleTest).values(input);
  //   }),
} satisfies TRPCRouterRecord;
