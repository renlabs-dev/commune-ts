import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@commune-ts/ui/footer";
import { Loading } from "@commune-ts/ui/loading";

import { applicationsList } from "../utils/applications-list";
import { sections } from "../utils/mocks/sections-mock";
import { FrequentQuestions } from "./components/sections/frequent-questions";
import { GenericSection } from "./components/sections/generic-section";
import { HeroSection } from "./components/sections/hero-section";
import { WelcomeSection } from "./components/sections/welcome";

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
