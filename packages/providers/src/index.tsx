import type { ReactNode } from "react";
import * as types from "./types";
import { ToastProvider } from "./context/toast";
import { PolkadotProvider } from "./context/polkadot";
import { WalletButtonWithHook } from "./components/wallet-button-with-hook";
import { ReactQueryProvider } from "./context/react-query";

function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <PolkadotProvider
          wsEndpoint={String(process.env.NEXT_PUBLIC_WS_ENDPOINT)}
        >
          {children}
        </PolkadotProvider>
      </ToastProvider>
    </ReactQueryProvider>
  );
}

export { Providers, WalletButtonWithHook, types };
