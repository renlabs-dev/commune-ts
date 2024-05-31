"use client";

import { WalletButton } from "@repo/ui/wallet-button";
import { usePolkadot } from "../context/polkadot";

export function WalletButtonWithHook(): JSX.Element {
  const context = usePolkadot();
  return <WalletButton hook={context} />;
}
