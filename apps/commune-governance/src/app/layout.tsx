import "../styles/globals.css";
import "@repo/ui/styles.css";

import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";
import { Providers, WalletButton } from "@repo/providers";

// TODO this could come from the ui lib since the only thing that changes between apps is the title
export const metadata: Metadata = {
  robots: "all",
  title: "Community Governance",
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
        className={`bg-gray-950 bg-[url('/bg-pattern.svg')] ${cairo.className}`}
      >
        <Providers>
          <Header
            logoSrc="/logo.svg"
            navigationLinks={[]}
            title="Community Governance"
            wallet={<WalletButton />}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
