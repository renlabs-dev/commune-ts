import type { ApiPromise, LastBlock } from "@commune-ts/types";

export interface WorkerProps {
  lastBlockNumber: number;
  lastBlock: LastBlock;
  api: ApiPromise;
}
