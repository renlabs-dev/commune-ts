import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@commune-ts/db";
import { subnetDataSchema, userSubnetDataSchema } from "@commune-ts/db/schema";
import { USER_SUBNET_DATA_INSERT_SCHEMA } from "@commune-ts/db/validation";

import { publicProcedure } from "../trpc";

export const subnetRouter = {
  // GET
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.subnetDataSchema.findMany();
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.subnetDataSchema.findFirst({
        where: eq(subnetDataSchema.id, input.id),
      });
    }),
  byUserSubnetData: publicProcedure
    .input(z.object({ userKey: z.string() }))
    .query(async ({ ctx, input }) => {
      // Query subnets table joining it with user subnet data table and
      // filtering by userKey
      return await ctx.db
        .select()
        .from(subnetDataSchema)
        .innerJoin(
          userSubnetDataSchema,
          eq(subnetDataSchema.id, userSubnetDataSchema.netuid),
        )
        .where(eq(userSubnetDataSchema.userKey, input.userKey))
        .execute();
    }),
  // POST
  deleteUserSubnetData: publicProcedure
    .input(z.object({ userKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userSubnetDataSchema)
        .where(eq(userSubnetDataSchema.userKey, input.userKey));
    }),
  createUserSubnetData: publicProcedure
    .input(USER_SUBNET_DATA_INSERT_SCHEMA)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userSubnetDataSchema)
        .values({
          netuid: input.netuid,
          userKey: input.userKey,
          weight: input.weight,
        })
        .onConflictDoUpdate({
          target: [userSubnetDataSchema.userKey, userSubnetDataSchema.netuid],
          set: { weight: input.weight },
        });
    }),
} satisfies TRPCRouterRecord;
