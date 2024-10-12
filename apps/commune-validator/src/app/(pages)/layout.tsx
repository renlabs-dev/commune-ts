"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@commune-ts/ui";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  return (
    <Container>
      <div className="my-20 flex w-full flex-col gap-3 pb-4 text-gray-100">
        <h3 className="inline-flex w-fit animate-fade-down border border-white/20 bg-[#898989]/5 px-2 py-0.5 animate-delay-100 md:text-xl">
          Welcome to the Community Validator
        </h3>
        <h1 className="animate-fade-down text-2xl font-semibold animate-delay-500 md:text-4xl">
          Interact with modules, validators and subnets created by the{" "}
          <span
            className={`${pathname === "/subnets" || pathname === "/weighted-subnets" ? "text-cyan-500" : "text-green-500"}`}
          >
            community
          </span>
          .
        </h1>
      </div>
      <div className="mb-4 flex w-full gap-3 border-b border-white/20 text-center">
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 backdrop-blur-md animate-delay-300 md:flex-row">
          <Link
            href="/modules"
            className={`w-full gap-2 border bg-[#898989]/5 p-3 text-lg font-medium transition duration-200 hover:border-green-500 hover:bg-green-500/10 active:bg-green-500/50 ${pathname === "/modules" ? "border-green-500 bg-green-500/10 text-green-500" : "border-white/20 text-white"}`}
          >
            Modules
          </Link>
          <Link
            href="/weighted-modules"
            className={`w-full gap-2 border bg-[#898989]/5 p-3 text-lg font-medium transition duration-200 hover:border-green-500 hover:bg-green-500/10 active:bg-green-500/50 ${pathname === "/weighted-modules" ? "border-green-500 bg-green-500/10 text-green-500" : "border-white/20 text-white"}`}
          >
            Weighted Modules
          </Link>
        </div>
        <div className="mb-4 border-l border-white/20" />
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 backdrop-blur-md animate-delay-300 md:flex-row">
          <Link
            href="/subnets"
            className={`w-full gap-2 border bg-[#898989]/5 p-3 text-lg font-medium transition duration-200 hover:border-cyan-500 hover:bg-cyan-500/10 active:bg-cyan-500/50 ${pathname === "/subnets" ? "border-cyan-500 bg-cyan-500/10 text-cyan-500" : "border-white/20 text-white"}`}
          >
            Subnets
          </Link>
          <Link
            href="/weighted-subnets"
            className={`w-full gap-2 border bg-[#898989]/5 p-3 text-lg font-medium transition duration-200 hover:border-cyan-500 hover:bg-cyan-500/10 active:bg-cyan-500/50 ${pathname === "/weighted-subnets" ? "border-cyan-500 bg-cyan-500/10 text-cyan-500" : "border-white/20 text-white"}`}
          >
            Weighted Subnets
          </Link>
        </div>
      </div>
      {children}
    </Container>
  );
}
