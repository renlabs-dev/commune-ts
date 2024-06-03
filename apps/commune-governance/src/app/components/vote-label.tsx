import { Label } from "./label";

export type Vote = "FAVORABLE" | "AGAINST" | "UNVOTED";

interface VoteLabelProps {
  vote: Vote;
}

export function VoteLabel(props: VoteLabelProps): JSX.Element {
  const { vote } = props;

  const votingStatus = {
    UNVOTED: <>{}</>,
    FAVORABLE: (
      <Label className="border border-green-500 text-green-500">
        Favorable
      </Label>
    ),
    AGAINST: (
      <Label className="border border-red-500 text-red-500">Against</Label>
    ),
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return votingStatus[vote || "UNVOTED"];
}
