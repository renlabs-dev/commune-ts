import "../styles/globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { Providers } from "@commune-ts/providers/context";
import { WalletButtonWithHook } from "@commune-ts/providers/wallet-button-with-hook";
import { links } from "@commune-ts/ui/data";
import { cairo } from "@commune-ts/ui/fonts";
import { Footer } from "@commune-ts/ui/footer";
import { Header } from "@commune-ts/ui/header";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  robots: "all",
  title: "Commune AI",
  icons: [{ rel: "icon", url: "favicon.ico" }],
  description: "Making decentralized AI for everyone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`bg-gray-950 bg-[url('/bg-pattern.svg')] ${cairo.className} animate-fade-in`}
      >
        <Providers>
          <div className="flex w-full animate-fade-down border-b border-gray-500 py-2.5">
            <div className="mx-auto max-w-screen-md">
              <span className="flex items-center gap-1 text-gray-400">
                <InformationCircleIcon className="h-5 w-5 text-green-500" />
                To assign weights to modules, you need to stake on our
                validator. Click{" "}
                <Link href="" className="text-green-500 hover:underline">
                  here
                </Link>{" "}
                to get started.
              </span>
            </div>
          </div>
          <Header
            logoSrc="/logo.svg"
            navigationLinks={[
              { name: "Governance", href: links.governance, external: true },
              { name: "Docs", href: links.docs, external: false },
              { name: "Blog", href: links.blog, external: true },
              { name: "Join Community", href: links.discord, external: true },
            ]}
            title="Commune AI"
            wallet={<WalletButtonWithHook />}
          />
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
