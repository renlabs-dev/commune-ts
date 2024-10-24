import axios from "axios";

import type { DaoApplications, GovernanceModeType } from "@commune-ts/types";
import {
  buildIpfsGatewayUrl,
  flattenResult,
  parseIpfsUri,
  processDaoMetadata,
} from "@commune-ts/subspace/utils";

import type { WorkerProps } from "../common";
import type { NewNotification } from "../db";
import { getApplications } from "../common";
import { addSeenProposal, getProposalIdsByType } from "../db";

export async function notifyNewApplicationsWorker(props: WorkerProps) {
  async function pushNotification(proposal: DaoApplications) {
    const r = parseIpfsUri(proposal.data);
    const cid = flattenResult(r);
    if (cid === null) {
      console.log(`Failed to parse ${proposal.id} cid`);
    } else {
      const url = buildIpfsGatewayUrl(cid); // this is wrong
      const metadata = await processDaoMetadata(url, proposal.id);
      const resolved_metadata = flattenResult(metadata);
      // shadowheart
      if (resolved_metadata === null) {
        console.log(`Failed to get metadata on proposal ${proposal.id}`);
      } else {
        const notification = {
          discord_uid: `${resolved_metadata.discord_id}`,
          app_id: `${proposal.id}`,
          application_url: `https://governance.communeai.org/dao/${proposal.id}`,
        };
        const headers = {
          "X-token": process.env.DISCORD_API_TOKEN,
        };
        const seen_proposal: NewNotification = {
          governanceModel: p_type,
          proposalId: proposal.id,
        };
        await axios
          .post(`${process.env.DISCORD_API_ENDPOINT}`, notification, {
            headers,
          })
          .then(async function (response) {
            console.log(response);
            await addSeenProposal(seen_proposal);
          })
          .catch((reason) => console.log(`Reject bc ${reason}`));
        console.log("pushed notification"); // actually to call the discord endpoint and etc
        return;
      }
    }
    return;
  }
  const pending_apps = Object.values(
    await getApplications(props.api, ["Pending"]),
  );
  const p_type: GovernanceModeType = "DAO";
  const proposals = await getProposalIdsByType(p_type);
  const proposalsSet: Set<number> = new Set<number>(proposals);
  const unseen_proposals = pending_apps.filter(
    (application) => !proposalsSet.has(application.id),
  );
  const notifications_promises = unseen_proposals.map(pushNotification);
  Promise.all(notifications_promises).catch((error) =>
    console.log(`Failed to notify proposal for reason: ${error}`),
  );
}
