import type { ReactNode } from "react";
import * as types from "./types";
import { ToastProvider } from "./context/toast";
import { CommuneProvider } from "./context/polkadot";
import { WalletButtonWithHook } from "./components/wallet-button-with-hook";
import { ReactQueryProvider } from "./context/react-query";

function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <CommuneProvider
          wsEndpoint={String(process.env.NEXT_PUBLIC_WS_ENDPOINT)}
        >
          {children}
        </CommuneProvider>
      </ToastProvider>
    </ReactQueryProvider>
  );
}

export { Providers, WalletButtonWithHook, types };
