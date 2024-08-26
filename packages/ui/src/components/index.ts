import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { CopyButton } from "./copy-button";
export { Footer } from "./footer";
export { Header } from "./header";
export { Loading } from "./loading";
export { MobileNavigation } from "./mobile-navigation";
export { NoWalletExtensionDisplay } from "./no-wallet-extension-display";
export { TransactionStatus } from "./transaction-status";
export { Container } from "./container";
