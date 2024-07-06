import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

import { smallAddress } from "@commune-ts/providers/utils";

import { api } from "~/trpc/server";

interface Params {
  params: {
    slug: string[];
  };
}

export default async function ModulePage({ params }: Params) {
  const { slug } = params;

  if (slug.length !== 1) {
    notFound();
  }

  const id = slug[0];

  if (!/^\d+$/.test(String(id))) {
    notFound();
  }

  const mdl = await api.module.byId({ uid: Number(id) });

  if (!mdl) {
    notFound();
  }

  {
    /* <ul>
        <li>uid: {mdl.uid}</li>
        <li>address: {mdl.key}</li>
        <li>emission: {mdl.emission}</li>
        <li>incentive: {mdl.incentive}</li>
        <li>dividend: {mdl.dividend}</li>
        <li>registration block: {mdl.registrationBlock}</li>
        <li>delegation fee: {mdl.delegationFee}</li>
        <li>Created at: {new Date(mdl.createdAt).toLocaleString()}</li>
      </ul> */
  }

  const description =
    "Here, you can explore a diverse range of modules specifically designed to enhance communication, collaboration, and creativity. Whether you are looking to streamline your workflow, improve team dynamics, or unleash your creative potential, our modules offer the tools and features you need to achieve your goals. Each module is crafted with precision, ensuring a seamless and intuitive user experience. At Commune Ai, we believe that effective communication is the cornerstone of any successful endeavor. Our modules are designed to facilitate clear and efficient exchanges, breaking down barriers and fostering a deeper understanding among team members. From real-time messaging to advanced project management tools, our platform empowers you to stay connected and informed, no matter where you are..";

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="my-16 flex w-full items-center justify-between">
        <Link
          href="/"
          className="absolute z-10 flex animate-fade-left items-center gap-1 border border-white/20 bg-[#898989]/5 p-2 pr-3 text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10"
        >
          <ArrowLeftIcon className="h-5 w-5 text-green-500" />
          Go back to modules list
        </Link>
        <h1 className="flex-grow animate-fade-right text-center text-3xl font-semibold">
          Module BRO
        </h1>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-[70%] animate-fade-down animate-delay-300">
          <div className="border border-white/20 bg-[#898989]/5 p-8">
            <h2 className="mb-4 text-xl font-semibold">Description</h2>
            <p className="pb-0.5">{description}</p>
          </div>
        </div>
        <div className="w-[30%] animate-fade-down animate-delay-500">
          <div className="flex justify-around border border-white/20 bg-[#898989]/5 p-8">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-gray-400">Publication Date</h2>
                <span>{new Date(mdl.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Address</h2>
                <span>{smallAddress(String(mdl.key))}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Emission</h2>
                <span>{mdl.emission}</span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-gray-400">Category</h2>
                <span>Module</span>
              </div>
              <div>
                <h2 className="text-gray-400">Reading Time</h2>
                <span>{calculateReadingTime(description)}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Incentive</h2>
                <span>{mdl.incentive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(/\s+/).length; // Split text by whitespace and count words
  const minutes = words / wordsPerMinute;

  const minutesRounded = Math.ceil(minutes); // Round up to the nearest minute

  return `${minutesRounded} min read`;
}
