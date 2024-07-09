import { Label } from "./label";

export type Vote = "FAVORABLE" | "AGAINST" | "UNVOTED";

interface VoteLabelProps {
  vote: Vote;
}

export function VoteLabel(props: VoteLabelProps): JSX.Element {
  const { vote } = props;

  const votingStatus = {
    UNVOTED: <>{ }</>,
    FAVORABLE: (
      <Label className="text-green-500 border border-green-500 bg-green-500/10">
        Favorable
      </Label>
    ),
    AGAINST: (
      <Label className="text-red-500 border border-red-500 bg-red-500/10">Against</Label>
    ),
  };

  return votingStatus[vote || "UNVOTED"];
}
