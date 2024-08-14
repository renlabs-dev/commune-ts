import { randomBytes } from "crypto";
import { z } from "zod";

export { signData } from "./sign";

export const SessionDataSchema = z.object({
  statement: z.string(), // "Sign in with polkadot extension to authenticate your session"
  uri: z.string(), // origin or "unknown"
  nonce: z.string(), // base64 randomstring
  created: z.string().datetime(), // ISO date string
});

export type SessionData = z.infer<typeof SessionDataSchema>;  

export function createSessionData(window: { location: { origin: string }}): SessionData {
  return {
    statement: "Sign in with polkadot extension to authenticate your session",
    uri: window.location.origin || "unknown",
    nonce: randomBytes(16).toString('base64'),
    created: new Date().toISOString(),
  };
}
