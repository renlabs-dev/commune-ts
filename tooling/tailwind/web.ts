import type { Config } from "tailwindcss";
import animate from "tailwindcss-animated";

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
      animation: {
        "fade-in-down": "fade-in-down 0.6s ease-in-out",
      },
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
