import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { z } from "zod";

import type { TransactionResult } from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { toast } from "@commune-ts/providers/use-toast";
import { cairo } from "@commune-ts/ui/fonts";
import { Loading } from "@commune-ts/ui/loading";

const daoSchema = z.object({
  applicationKey: z.string().min(1, "Application Key is required"),
  discordId: z.string().min(16, "Discord ID is required"),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export function CreateDao(): JSX.Element {
  const router = useRouter();
  const { isConnected, addDaoApplication, balance } = useCommune();

  const [applicationKey, setApplicationKey] = useState("");

  const [discordId, setDiscordId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [uploading, setUploading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  function toggleModalMenu(): void {
    setModalOpen(!modalOpen);
  }

  const [editMode, setEditMode] = useState(true);
  function toggleEditMode(): void {
    setEditMode(!editMode);
  }

  const [transactionStatus, setTransactionStatus] = useState<TransactionResult>(
    {
      status: null,
      message: null,
      finalized: false,
    },
  );

  function handleCallback(TransactionReturn: TransactionResult): void {
    setTransactionStatus(TransactionReturn);
  }

  async function uploadFile(fileToUpload: File): Promise<void> {
    try {
      setUploading(true);
      const data = new FormData();
      data.set("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const ipfs = (await res.json()) as { IpfsHash: string };
      setUploading(false);

      if (!balance) {
        toast.error("Balance is still loading");
        return;
      }

      const daoApplicationCost = 1000;

      if (Number(balance) > daoApplicationCost) {
        void addDaoApplication({
          applicationKey,
          IpfsHash: `ipfs://${ipfs.IpfsHash}`,
          callback: handleCallback,
        });
      } else {
        toast.error(
          `Insufficient balance to create S0 Application. Required: ${daoApplicationCost} but got ${balance}`,
        );
        setTransactionStatus({
          status: "ERROR",
          finalized: true,
          message: "Insufficient balance to create S0 Application",
        });
      }
      router.refresh();
    } catch (e) {
      setUploading(false);
      toast.error("Error uploading S0 Application");
    }
  }

  function HandleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTransactionStatus({
      status: "STARTING",
      finalized: false,
      message: "Starting S0 Application creation...",
    });

    const result = daoSchema.safeParse({
      title,
      body,
      applicationKey,
      discordId,
    });

    if (!result.success) {
      toast.error(result.error.errors.map((e) => e.message).join(", "));
      setTransactionStatus({
        status: "ERROR",
        finalized: true,
        message: "Error creating S0 Application",
      });
      return;
    }

    const daoData = JSON.stringify({
      discord_id: discordId,
      title,
      body,
    });
    const blob = new Blob([daoData], { type: "application/json" });
    const fileToUpload = new File([blob], "dao.json", {
      type: "application/json",
    });
    void uploadFile(fileToUpload);
  }

  return (
    <>
      <button
        className="min-w-auto w-full border bg-[#898989]/5 backdrop-blur-md px-4 py-3 text-white hover:border-green-600 hover:text-green-600"
        onClick={toggleModalMenu}
        type="button"
      >
        Create New S0 Application
      </button>
      <div
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"} -mr-2`}
        role="dialog"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-60 backdrop-blur-sm" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto animate-fade-in-down">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <div className="relative w-[100%] max-w-screen-2xl transform overflow-hidden border border-gray-500 bg-[url('/bg-pattern.svg')] text-left md:w-[80%]">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 p-6 text-white bg-center bg-no-repeat border-b border-gray-500 md:flex-row">
                <div className="flex flex-col items-center md:flex-row">
                  <h3
                    className="pl-2 text-xl font-bold leading-6 text-white"
                    id="modal-title"
                  >
                    Build New S0 Application
                  </h3>
                </div>

                <button
                  className="p-2 transition duration-200"
                  onClick={toggleModalMenu}
                  type="button"
                >
                  <XMarkIcon className="w-6 h-6 fill-white" />
                </button>
              </div>
              {/* Modal Body */}
              <form onSubmit={HandleSubmit}>
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex gap-2">
                    <button
                      className={`border px-4 py-1 ${editMode ? "border-green-500 bg-green-500/5 text-green-500" : "border-gray-500 text-gray-400"} hover:border-green-600 hover:bg-green-600/5 hover:text-green-600`}
                      onClick={toggleEditMode}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className={`border px-4 py-1 ${!editMode ? "border-green-500 bg-green-500/5 text-green-500" : "border-gray-500 text-gray-400"} hover:border-green-600 hover:bg-green-600/5 hover:text-green-600`}
                      onClick={toggleEditMode}
                      type="button"
                    >
                      Preview
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {editMode ? (
                      <div className="flex flex-col gap-3">
                        <input
                          className="w-full p-3 text-white bg-black"
                          onChange={(e) => {
                            setApplicationKey(e.target.value);
                          }}
                          placeholder="Application Key (ss58)"
                          type="text"
                          value={applicationKey}
                        />
                        <input
                          className="w-full p-3 text-white bg-black"
                          onChange={(e) => {
                            setDiscordId(e.target.value);
                          }}
                          placeholder="Discord ID"
                          type="text"
                          value={discordId}
                        />
                        <input
                          className="w-full p-3 text-white bg-black"
                          onChange={(e) => {
                            setTitle(e.target.value);
                          }}
                          placeholder="Application title"
                          type="text"
                          value={title}
                        />
                        <textarea
                          className="w-full p-3 text-white bg-black"
                          onChange={(e) => {
                            setBody(e.target.value);
                          }}
                          placeholder="Application body... (Markdown supported)"
                          rows={5}
                          value={body}
                        />
                      </div>
                    ) : (
                      <div className="p-4 py-10">
                        {body ? (
                          <MarkdownPreview
                            className={`line-clamp-4 ${cairo.className}`}
                            source={`# ${title}\n${body}`}
                            style={{
                              backgroundColor: "transparent",
                              color: "white",
                            }}
                          />
                        ) : null}
                        {/* TODO: skeleton for markdown body */}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      className={`relative w-full border px-4 py-2 font-semibold ${isConnected ? "border-green-500 text-green-500 hover:bg-green-500/5 active:top-1" : "border-gray-500 text-gray-500"}`}
                      disabled={!isConnected}
                      type="submit"
                    >
                      {uploading ? "Uploading..." : "Submit S0 Application"}
                    </button>
                  </div>
                  {transactionStatus.status ? (
                    <p
                      className={`pt-2 ${transactionStatus.status === "PENDING" && "text-yellow-400"} ${transactionStatus.status === "ERROR" && "text-red-400"} ${transactionStatus.status === "SUCCESS" && "text-green-400"} ${transactionStatus.status === "STARTING" && "text-blue-400"} flex text-left text-base`}
                    >
                      {transactionStatus.status === "PENDING" ||
                        (transactionStatus.status === "STARTING" && (
                          <Loading />
                        ))}
                      {transactionStatus.message}
                    </p>
                  ) : null}

                  <div className="flex items-start gap-1 mt-1 text-white">
                    <InformationCircleIcon className="mt-0.5 h-4 w-4 fill-green-500 text-sm" />
                    <span className="text-sm">
                      Please make sure, that your application meets all of the
                      criteria defined in this{" "}
                      <Link
                        className="text-blue-500 hover:underline"
                        href="https://mirror.xyz/0xD80E194aBe2d8084fAecCFfd72877e63F5822Fc5/SuhIlcUugotYhf2QmVTd3mI05RCycqSFrJfCxuEHet0"
                        target="_blank"
                      >
                        article
                      </Link>
                      , or you are at risk of getting denied by the Module
                      Curation DAO.
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
