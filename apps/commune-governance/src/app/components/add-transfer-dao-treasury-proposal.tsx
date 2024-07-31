"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { z } from "zod";

import type { TransactionResult } from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { toast } from "@commune-ts/providers/use-toast";
import { cairo } from "@commune-ts/ui/fonts";
import { Loading } from "@commune-ts/ui/loading";

const transferDaoTreasuryProposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export function CreateTransferDaoTreasuryProposal(): JSX.Element {
  const router = useRouter();
  const { isConnected, addTransferDaoTreasuryProposal, balance } = useCommune();

  const [dest, setDest] = useState("");
  const [value, setValue] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [uploading, setUploading] = useState(false);

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
        void addTransferDaoTreasuryProposal({
          dest,
          value,
          IpfsHash: `ipfs://${ipfs.IpfsHash}`,
          callback: handleCallback,
        });
      } else {
        toast.error(
          `Insufficient balance to create a transfer dao treasury proposal. Required: ${daoApplicationCost} but got ${balance}`,
        );
        setTransactionStatus({
          status: "ERROR",
          finalized: true,
          message:
            "Insufficient balance to a create transfer dao treasury proposal",
        });
      }
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setUploading(false);
      toast.error("Error uploading transfer dao treasury proposal");
    }
  }

  function HandleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTransactionStatus({
      status: "STARTING",
      finalized: false,
      message: "Starting transfer dao treasury proposal creation...",
    });

    const result = transferDaoTreasuryProposalSchema.safeParse({
      title,
      body,
    });

    if (!result.success) {
      toast.error(result.error.errors.map((e) => e.message).join(", "));
      setTransactionStatus({
        status: "ERROR",
        finalized: true,
        message: "Error creating transfer dao treasury proposal",
      });
      return;
    }

    const daoData = JSON.stringify({
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
    <form onSubmit={HandleSubmit}>
      <div className="flex flex-col gap-4 pt-4">
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
                className="w-full bg-white/10 p-3 text-white"
                onChange={(e) => {
                  setDest(e.target.value);
                }}
                placeholder="Destination"
                type="text"
                value={dest}
              />
              <input
                className="w-full bg-white/10 p-3 text-white"
                onChange={(e) => {
                  setValue(e.target.value);
                }}
                placeholder="Value"
                type="text"
                value={value}
              />
              <input
                className="w-full bg-white/10 p-3 text-white"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Application title"
                type="text"
                value={title}
              />
              <textarea
                className="w-full bg-white/10 p-3 text-white"
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
            {uploading
              ? "Uploading..."
              : "Submit transfer dao treasury proposal"}
          </button>
        </div>
        {transactionStatus.status ? (
          <span
            className={`pt-2 ${transactionStatus.status === "PENDING" && "text-yellow-400"} ${transactionStatus.status === "ERROR" && "text-red-400"} ${transactionStatus.status === "SUCCESS" && "text-green-400"} ${transactionStatus.status === "STARTING" && "text-blue-400"} flex items-center justify-start text-left text-base`}
          >
            {transactionStatus.status === "PENDING" ||
              (transactionStatus.status === "STARTING" && <Loading />)}
            {transactionStatus.message}
          </span>
        ) : null}

        {/* <div className="mt-1 flex items-start gap-1 text-white">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 fill-green-500 text-sm" />
          <span className="text-sm">
            Please make sure, that your application meets all of the criteria
            defined in this{" "}
            <Link
              className="text-blue-500 hover:underline"
              href="https://mirror.xyz/0xD80E194aBe2d8084fAecCFfd72877e63F5822Fc5/SuhIlcUugotYhf2QmVTd3mI05RCycqSFrJfCxuEHet0"
              target="_blank"
            >
              article
            </Link>
            , or you are at risk of getting denied by the Module Curation DAO.
          </span>
        </div> */}
      </div>
    </form>
  );
}
