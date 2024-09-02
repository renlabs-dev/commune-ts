import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, InferSelectModel, sql } from "@commune-ts/db";

import { SignedDataSchema } from "../auth/signed-data";
import { createSessionToken } from "../jwt";
import { SessionDataSchema } from "../jwt/client";
import { publicProcedure } from "../trpc";

export enum SignedEndpoint {
  StartSession = "StartSession",
}

export const SignedEndpointDataSchema = {
  [SignedEndpoint.StartSession]: SessionDataSchema,
};

export const authRouter = {
  startSession: publicProcedure
    .input(SignedDataSchema)
    .mutation(async ({ ctx, input }) => {
      const token = await createSessionToken(input);
      // TODO: somehow check that the userKey is an valid commune/substrate address

      return { token, authenticationType: "Bearer" };
    }),
} satisfies TRPCRouterRecord;
