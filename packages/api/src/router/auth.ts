import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, InferSelectModel, sql } from "@commune-ts/db";

import { publicProcedure } from "../trpc";
import { SessionDataSchema } from "../jwt/client";
import { createSessionToken } from "../jwt";
import { SignedDataSchema } from "../auth/signed-data";

export enum SignedEndpoint {
  StartSession = "StartSession",
}

export const SignedEndpointDataSchema = {
  [SignedEndpoint.StartSession]: SessionDataSchema,
};

export const moduleRouter = {
  startSession: publicProcedure
    .input(SignedDataSchema)
    .mutation(async ({ ctx, input }) => {
      const token = createSessionToken(input);
      // TODO: somehow check that the userKey is an valid commune/substrate address

      return { token, authenticationType: "Bearer" };
    }),
} satisfies TRPCRouterRecord;
