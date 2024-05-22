import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";
import { Header } from "@repo/ui/header";

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
      <body className={cairo.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
