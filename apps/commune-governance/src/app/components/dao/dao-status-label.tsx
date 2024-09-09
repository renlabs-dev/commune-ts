import type { DaoApplicationStatus } from "@commune-ts/types";

import { Label } from "../label";

interface StatusLabelProps {
  daoStatus: DaoApplicationStatus;
}

export const DaoStatusLabel = (props: StatusLabelProps): JSX.Element => {
  const { daoStatus } = props;
  const votingStatus = {
    Pending: (
      <Label className="w-auto border border-yellow-500 bg-yellow-500/10 py-1.5 text-center text-yellow-500 lg:text-left">
        Active
      </Label>
    ),
    Accepted: (
      <Label className="w-auto border border-green-500 bg-green-500/10 py-1.5 text-center text-green-500 lg:text-left">
        Accepted
      </Label>
    ),
    Refused: (
      <Label className="w-auto border border-red-500 bg-red-500/10 py-1.5 text-center text-red-500 lg:text-left">
        Refused
      </Label>
    ),
    Removed: (
      <Label className="w-auto border border-rose-500 bg-rose-500/10 py-1.5 text-center text-rose-500 lg:text-left">
        Removed
      </Label>
    ),
  };
  return votingStatus[daoStatus];
};
