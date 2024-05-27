import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { formatToken } from "../utils";

export async function getBalance({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}): Promise<string> {
  const {
    data: {
      free,
      // reserved
    },
  } = await api.query.system.account(address);

  const balanceNum = Number(free);
  return formatToken(balanceNum);
}
