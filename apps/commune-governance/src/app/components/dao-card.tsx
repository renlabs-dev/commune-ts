import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { DaoApplications } from "@repo/providers/src/types";
import { smallAddress } from "@repo/providers/src/utils";
import { Card } from "./card";
import { StatusLabel } from "./status-label";
import { Skeleton } from "./skeleton";
import { MarkdownView } from "./markdown-view";

interface DaoCardProps {
  dao: DaoApplications;
}

export function DaoCard(props: DaoCardProps): JSX.Element {
  const { dao } = props;

  return (
    <>
      {dao.body ? (
        <Card.Root className="animate-fade-in-down" key={dao.id}>
          <Card.Header className="z-10 flex-col">
            {dao.body.title ? (
              <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
                {dao.body.title}
              </h2>
            ) : null}
            {!dao.body.title && <Skeleton className="w-8/12 py-3 pb-4" />}
            <div className="flex flex-row justify-center w-full gap-2 mb-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
              <StatusLabel result={dao.status} />
            </div>
          </Card.Header>
          <Card.Body className="px-0 py-0">
            <div className="p-4 py-10">
              <MarkdownView
                className="line-clamp-4"
                source={dao.body.body ?? ""}
              />
            </div>
            <div className="flex flex-col items-start justify-between p-2 border-t border-gray-500 lg:p-4 lg:flex-row lg:items-center">
              <div className="flex flex-col-reverse w-full lg:items-center lg:flex-row">
                <div className="w-full py-2 mr-3 lg:py-0 lg:w-auto lg:min-w-fit">
                  <Link
                    className="flex items-center w-full px-2 py-2 text-sm text-green-500 border border-green-500 hover:bg-green-600/5 hover:border-green-600 hover:text-green-600 lg:px-4 min-w-auto lg:w-auto"
                    href={`dao/${dao.id}`}
                  >
                    Click to view S0 Application
                    <ArrowRightIcon className="w-5 ml-auto lg:ml-2" />
                  </Link>
                </div>
                <span className="block w-full text-base text-green-500 truncate line-clamp-1">
                  Posted by{" "}
                  <span className="text-white">{smallAddress(dao.userId)}</span>
                </span>
              </div>
            </div>
          </Card.Body>
        </Card.Root>
      ) : null}
    </>
  );
}
