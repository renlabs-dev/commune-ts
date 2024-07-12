"use client"
import { landingPageButtons } from "@commune-ts/ui"
import Image from "next/image";
import Link from "next/link";

interface TViewMoreModalProps {
  viewMoreIsVisible: boolean
  handleModalVisibility: (visibility?: boolean) => void
}

export const ViewMoreModal = (props: TViewMoreModalProps) => {
  const { handleModalVisibility, viewMoreIsVisible } = props;
  return (
    <div className={`${viewMoreIsVisible ? 'block' : 'hidden'} absolute left-0 z-[49] h-[calc(100svh-68px)] w-full overflow-clip`}>
      <div className="w-full flex p-4">
        <button
          onClick={() => handleModalVisibility(false)}
          className="relative inline-flex ml-auto w-fit animate-fade-up gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-200 animate-delay-100 hover:border-green-500 hover:bg-green-500/10"
        >
          <Image
            src="arrow-down-icon.svg"
            alt="link icon"
            width={20}
            height={20}
            className="rotate-90"
          />
          <span className="text-nowrap">Go back</span>
        </button>
      </div>


      <div className="fixed z-[50] bottom-0 flex flex-col mb-9 p-3 gap-2 w-full">

        <div className="animate-fade-up animate-delay-300 duration-300 mb-6 flex flex-col gap-1">
          <span className="text-gray-300 text-2xl text-center">
            Welcome to the <span className="text-green-500">commune</span>
          </span>
          <span className="text-gray-300 text-center text-pretty text-lg">
            Empowering censorship-free collaboration.
          </span>
        </div>

        {landingPageButtons.map((pageButton) => {
          return (
            <Link href={pageButton.href}>
              <button
                className="relative inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10"
              >
                <Image
                  src={pageButton.icon}
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">{pageButton.name}</span>
              </button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}