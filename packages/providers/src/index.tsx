import type { ReactNode } from "react";
import { ToastProvider } from "./context/toast";
import { CommuneProvider } from "./context/commune";
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

export { Providers, WalletButtonWithHook };
