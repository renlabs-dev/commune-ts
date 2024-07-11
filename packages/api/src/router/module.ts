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
  allModuleWeight: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        userKey: userModuleData.userKey,
        moduleKey: userModuleData.moduleKey,
        weight: userModuleData.weight,
      })
      .from(moduleData)
      .where(
        eq(
          moduleData.atBlock,
          sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
        ),
      )
      .innerJoin(
        userModuleData,
        eq(moduleData.moduleKey, userModuleData.moduleKey),
      );

    // user -> module key -> weight (0–100)
    const userWeightMap = new Map<string, Map<string, bigint>>();
    result.forEach((entry) => {
      if (!userWeightMap.has(entry.userKey)) {
        userWeightMap.set(entry.userKey, new Map<string, bigint>());
      }
      userWeightMap
        .get(entry.userKey)!
        .set(entry.moduleKey!, BigInt(entry.weight!));
    });
    return userWeightMap;
  }),
  // POST
  createUserModuleData: publicProcedure
    .input(userModuleDataPostSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userModuleData).values({
        moduleKey: input.moduleKey,
        userKey: input.userKey,
        weight: input.weight,
      });
    }),
  createModuleReport: publicProcedure
    .input(moduleReportPostSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(moduleReport).values({
        moduleKey: input.moduleKey,
        userKey: input.userKey,
        content: input.content,
        reason: input.reason,
      });
    }),
} satisfies TRPCRouterRecord;
