import "./globals.css";
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";
import { links } from "@repo/ui/data";

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
      <body className={`bg-green-950 ${cairo.className}`}>
        <Header
          logoSrc="/logo.svg"
          navigationLinks={[
            { name: "Governance", href: links.governance, external: true },
            { name: "Docs", href: links.docs, external: false },
            { name: "Blog", href: links.blog, external: true },
            { name: "Join Community", href: links.discord, external: true },
          ]}
          title="Commune AI"
        />
        {children}
      </body>
    </html>
  );
}
