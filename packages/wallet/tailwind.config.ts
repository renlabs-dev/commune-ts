/*
 * This file is not used for any compilation purpose, it is only used
 * for Tailwind Intellisense & Autocompletion in the source files
 */
import { type Config } from "tailwindcss";

import baseConfig from "@commune-ts/tailwind-config/web";

export const config: Pick<Config, "content" | "presets"> = {
  content: [...baseConfig.content, "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
