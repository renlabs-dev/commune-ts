import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../trpc";

export const moduleRouter = {
  allUserModuleData: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.userModuleData.findMany();
  }),
} satisfies TRPCRouterRecord;
