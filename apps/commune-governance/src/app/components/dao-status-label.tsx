import { Label } from "./label";

export type DaoStatus = "Pending" | "Accepted" | "Refused";

interface StatusLabelProps {
  result: DaoStatus;
  className?: string;
}

export const DaoStatusLabel = (props: StatusLabelProps): JSX.Element => {
  const { result, className = "" } = props;
  const votingStatus = {
    Pending: (
      <Label
        className={`w-auto border py-1.5 text-center border-yellow-500 bg-yellow-500/10 text-yellow-500 lg:text-left ${className}`}
      >
        Active
      </Label>
    ),
    Accepted: (
      <Label
        className={`w-auto border border-green-500 py-1.5 text-center text-green-500 bg-green-500/10 lg:text-left ${className}`}
      >
        Accepted
      </Label>
    ),
    Refused: (
      <Label
        className={`w-auto border border-red-500 py-1.5 text-center text-red-500 bg-red-500/10 lg:text-left ${className}`}
      >
        Refused
      </Label>
    ),
  };
  return votingStatus[result ?? "Pending"];
};
