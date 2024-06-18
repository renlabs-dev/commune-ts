"use client";

import { WalletButton } from "@repo/ui/wallet-button";
import { useCommune } from "../context/commune";

export function WalletButtonWithHook(): JSX.Element {
  const context = useCommune();
  return <WalletButton hook={context} />;
}
