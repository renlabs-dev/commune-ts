import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Pick<Config, "presets" | "content"> = {
  content: ["./src/**/*.tsx"],
  // prefix: "ui-",
  presets: [sharedConfig],
};

export default config;
