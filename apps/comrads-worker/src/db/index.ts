import type { SQL, Table } from "@commune-ts/db";
import type { SubspaceModule } from "@commune-ts/types";
import { getTableColumns, sql } from "@commune-ts/db";
import { db } from "@commune-ts/db/client";
import {
  cadreSchema,
  daoVoteSchema,
  DaoVoteType,
  moduleData,
} from "@commune-ts/db/schema";

export async function upsertModuleData(
  modules: SubspaceModule[],
  atBlock: number,
) {
  await db
    .insert(moduleData)
    .values(
      modules.map((m) => ({
        netuid: m.netuid,
        moduleKey: m.key,
        name: m.name,
        atBlock,
        addressUri: m.address,
        metadataUri: m.metadata,
        registrationBlock: m.registrationBlock,
      })),
    )
    .onConflictDoUpdate({
      target: [moduleData.netuid, moduleData.moduleKey],
      set: buildConflictUpdateColumns(moduleData, [
        "atBlock",
        "addressUri",
        "metadataUri",
        "registrationBlock",
        "name",
      ]),
    })
    .execute();
}

export async function computeTotalVotesPerDao(): Promise<
  {
    daoId: number;
    acceptVotes: number;
    refuseVotes: number;
    removeVotes: number;
  }[]
> {
  const result = await db
    .select({
      daoId: daoVoteSchema.daoId,
      acceptVotes:
        sql`count(case when ${daoVoteSchema.daoVoteType} = ${DaoVoteType.ACCEPT} then 1 end)`.as<number>(),
      refuseVotes:
        sql`count(case when ${daoVoteSchema.daoVoteType} = ${DaoVoteType.REFUSE} then 1 end)`.as<number>(),
      removeVotes:
        sql`count(case when ${daoVoteSchema.daoVoteType} = ${DaoVoteType.REMOVE} then 1 end)`.as<number>(),
    })
    .from(daoVoteSchema)
    .where(sql`${daoVoteSchema.deletedAt} is null`)
    .groupBy(daoVoteSchema.daoId)
    .execute();

  return result;
}

export async function countCadreKeys(): Promise<number> {
  const result = await db
    .select({
      count: sql`count(*)`.as<number>(),
    })
    .from(cadreSchema)
    .where(sql`${cadreSchema.deletedAt} is null`)
    .execute();

  return result[0].count;
}

// util for upsert https://orm.drizzle.team/learn/guides/upsert#postgresql-and-sqlite
function buildConflictUpdateColumns<
  T extends Table,
  Q extends keyof T["_"]["columns"],
>(table: T, columns: Q[]): Record<Q, SQL> {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
}
