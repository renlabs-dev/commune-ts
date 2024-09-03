import { match } from "rustie";

import type { ProposalData } from "@commune-ts/types";

import { Label } from "../label";

interface ProposalTypeLabelProps {
  result: ProposalData;
}

export function ProposalTypeLabel(props: ProposalTypeLabelProps): JSX.Element {
  const { result } = props;
  return match(result)({
    globalCustom() {
      return (
        <Label
          className={`w-auto border border-emerald-500 bg-emerald-500/10 py-1.5 text-center text-emerald-500 lg:text-left`}
        >
          Global Custom
        </Label>
      );
    },
    globalParams() {
      return (
        <Label
          className={`w-auto border border-blue-500 bg-blue-500/10 py-1.5 text-center  text-blue-500 lg:text-left`}
        >
          Global Params
        </Label>
      );
    },
    subnetCustom() {
      return (
        <Label
          className={`w-auto border border-sky-500 bg-sky-500/10 py-1.5 text-center text-sky-500 lg:text-left`}
        >
          Subnet Custom
        </Label>
      );
    },
    subnetParams() {
      return (
        <Label
          className={`w-auto border border-cyan-500 bg-cyan-500/10 py-1.5 text-center text-cyan-500 lg:text-left`}
        >
          Subnet Params
        </Label>
      );
    },
    transferDaoTreasury() {
      return (
        <Label
          className={`w-auto border border-teal-500 bg-teal-500/10 py-1.5 text-center text-teal-500 lg:text-left`}
        >
          Transfer DAO Treasury
        </Label>
      );
    },
  });
}
