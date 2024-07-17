import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, sql } from "@commune-ts/db";
import {
  moduleData,
  moduleReport,
  moduleReportPostSchema,
  userModuleData,
  userModuleDataPostSchema,
} from "@commune-ts/db/schema";

import { publicProcedure } from "../trpc";

export const moduleRouter = {
  // GET
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.moduleData.findMany();
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.moduleData.findFirst({
        where: eq(moduleData.id, input.id),
      });
    }),
  paginatedAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const modules = await ctx.db.query.moduleData.findMany({
        limit: limit,
        offset: offset,
        orderBy: (moduleData, { asc }) => [asc(moduleData.id)],
      });

      const totalCount = await ctx.db
        .select({ count: sql`count(*)` })
        .from(moduleData)
        .then((result) => Number(result[0]?.count));

      return {
        modules,
        metadata: {
          currentPage: page,
          pageSize: limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),
  // allModuleWeight: publicProcedure.query(async ({ ctx }) => {
  //   const result = await ctx.db
  //     .select({
  //       userKey: userModuleData.userKey,
  //       moduleId: userModuleData.moduleId,
  //       weight: userModuleData.weight,
  //     })
  //     .from(moduleData)
  //     .where(
  //       eq(
  //         moduleData.atBlock,
  //         sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
  //       ),
  //     )
  //     .innerJoin(
  //       userModuleData,
  //       eq(moduleData.moduleKey, userModuleData.moduleId),
  //     );

  //   // user -> module key -> weight (0–100)
  //   const userWeightMap = new Map<string, Map<number, bigint>>();
  //   result.forEach((entry) => {
  //     if (!userWeightMap.has(entry.userKey)) {
  //       userWeightMap.set(entry.userKey, new Map<number, bigint>());
  //     }
  //     userWeightMap.get(entry.userKey)!.set(entry.moduleId, entry.weight);
  //   });
  //   return userWeightMap;
  // }),
  // POST
  deleteUserModuleData: publicProcedure
    .input(z.object({ userKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userModuleData)
        .where(eq(userModuleData.userKey, input.userKey));
    }),
  createUserModuleData: publicProcedure
    .input(userModuleDataPostSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userModuleData).values({
        moduleId: input.moduleId,
        userKey: input.userKey,
        weight: input.weight,
      });
    }),
  createModuleReport: publicProcedure
    .input(moduleReportPostSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(moduleReport).values({
        moduleId: input.moduleId,
        userKey: input.userKey,
        content: input.content,
        reason: input.reason,
      });
    }),
} satisfies TRPCRouterRecord;
