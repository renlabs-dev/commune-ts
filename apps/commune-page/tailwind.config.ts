// tailwind config is required for editor support
import type { Config } from 'tailwindcss'

import sharedConfig from "@repo/tailwind-config";

const config: Pick<Config, "content" | "presets" | "theme"> = {
  content: ["./src/app/**/*.tsx"],
  presets: [sharedConfig],
  theme: {
    extend: {
      boxShadow: {
        'custom-dark': '3px 3px 0 0 rgba(255,255,255,1)',
      },
    },
  },
};

export default config;
