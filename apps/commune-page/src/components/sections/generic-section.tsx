import { ForwardRefExoticComponent, SVGProps } from "react";

interface Feature {
  description: string;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">>;
}

interface GenericSectionProps {
  title: string;
  subtitle: string;
  sectionName: string;
  features: Feature[];
  index: number;
  iconSrc: string;
}

export function GenericSection({
  title,
  subtitle,
  sectionName,
  features,
}: GenericSectionProps) {
  return (
    <div className="border-b border-gray-500 lg:px-20">
      <section
        id={sectionName}
        className={`mx-auto flex h-full w-full max-w-screen-2xl flex-col items-center justify-center divide-gray-500 lg:flex-row lg:divide-x`}
      >
        <div
          className={`flex w-full flex-col gap-2 border-b border-gray-500 px-4 py-8 lg:w-1/3 lg:border-none lg:px-0 lg:pr-8`}
        >
          <p className="mt-2 text-left text-3xl font-semibold tracking-tight text-white">
            {title}
          </p>
          <h2 className={`text-left text-base font-medium text-gray-400`}>
            {subtitle}
          </h2>
        </div>

        <div className="flex w-full flex-col justify-center gap-4 p-4 py-8 text-base text-gray-400 lg:p-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative flex items-center justify-start gap-4 px-3"
            >
              <div className="inline font-semibold text-white">
                <feature.icon
                  className="absolute left-0 top-1 h-5 w-5 fill-green-500"
                  aria-hidden="true"
                />
              </div>
              <p className="inline">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
