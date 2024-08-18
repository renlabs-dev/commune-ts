import type { Config } from "tailwindcss";

import baseConfig from "@commune-ts/tailwind-config/web";
import typography from "@tailwindcss/typography";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig, typography],
  theme: {},
} satisfies Config;
