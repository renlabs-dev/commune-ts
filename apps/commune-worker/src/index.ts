import { WsProvider } from "@polkadot/api";
import { queryLastBlock, ApiPromise, queryRegisteredModulesInfo } from '@commune-ts/subspace/queries';
import { Codec, isSS58, type LastBlock } from "@commune-ts/subspace/types";
import { SQL, PgTable, getTableColumns, sql } from '@commune-ts/db';
import { db } from '@commune-ts/db/client';
import { moduleData } from '@commune-ts/db/schema';


const wsEndpoint = process.env.NEXT_PUBLIC_WS_PROVIDER_URL

console.log("Connecting to ", wsEndpoint);

const provider = new WsProvider(wsEndpoint);
const api = await ApiPromise.create({ provider });

const lastBlock: LastBlock = await queryLastBlock(api);

async function main () {
    const NETUID_ZERO = 0;

    const results = await queryRegisteredModulesInfo(lastBlock.apiAtBlock, [
        "name",
        "address",
        "metadata",
        "registrationBlock",
    ], [NETUID_ZERO]);

    console.log(`Block ${lastBlock.blockNumber}: ${results.length} modules registered`);

    await db.transaction(async (db) => {
        await db.insert(moduleData).values(results.map(m => ({
            netuid: m.netuid,
            moduleKey: m.key,
            name: m.name,
            atBlock: lastBlock.blockNumber,
            addressUri: m.address,
            metadataUri: m.metadata,
            registrationBlock: m.registrationBlock
        }))).onConflictDoUpdate({
            target: [moduleData.netuid, moduleData.moduleKey],
            set: buildConflictUpdateColumns(moduleData, ["atBlock", "addressUri", "metadataUri", "registrationBlock", "name"])
        }).execute();
    });
  }
  
  main().catch(console.error).finally(() => process.exit());


// util for upsert https://orm.drizzle.team/learn/guides/upsert#postgresql-and-sqlite
function buildConflictUpdateColumns<T extends PgTable, Q extends keyof T['_']['columns']>(
    table: T,
    columns: Q[],
): Record<Q, SQL>{
    const cls = getTableColumns(table);
    return columns.reduce((acc, column) => {
    const colName = cls[column]!.name;
    acc[column] = sql.raw(`excluded.${colName}`);
    return acc;
    }, {} as Record<Q, SQL>);
};