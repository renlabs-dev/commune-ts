"use server";

import { hexToString, stringToHex } from "@polkadot/util";
import { signatureVerify, cryptoWaitReady } from "@polkadot/util-crypto";

import type { SignedPayload } from "@commune-ts/types";
import { SessionDataSchema } from "@commune-ts/types";

export const signData = async <T>(
  signer: (
    msgHex: `0x${string}`,
  ) => Promise<{ signature: `0x${string}`; address: string }>,
  data: T,
): Promise<SignedPayload> => {
  await cryptoWaitReady();

  const dataHex = stringToHex(JSON.stringify(data));
  const { signature, address } = await signer(dataHex);
  return {
    payload: dataHex,
    signature,
    address,
  };
};

export const verifySignedData = async (signedInput: SignedPayload) => {
  await cryptoWaitReady();

  const { payload, signature, address } = signedInput;

  const result = signatureVerify(payload, signature, address);
  if (!result.isValid) {
    throw new Error("Invalid signature");
  }

  const unmarshed = JSON.parse(hexToString(payload));
  const validated = SessionDataSchema.safeParse(unmarshed);
  if (!validated.success) {
    throw new Error(`Invalid payload: ${validated.error.message}`);
  }
  return { data: validated.data, address };
};
