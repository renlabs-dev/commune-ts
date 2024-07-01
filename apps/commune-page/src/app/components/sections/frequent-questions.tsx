"use client";

import { faqData } from "../../../utils/mocks/frequent-questions";

export function FrequentQuestions(): JSX.Element {
  return (
    <section className="relative animate-fade-up overflow-hidden pb-12 text-left text-white animate-delay-200">
      <div className="p-4 px-4">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex w-full items-center justify-between text-left">
            <div className="flex w-full flex-col space-y-4 pb-4 pt-8">
              <h2 className="w-[80%] text-3xl font-medium text-white lg:text-5xl">
                Frequently asked
                <span className="font-thin text-green-500"> questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                A Knowledge Treasure Trove
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-white/20 bg-[#898989]/5 px-12 py-4 backdrop-blur-md">
        {faqData.map((faq) => (
          <div key={faq.question}>
            <div className="gap-6 space-y-2 py-6">
              <dt className="mx-auto max-w-screen-2xl">{faq.question}</dt>
              <div className="animate-fade-slide-down mx-auto mt-2 max-w-screen-2xl text-pretty pr-12">
                <p className="mr-2 text-base leading-7 text-gray-400">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
