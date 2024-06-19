import "../styles/globals.css";
import "@repo/ui/styles.css";

import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";
import { Footer } from "@repo/ui/footer";
import { Providers } from "@repo/providers/context";
import { WalletButtonWithHook } from "@repo/providers/wallet-button-with-hook";
import { links } from "@repo/ui/data";
import { applicationsList } from "../utils/applications-list";
import { FooterDivider } from "./components/footer-divider";

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
        className={`bg-gray-950 bg-[url('/bg-pattern.svg')] ${cairo.className} animate-fade-in`}
      >
        <Providers>
          <Header
            logoSrc="/logo.svg"
            navigationLinks={[
              { name: "Home Page", href: links.landing_page, external: true },
            ]}
            title="Community Governance"
            wallet={<WalletButtonWithHook />}
          />
          {children}
          <FooterDivider />
          <Footer applicationsList={applicationsList} />
        </Providers>
      </body>
    </html>
  );
}
