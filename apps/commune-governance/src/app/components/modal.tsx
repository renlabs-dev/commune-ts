"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import { CreateTransferDaoTreasuryProposal } from "./add-transfer-dao-treasury-proposal";
import { CreateDao } from "./create-dao";
import { CreateProposal } from "./create-proposal";

export function CreateModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("proposal");

  function toggleModalMenu() {
    setModalOpen(!modalOpen);
  }

  return (
    <>
      <button
        className="min-w-auto h-full w-full animate-fade-down border border-white/20 bg-[#898989]/5 p-5 text-white transition duration-200 animate-delay-700 hover:border-green-500 hover:bg-green-500/10 hover:text-green-500"
        onClick={toggleModalMenu}
        type="button"
      >
        Propose Change
      </button>
      <div
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"} -mr-2`}
        role="dialog"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-[100%] max-w-screen-2xl transform overflow-hidden border border-white/20 bg-[#898989]/5 px-5 py-3 text-left text-white backdrop-blur-md md:w-[80%]">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-500 bg-cover bg-center bg-no-repeat p-6 md:flex-row">
                <div className="flex flex-col items-center md:flex-row">
                  <h3
                    className="pl-2 text-xl font-bold leading-6"
                    id="modal-title"
                  >
                    Propose Change
                  </h3>
                </div>

                <button
                  className="p-2 transition duration-200"
                  onClick={toggleModalMenu}
                  type="button"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* View Selection */}
              <div className="divide-y divide-white/20 p-6 pb-4">
                <select
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value)}
                  className="mb-4 w-full border-r-[16px] border-transparent bg-white/10 p-3 text-white"
                >
                  <option value="proposal" className="bg-gray-900">
                    Create new Proposal
                  </option>
                  <option value="dao" className="bg-gray-900">
                    Create new S2 Application
                  </option>
                  <option
                    value="create-transfer-dao-treasury"
                    className="bg-gray-900"
                  >
                    Create Transfer Dao Treasury Proposal
                  </option>
                </select>

                {/* Modal Body */}
                {selectedView === "proposal" ? (
                  <CreateProposal />
                ) : selectedView === "dao" ? (
                  <CreateDao />
                ) : (
                  <CreateTransferDaoTreasuryProposal />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
