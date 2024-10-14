import "../styles/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "all",
  title: "Commune AI",
  icons: [{ rel: "icon", url: "favicon.ico" }],
  description: "Making decentralized AI for everyone",
};

export default function RootLayout(): JSX.Element {
  return <div></div>;
}
