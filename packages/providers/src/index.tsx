import type { ReactNode } from "react";
import * as types from "./types";
import { ToastProvider } from "./context/toast";
import { PolkadotProvider } from "./context/polkadot";
import { WalletButtonWithHook } from "./components/wallet-button-with-hook";

function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ToastProvider>
      <PolkadotProvider
        wsEndpoint={String(process.env.NEXT_PUBLIC_WS_ENDPOINT)}
      >
        {children}
      </PolkadotProvider>
    </ToastProvider>
  );
}

export { Providers, WalletButtonWithHook, types };
