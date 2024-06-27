import type { Config } from "tailwindcss";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {
    extend: {
      colors: {
        "section-gray": "rgba(137, 137, 137, 0.05)",
        "section-stroke": "rgba(255, 255, 255, 0.1)",
      },
    },
  },
} satisfies Config;
