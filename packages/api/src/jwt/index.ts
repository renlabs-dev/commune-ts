import { SessionDataSchema } from "./client";
import { SignedPayload, verifySignedData } from "./sign";
import * as jwt from "jsonwebtoken";

// Map<nonce, timestamp>
const seenNonces = new Map<string, number>();
let lastNonceCleanup = Date.now();

type TokenData = {
  userKey: string;
  uri: string;
};

const jwtOptions = (): jwt.SignOptions => ({
  algorithm: "HS256",
  issuer: "commune-ts",
  expiresIn: "6h",
});

export const createSessionToken = async (signedSessionData: SignedPayload) => {
  const { address, data } = verifySignedData(signedSessionData, SessionDataSchema);

  // check if the sessionData is not older than 10 minutes
  if (new Date(data.created).getTime() + 10 * 60 * 1000 < Date.now()) {
    throw new Error("Session data is too old");
  }

  if (seenNonces.has(data.nonce)) {
    throw new Error("Nonce has been used before");
  }

  // cleanup old nonces every hour
  if (lastNonceCleanup + 60 * 60 * 1000 < Date.now()) {
    for (const [nonce, timestamp] of seenNonces.entries()) {
      if (timestamp + 60 * 60 * 1000 < Date.now()) {
        seenNonces.delete(nonce);
      }
    }
    lastNonceCleanup = Date.now();
  }

  seenNonces.set(data.nonce, Date.now());

  const tokenData: TokenData = {
    userKey: address,
    uri: data.uri,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET!, jwtOptions());

  return token;
}

export const decodeJwtSessionToken = (token: string): { userKey: string } => {
  const { userKey } = jwt.verify(token, process.env.JWT_SECRET!, jwtOptions()) as TokenData;

  return { userKey };
}
