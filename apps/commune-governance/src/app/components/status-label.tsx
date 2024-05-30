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
        className={`border text-white text-center lg:text-left py-1.5 w-auto ${className}`}
      >
        Active
      </Label>
    ),
    Accepted: (
      <Label
        className={`border-green-500 border text-center text-green-500 lg:text-left py-1.5 w-auto ${className}`}
      >
        Accepted
      </Label>
    ),
    Refused: (
      <Label
        className={`border-red-500 border text-center text-red-500 lg:text-left py-1.5 w-auto ${className}`}
      >
        Refused
      </Label>
    ),
    Expired: (
      <Label
        className={`border-gray-500 border text-center text-gray-500 lg:text-left py-1.5 w-auto ${className}`}
      >
        Expired
      </Label>
    ),
  };
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return votingStatus[result ?? "Pending"];
}
