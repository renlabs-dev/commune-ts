import { hexToString, stringToHex } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";
import { z } from "zod";

export const SignedPayloadSchema = z.object({
  payload: z.string({ description: "in hex" }),
  signature: z.string({ description: "in hex" }),
  address: z.string({ description: "in hex" }),
});

export type SignedPayload = z.infer<typeof SignedPayloadSchema>;

export const signData = async <T>(
  signer: (
    msgHex: `0x${string}`,
  ) => Promise<{ signature: `0x${string}`; address: string }>,
  data: T,
): Promise<SignedPayload> => {
  const dataHex = stringToHex(JSON.stringify(data));
  const { signature, address } = await signer(dataHex);
  return {
    payload: dataHex,
    signature,
    address,
  };
};

export const verifySignedData = <T extends z.ZodTypeAny>(
  signedInput: SignedPayload,
  dataSchema: T,
): { data: z.infer<T>; address: string } => {
  const { payload, signature, address } = signedInput;
  const result = signatureVerify(payload, signature, address);
  if (!result.isValid) {
    throw new Error("Invalid signature");
  }
  const unmarshed = JSON.parse(hexToString(payload));
  const validated = dataSchema.safeParse(unmarshed);
  if (!validated.success) {
    throw new Error(`Invalid payload: ${validated.error.message}`);
  }
  return { data: validated.data, address };
};
