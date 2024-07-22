"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col items-start justify-center px-4 text-white">
      <div className="my-20 flex w-full flex-col gap-3 pb-4">
        <h3 className="inline-flex w-fit animate-fade-down border border-white/20 bg-[#898989]/5 px-2 py-0.5 animate-delay-100 md:text-xl">
          Welcome to the Community Validator
        </h3>
        <h1 className="animate-fade-down text-2xl font-semibold animate-delay-500 md:text-4xl">
          Interact with modules created by the{" "}
          <span className="text-green-600">community</span>.
        </h1>
      </div>
      <div className="mb-4 flex w-full animate-fade-down flex-col gap-4 border-b border-white/20 pb-4 animate-delay-300 md:flex-row">
        <Link
          href="/"
          className={`w-full gap-2 border  bg-[#898989]/5 p-3 text-center text-lg text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10 ${pathname === "/" ? "border-green-500 bg-green-500/10" : "border-white/20"}`}
        >
          All
        </Link>
        <Link
          href="/weighted"
          className={`w-full gap-2 border bg-[#898989]/5 p-3 text-center text-lg text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10 ${pathname === "/weighted" ? "border-green-500 bg-green-500/10" : "border-white/20"}`}
        >
          Weighted
        </Link>
      </div>
      {children}
    </main>
  );
}
