import { WsProvider } from "@polkadot/api";
import { queryLastBlock, queryDaosEntries, queryValidators, ApiPromise, queryRegisteredModulesInfo } from '@commune-ts/subspace/queries';
import { isSS58, type LastBlock, type SubspaceModule, type SubspaceModuleProperty } from "@commune-ts/subspace/types";


const wsEndpoint = process.env.NEXT_PUBLIC_WS_PROVIDER_URL

console.log("Connecting to", wsEndpoint);

const provider = new WsProvider(wsEndpoint);
const api = await ApiPromise.create({ provider });

const lastBlock: LastBlock = await queryLastBlock(api);

// // console.log(lastBlock.blockHeader.number.toString());
// console.log(lastBlock.blockHeader);

// // console.log(lastBlock.apiAtBlock.registry.getDefinition());

// const daos = await queryDaosEntries(lastBlock.apiAtBlock);

// console.log(daos);

// // console.log("Proposals", await queryProposalsEntries(newApi));

// process.exit(0);

async function main () {
    // Create our API with a default connection to the local node
    // const api = await ApiPromise.create();
    // console.log(lastBlock.apiAtBlock.query.session)

    // const names = await lastBlock.apiAtBlock.query.subspaceModule.name?.entriesPaged({pageSize: 256});
    // const names = await lastBlock.apiAtBlock.query.subspaceModule.name?.entries();

    // const namesP = await lastBlock.apiAtBlock.query.subspaceModule.name?.entriesPaged({pageSize: 256, args: []}) ?? [];

    // const names = await lastBlock.apiAtBlock.query.subspaceModule.name?.entries() ?? [];

    // for (let i = 0; i < namesP.length; i++) {
    //     // console.log(namesP[i][0].toHex(), names[i][1].toHuman())
    //     if (namesP[i][1].toHuman() !== names[i][1].toHuman()) {
    //         console.log("DIFFERENT")
    //     }
    //     if (namesP[i][0].toHex() !== names[i][0].toHex()) {
    //         console.log("DIFFERENT")
    //     }
    // }

    function toHuman(x: SubspaceModule) {

        function propToHuman(prop: SubspaceModule[keyof SubspaceModule]) {
            if (typeof prop === "number") {
                return prop;
            }
            if (Array.isArray(prop)) {
                const tuple = prop[0].args

                return [
                    // tuple.map((x) => x.toHuman()).join(", "),
                    tuple.map((x) => x.toPrimitive()).join(", "),
                    // tuple.map((x) => typeof x.toHuman()).join(", "),
                    // tuple.map((x) => typeof x.toPrimitive()).join(", "),
                    tuple.map((x) => isSS58(x.toPrimitive())).join(", "),
                ].join(" | ");
                // if (prop[1].toHuman) {
                //     return `${prop[0].toHuman()} | ${prop[1].toHuman()}`;
                // }
                // return `${prop[0].toHuman()} | ${prop[1].toPrimitive()}`;
            }
            return prop;
        }
        return Object.keys(x).map((k) => `${k}: ${propToHuman(x[k])}`).join("\n");
    }

    const results = await queryRegisteredModulesInfo(lastBlock.apiAtBlock, [
        "stakeFrom",
        "keys",
        "name",
        "address",
        // "registrationBlock",
        // 'delegationFee',
        // 'emission',
        // 'incentive',
        // "dividends",
        // 'lastUpdate',
        "metadata"
    ]);


    results.slice(0, 20).forEach((x) => console.log(toHuman(x), "\n"));


    // Retrieve a snapshot of the validators
    // (all active & waiting based on ValidatorPrefs storage)
    // const validatorKeys = await lastBlock.apiAtBlock.query.staking.validators.keys();

    // Subscribe to the balances for these accounts
    // const unsub = await lastBlock.apiAtBlock.query.balances.account.multi(validatorKeys, (balances) => {
    // console.log(`The nonce and free balances are: ${balances.map(([nonce, { free }]) => [nonce, free])}`);
    // });

    // console.log("done")

    // for (let i = 0; i < 256; i++) {
    //     console.log(names[i][1].toHuman())
    // }
    // console.log(names?.length)
  
    // Make our basic chain state/storage queries, all in one go
    // const [ now, validators] = await Promise.all([
    //     lastBlock.apiAtBlock.query.timestamp.now(),
    //     queryValidators(lastBlock.apiAtBlock)
    // ]);

  
    // console.log(`last block timestamp ${now.toNumber()}`);

    // console.log(`validators ${validators}`);
  
    // if (validators?.length > 0) {
    //   // Retrieve the balances for all validators
    //   const validatorBalances = await Promise.all(
    //     validators.map((authorityId) =>
    //       api.query.system.account(authorityId)
    //     )
    //   );
  
    //   // Print out the authorityIds and balances of all validators
    //   console.log('validators', validators.map((authorityId, index) => ({
    //     address: authorityId.toString(),
    //     balance: validatorBalances[index]?.data.free.toHuman(),
    //     nonce: validatorBalances[index]?.nonce.toHuman()
    //   })));
    // }
  }
  
  main().catch(console.error).finally(() => process.exit());