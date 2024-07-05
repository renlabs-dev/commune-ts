import type { Config } from "tailwindcss";
import animate from "tailwindcss-animated";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {},
  plugins: [animate],
} satisfies Config;
