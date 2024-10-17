import type { Metadata } from "next";
import Link from "next/link";

import { Button, Container, Separator } from "@commune-ts/ui";

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
    <div className="pt-4">
      <Container>
        <div className="mb-4 flex w-full gap-3 border-b border-white/20 text-center">
          <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-300 md:flex-row">
            <Button size="xl" className="w-full" asChild>
              <Link href="/modules">Modules</Link>
            </Button>
            <Button size="xl" className="w-full" asChild>
              <Link href="/weighted-modules">Your Selected Modules</Link>
            </Button>
            <Separator orientation="vertical" />
            <Button
              asChild
              size="xl"
              className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500 active:bg-cyan-500/30"
            >
              <Link href="/subnets">Subnets</Link>
            </Button>
            <Button
              asChild
              size="xl"
              className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500 active:bg-cyan-500/30"
            >
              <Link href="/weighted-subnets">Your Selected Subnets</Link>
            </Button>
          </div>
        </div>
        {children}
      </Container>
    </div>
  );
}
