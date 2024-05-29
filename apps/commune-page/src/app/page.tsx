import { Suspense } from "react";
import { Loading } from "@repo/ui/loading";
import { HeroSection } from "../components/sections/hero-section";
import { WelcomeSection } from "../components/sections/welcome";
import { sections } from "../utils/mocks/sections-mock";
import { GenericSection } from "../components/sections/generic-section";
import { FrequentQuestions } from "../components/sections/frequent-questions";

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <HeroSection />
      <WelcomeSection />
      {sections.map((section, index) => {
        return (
          <GenericSection
            key={index}
            index={index}
            sectionName={section.sectionName}
            title={section.title}
            subtitle={section.subtitle}
            features={section.features}
            iconSrc={section.iconSrc}
          />
        );
      })}
      <FrequentQuestions />
      {/* <Footer /> */}
    </Suspense>
  );
}
