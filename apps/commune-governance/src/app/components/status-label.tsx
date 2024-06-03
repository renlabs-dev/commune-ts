import { Label } from "./label";

interface StatusLabelProps {
  result: "Pending" | "Accepted" | "Refused" | "Expired";
  className?: string;
}

export function StatusLabel(props: StatusLabelProps): JSX.Element {
  const { result, className = "" } = props;
  const votingStatus = {
    Pending: (
      <Label
        className={`w-auto border py-1.5 text-center text-white lg:text-left ${className}`}
      >
        Active
      </Label>
    ),
    Accepted: (
      <Label
        className={`w-auto border border-green-500 py-1.5 text-center text-green-500 lg:text-left ${className}`}
      >
        Accepted
      </Label>
    ),
    Refused: (
      <Label
        className={`w-auto border border-red-500 py-1.5 text-center text-red-500 lg:text-left ${className}`}
      >
        Refused
      </Label>
    ),
    Expired: (
      <Label
        className={`w-auto border border-gray-500 py-1.5 text-center text-gray-500 lg:text-left ${className}`}
      >
        Expired
      </Label>
    ),
  };
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return votingStatus[result ?? "Pending"];
}
