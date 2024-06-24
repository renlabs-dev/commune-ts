import { moduleRouter } from "./router/module";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  module: moduleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
