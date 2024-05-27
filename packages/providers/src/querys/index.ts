import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { formatToken, parseDaos } from "../utils";
import { type DaoApplications } from "../types";

// == Balance ==

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

// == S0 Applications ==

export async function getDaoApplications(
  api: ApiPromise
): Promise<DaoApplications[]> {
  const daosRaw = await api.query.subspaceModule.curatorApplications.entries();

  const daos = [];
  for (const daoItem of daosRaw) {
    const [, valueRaw] = daoItem;
    const dao = parseDaos(valueRaw);
    if (dao === null) throw new Error("Invalid DAO");
    daos.push(dao);
  }

  daos.reverse();
  return daos;
}

export async function getGlobalDaoTreasury(api: ApiPromise): Promise<string> {
  const result = await api.query.subspaceModule.globalDaoTreasury();
  return formatToken(Number(JSON.stringify(result)));
}
