import "../styles/globals.css";
import "@repo/ui/styles.css";

import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";
import { Footer } from "@repo/ui/footer";
import { Providers, WalletButton } from "@repo/providers";
import { links } from "@repo/ui/data";
import { applicationsList } from "../utils/applications-list";

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
              { name: "Home", href: links.landing_page, external: true },
            ]}
            title="Community Governance"
            wallet={<WalletButton />}
          />
          {children}
          <Footer applicationsList={applicationsList} />
        </Providers>
      </body>
    </html>
  );
}
