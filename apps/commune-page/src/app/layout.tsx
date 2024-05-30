import "../styles/globals.css";
import "@repo/ui/styles.css";

import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";
import { Footer } from "@repo/ui/footer";
import { links } from "@repo/ui/data";
import { Providers, WalletButton } from "@repo/providers";
import { applicationsList } from "../utils/applications-list";

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
          <Header
            logoSrc="/logo.svg"
            navigationLinks={[
              { name: "Governance", href: links.governance, external: true },
              { name: "Docs", href: links.docs, external: false },
              { name: "Blog", href: links.blog, external: true },
              { name: "Join Community", href: links.discord, external: true },
            ]}
            title="Commune AI"
            wallet={<WalletButton />}
          />
          {children}
          <Footer applicationsList={applicationsList} />
        </Providers>
      </body>
    </html>
  );
}
