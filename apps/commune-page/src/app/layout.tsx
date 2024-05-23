import "./globals.css";
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import { cairo } from "@repo/ui/fonts";

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
      <body className={cairo.className}>{children}</body>
    </html>
  );
}
