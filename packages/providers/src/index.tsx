import type { ReactNode } from "react";

import { CommuneProvider } from "./context/commune";
import { ReactQueryProvider } from "./context/react-query";
import { ToastProvider } from "./context/toast";

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
export { Providers };
