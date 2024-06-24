import baseConfig, { restrictEnvAccess } from "@commune-ts/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
    strictNullChecks,
  },
  ...baseConfig,
  ...restrictEnvAccess,
];
