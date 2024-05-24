import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  presets: [sharedConfig],
};

export default config;
