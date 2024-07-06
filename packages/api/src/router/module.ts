import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@commune-ts/db";
import { module } from "@commune-ts/db/schema";

import { publicProcedure } from "../trpc";

export const moduleRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.module.findMany();
  }),
  byId: publicProcedure
    .input(z.object({ uid: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.module.findFirst({
        where: eq(module.uid, input.uid),
      });
    }),
} satisfies TRPCRouterRecord;
