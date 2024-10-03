import type { TRPCRouterRecord } from "@trpc/server";

import { SignedPayloadSchema } from "@commune-ts/types";

import { createSessionToken } from "../jwt";
import { publicProcedure } from "../trpc";

export const authRouter = {
  startSession: publicProcedure
    .input(SignedPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: verify signed payload
      const token = await createSessionToken(input, ctx.jwtSecret);

      return { token, authenticationType: "Bearer" };
    }),
} satisfies TRPCRouterRecord;
