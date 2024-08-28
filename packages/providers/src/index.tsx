import type { ReactNode } from "react";

import { CommuneProvider } from "./context/commune";
import { ReactQueryProvider } from "./context/react-query";
import { ToastProvider } from "./context/toast";

function Providers({ children }: { children: ReactNode }): JSX.Element {
  console.log(
    "Package providers - WS Endpoint:",
    process.env.NEXT_PUBLIC_WS_PROVIDER_URL,
  );
  console.log(
    "Package providers - Cache URL:",
    process.env.NEXT_PUBLIC_CACHE_PROVIDER_URL,
  );

  return (
    <ReactQueryProvider>
      <ToastProvider>
        <CommuneProvider
          wsEndpoint={String(process.env.NEXT_PUBLIC_WS_PROVIDER_URL)}
          communeCacheUrl={"https://commune-cache-azn4r.ondigitalocean.app"}
        >
          {children}
        </CommuneProvider>
      </ToastProvider>
    </ReactQueryProvider>
  );
}
export { Providers };
