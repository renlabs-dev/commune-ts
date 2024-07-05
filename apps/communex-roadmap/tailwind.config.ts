import type { Config } from "tailwindcss";

import baseConfig from "@commune-ts/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {},
    boxShadow: {
      "custom-green": "0px 0px 12px 0 rgba(34, 197, 94, 0.90)",
      "custom-white": "0px 0px 12px 0 rgba(255, 255, 255, 0.90)",
      "custom-gray": "0px 0px 12px 0 rgba(156, 163, 175, 0.90)",
    },
  },
} satisfies Config;
