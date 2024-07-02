import { moduleRouter } from "./router/module";
import { moduleTestRouter } from "./router/module-test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  moduleTest: moduleTestRouter,
  module: moduleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
