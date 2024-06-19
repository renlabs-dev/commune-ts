import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@repo/ui/loading";
import { Footer } from "@repo/ui/footer";
import { sections } from "../utils/mocks/sections-mock";
import { applicationsList } from "../utils/applications-list";
import { HeroSection } from "./components/sections/hero-section";
import { WelcomeSection } from "./components/sections/welcome";
import { GenericSection } from "./components/sections/generic-section";
import { FrequentQuestions } from "./components/sections/frequent-questions";

export const metadata: Metadata = {
  robots: "all",
  title: "Commune AI",
  icons: [{ rel: "icon", url: "favicon.ico" }],
  description: "Making decentralized AI for everyone",
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <HeroSection />
      <WelcomeSection />
      {sections.map((section, index) => {
        return (
          <GenericSection
            features={section.features}
            iconSrc={section.iconSrc}
            index={index}
            key={section.title}
            sectionName={section.sectionName}
            subtitle={section.subtitle}
            title={section.title}
          />
        );
      })}
      <FrequentQuestions />
      <Footer applicationsList={applicationsList} />
    </Suspense>
  );
}
