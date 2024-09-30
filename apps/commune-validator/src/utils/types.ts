import type { inferProcedureOutput } from "@trpc/server";

import type { AppRouter } from "@commune-ts/api";

export type Subnet = NonNullable<
  inferProcedureOutput<AppRouter["subnet"]["byId"]>
>;
