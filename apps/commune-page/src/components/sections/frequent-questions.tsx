"use client";

import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { faqData } from "../../utils/mocks/frequent-questions";

export function FrequentQuestions() {
  return (
    <section
      className={`relative divide-y overflow-hidden text-left text-white`}
    >
      <div className="">
        <Disclosure as="div">
          {({ open }) => (
            <>
              <div className="space-y-4 border-b border-gray-500 bg-black/50 p-4 lg:px-20">
                <div className="mx-auto max-w-screen-2xl">
                  <Disclosure.Button className="flex w-full items-center justify-between text-left ">
                    <div className="flex w-full flex-col space-y-4 py-12 ">
                      <h2 className="w-[80%] text-3xl font-medium text-white lg:text-5xl">
                        Frequently asked
                        <span className={`text-green-500`}> questions</span>
                      </h2>
                      <p className="font-medium text-gray-400">
                        A Knowledge Treasure Trove
                      </p>
                    </div>

                    <span className="hover:bg-green-950/150 flex items-center border border-gray-500 bg-black/50 py-4 transition duration-200">
                      <Image
                        src={"/arrow-down-icon.svg"}
                        width={50}
                        height={50}
                        alt={"read"}
                        className={
                          open
                            ? "h-5 rotate-0 transform animate-open-accordion"
                            : "h-5 -rotate-90 transform animate-close-accordion"
                        }
                      />
                    </span>
                  </Disclosure.Button>
                </div>
              </div>

              <Disclosure.Panel
                as="dd"
                className="animate-fade-slide-down text-pretty"
              >
                <dl className="divide-y-0 divide-gray-500 border-b-0 border-gray-500">
                  {faqData.map((faq) => (
                    <div key={faq.question}>
                      <div className="space-y-2 border-b border-gray-500/60 p-4 py-12 lg:px-20">
                        <dt className="mx-auto max-w-screen-2xl">
                          {faq.question}
                        </dt>
                        <dd className="mx-auto mt-2 max-w-screen-2xl animate-fade-slide-down text-pretty pr-12">
                          <p className="mr-2 text-base leading-7 text-gray-400">
                            {faq.answer}
                          </p>
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </section>
  );
}
