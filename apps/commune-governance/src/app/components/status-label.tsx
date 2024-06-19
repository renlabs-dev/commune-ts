import { match } from "rustie";
import type { ProposalStatus } from "@repo/providers/types";
import { Label } from "./label";

interface StatusLabelProps {
  result: ProposalStatus;
  className?: string;
}

export function StatusLabel(props: StatusLabelProps): JSX.Element {
  const { result, className = "" } = props;

  return match(result)({
    open() {
      return (
        <Label
          className={`w-auto border py-1.5 text-center text-white lg:text-left ${className}`}
        >
          Active
        </Label>
      );
    },
    accepted() {
      return (
        <Label
          className={`w-auto border border-green-500 py-1.5 text-center text-green-500 lg:text-left ${className}`}
        >
          Accepted
        </Label>
      );
    },
    expired() {
      return (
        <Label
          className={`w-auto border border-gray-500 py-1.5 text-center text-gray-500 lg:text-left ${className}`}
        >
          Expired
        </Label>
      );
    },
    refused() {
      return (
        <Label
          className={`w-auto border border-red-500 py-1.5 text-center text-red-500 lg:text-left ${className}`}
        >
          Refused
        </Label>
      );
    },
  });
}
