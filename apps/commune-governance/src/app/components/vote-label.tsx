import { Label } from "./label";

export type Vote = "FAVORABLE" | "AGAINST" | "UNVOTED";

interface VoteLabelProps {
  vote: Vote;
}

export function VoteLabel(props: VoteLabelProps): JSX.Element {
  const { vote } = props;

  const votingStatus = {
    UNVOTED: (
      <Label className="border border-gray-500 text-gray-500 opacity-70">
        Unvoted
      </Label>
    ),
    FAVORABLE: (
      <Label className="border border-green-500 bg-green-500/10 text-green-500">
        Favorable
      </Label>
    ),
    AGAINST: (
      <Label className="border border-red-500 bg-red-500/10 text-red-500">
        Against
      </Label>
    ),
  };

  return votingStatus[vote];
}
