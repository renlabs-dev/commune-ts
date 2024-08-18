"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import { IntroSection } from "./intro";
import { WalletSection } from "./wallet";

export function MainSection() {
  const { selectedAccount } = useCommune();
  return (
    <main className="flex min-h-[86dvh] flex-col items-center justify-center gap-3 text-white">
      {selectedAccount ? <WalletSection /> : <IntroSection />}
    </main>
  );
}
