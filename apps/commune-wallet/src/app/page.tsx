import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@commune-ts/ui/loading";

import { MainSection } from "./components/sections/main";

export const metadata: Metadata = {
  robots: "all",
  title: "Commune Wallet",
  icons: [{ rel: "icon", url: "favicon.ico" }],
  description:
    "Simple, secure, and easy-to-use wallet for the Commune ecosystem.",
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <MainSection />
    </Suspense>
  );
}
