import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, sql } from "@commune-ts/db";
import {
  computedModuleWeightsSchema,
  moduleData,
  moduleReport,
  userModuleData,
} from "@commune-ts/db/schema";
import {
  MODULE_REPORT_INSERT_SCHEMA,
  USER_MODULE_DATA_INSERT_SCHEMA,
} from "@commune-ts/db/validation";

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
  byUserModuleData: publicProcedure
    .input(z.object({ userKey: z.string() }))
    .query(async ({ ctx, input }) => {
      // Query modules table joining it with user module data table and
      // filtering by userKey
      return await ctx.db
        .select()
        .from(moduleData)
        .innerJoin(userModuleData, eq(moduleData.id, userModuleData.moduleId))
        .where(eq(userModuleData.userKey, input.userKey))
        .execute();
    }),
  paginatedAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(50),
        sortBy: z
          .enum([
            "id",
            "emission",
            "incentive",
            "dividend",
            "delegationFee",
            "totalStakers",
            "totalStaked",
            "totalRewards",
            "createdAt",
          ])
          .default("id"),
        order: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sortBy, order } = input;
      const offset = (page - 1) * limit;

      const modules = await ctx.db.query.moduleData.findMany({
        limit: limit,
        offset: offset,
        orderBy: (moduleData, { asc, desc }) => [
          order === "asc" ? asc(moduleData[sortBy]) : desc(moduleData[sortBy]),
        ],
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
  byReport: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.moduleReport.findFirst({
        where: eq(moduleReport.id, input.id),
      });
    }),
  // POST
  deleteUserModuleData: publicProcedure
    .input(z.object({ userKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userModuleData)
        .where(eq(userModuleData.userKey, input.userKey));
    }),
  createUserModuleData: publicProcedure
    .input(USER_MODULE_DATA_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userModuleData).values({
        moduleId: input.moduleId,
        weight: input.weight,
        userKey: input.userKey,
      });
    }),
  createModuleReport: publicProcedure
    .input(MODULE_REPORT_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userKey = ctx.sessionData!.userKey;
      await ctx.db.insert(moduleReport).values({
        moduleId: input.moduleId,
        content: input.content,
        reason: input.reason,
        userKey,
      });
    }),
  allComputedModuleWeightsLastBlock: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        moduleName: moduleData.name,
        moduleId: computedModuleWeightsSchema.moduleId,
        stakeWeight: computedModuleWeightsSchema.stakeWeight,
        percWeight: computedModuleWeightsSchema.percWeight,
      })
      .from(computedModuleWeightsSchema)
      .where(
        sql`computed_module_weights.at_block = (SELECT MAX(computed_module_weights.at_block) FROM computed_module_weights)`,
      )
      .innerJoin(
        moduleData,
        eq(computedModuleWeightsSchema.moduleId, moduleData.id),
      );
  }),
} satisfies TRPCRouterRecord;
