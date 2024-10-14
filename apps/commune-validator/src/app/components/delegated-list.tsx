"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useCommune } from "@commune-ts/providers/use-commune";
import {
  cn,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@commune-ts/ui";
import { formatToken, smallAddress } from "@commune-ts/utils";

import { useDelegateModuleStore } from "~/stores/delegateModuleStore";
import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";
import { api } from "~/trpc/react";

export function DelegatedList() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("modules"); // Default value

  useEffect(() => {
    const currentRoute =
      pathname === "/subnets" || pathname === "/weighted-subnets"
        ? "subnets"
        : "modules";
    setActiveTab(currentRoute);
  }, [pathname]);

  const {
    delegatedModules,
    updatePercentage: updateModulePercentage,
    removeModule,
    getTotalPercentage: getModuleTotalPercentage,
    setDelegatedModulesFromDB,
    updateOriginalModules,
    hasUnsavedChanges: hasUnsavedModuleChanges,
  } = useDelegateModuleStore();

  const {
    delegatedSubnets,
    updatePercentage: updateSubnetPercentage,
    removeSubnet,
    getTotalPercentage: getSubnetTotalPercentage,
    setDelegatedSubnetsFromDB,
    updateOriginalSubnets,
    hasUnsavedChanges: hasUnsavedSubnetChanges,
  } = useDelegateSubnetStore();

  const totalPercentage =
    activeTab === "modules"
      ? getModuleTotalPercentage()
      : getSubnetTotalPercentage();
  const { selectedAccount, userTotalStaked } = useCommune();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function handleAutoCompletePercentage() {
    const items = activeTab === "modules" ? delegatedModules : delegatedSubnets;
    const updateFn =
      activeTab === "modules" ? updateModulePercentage : updateSubnetPercentage;

    const remainingPercentage = 100 - totalPercentage;
    const itemsToUpdate = items.length;

    if (itemsToUpdate === 0) return;

    const percentagePerItem = Math.floor(remainingPercentage / itemsToUpdate);
    const extraPercentage = remainingPercentage % itemsToUpdate;

    items.forEach((item, index) => {
      const newPercentage =
        item.percentage + percentagePerItem + (index < extraPercentage ? 1 : 0);
      updateFn(item.id, newPercentage);
    });
  }

  const {
    data: userModuleData,
    error: moduleError,
    refetch: refetchModules,
  } = api.module.byUserModuleData.useQuery(
    { userKey: selectedAccount?.address ?? "" },
    { enabled: !!selectedAccount?.address },
  );

  const {
    data: userSubnetData,
    error: subnetError,
    refetch: refetchSubnets,
  } = api.subnet.byUserSubnetData.useQuery(
    { userKey: selectedAccount?.address ?? "" },
    { enabled: !!selectedAccount?.address },
  );

  const validatorAddress = "5DUWKpGBneBbna6PFHZk18Gp9wyvLUFPiWy5maAARjRjayPp";

  function userWeightPower(
    userStakes: { address: string; stake: string }[] | undefined,
    validatorAddress: string,
  ) {
    if (!userStakes) {
      return BigInt(0);
    }
    const data = userStakes
      .filter((stake) => validatorAddress.includes(stake.address))
      .reduce((sum, stake) => sum + BigInt(stake.stake), BigInt(0));

    return formatToken(Number(data));
  }

  const userStakeWeight = userWeightPower(userTotalStaked, validatorAddress);

  useEffect(() => {
    if (moduleError) {
      console.error("Error fetching user module data:", moduleError);
    }
    if (userModuleData) {
      const formattedModules = userModuleData.map((module) => ({
        id: module.module_data.id,
        address: module.module_data.moduleKey,
        title: module.module_data.name ?? "",
        name: module.module_data.name ?? "",
        percentage: module.user_module_data.weight,
      }));
      setDelegatedModulesFromDB(formattedModules);
    }
  }, [userModuleData, moduleError, setDelegatedModulesFromDB]);

  useEffect(() => {
    if (subnetError) {
      console.error("Error fetching user subnet data:", subnetError);
    }
    if (userSubnetData) {
      const formattedSubnets = userSubnetData.map((subnet) => ({
        id: subnet.subnet_data.id,
        name: subnet.subnet_data.name,
        percentage: subnet.user_subnet_data.weight,
        founderAddress: subnet.subnet_data.founder,
      }));
      setDelegatedSubnetsFromDB(formattedSubnets);
    }
  }, [userSubnetData, subnetError, setDelegatedSubnetsFromDB]);

  const handlePercentageChange = (id: number, percentage: number) => {
    if (percentage >= 0 && percentage <= 100) {
      if (activeTab === "modules") {
        updateModulePercentage(id, percentage);
      } else {
        updateSubnetPercentage(id, percentage);
      }
    }
  };

  const createUserModuleData = api.module.createUserModuleData.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error submitting data:", error);
      setIsSubmitting(false);
    },
  });

  const deleteUserModuleData = api.module.deleteUserModuleData.useMutation({
    onSuccess: () => {
      console.log("User module data deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user module data:", error);
    },
  });

  const createUserSubnetData = api.subnet.createUserSubnetData.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error submitting data:", error);
      setIsSubmitting(false);
    },
  });

  const deleteUserSubnetData = api.subnet.deleteUserSubnetData.useMutation({
    onSuccess: () => {
      console.log("User subnet data deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user subnet data:", error);
    },
  });

  const handleSubmit = async () => {
    if (!selectedAccount?.address || totalPercentage !== 100) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "modules") {
        // Delete existing user module data
        await deleteUserModuleData.mutateAsync({
          userKey: selectedAccount.address,
        });

        // Submit new user module data
        for (const delegatedModule of delegatedModules) {
          await createUserModuleData.mutateAsync({
            userKey: selectedAccount.address,
            moduleId: delegatedModule.id,
            weight: delegatedModule.percentage,
          });
        }

        updateOriginalModules();
      } else {
        // Delete existing user subnet data
        void deleteUserSubnetData.mutateAsync({
          userKey: selectedAccount.address,
        });

        // Submit new user subnet data
        for (const delegatedSubnet of delegatedSubnets) {
          void createUserSubnetData.mutateAsync({
            userKey: selectedAccount.address,
            netuid: delegatedSubnet.id,
            weight: delegatedSubnet.percentage,
          });
        }

        updateOriginalSubnets();
      }

      // Fetch updated data from the database
      if (activeTab === "modules") {
        const { data: updatedModuleData } =
          api.module.byUserModuleData.useQuery(
            { userKey: selectedAccount.address },
            { enabled: !!selectedAccount.address },
          );
        await refetchModules();
        const formattedModules = updatedModuleData?.map((module) => ({
          id: module.module_data.id,
          address: module.module_data.moduleKey,
          title: module.module_data.name ?? "",
          name: module.module_data.name ?? "",
          percentage: module.user_module_data.weight,
        }));
        setDelegatedModulesFromDB(formattedModules ?? []);
      } else {
        const { data: updatedSubnetData } =
          api.subnet.byUserSubnetData.useQuery(
            { userKey: selectedAccount.address },
            { enabled: !!selectedAccount.address },
          );
        await refetchSubnets();
        if (updatedSubnetData) {
          const formattedSubnets = updatedSubnetData.map((subnet) => ({
            id: subnet.subnet_data.id,
            name: subnet.subnet_data.name,
            percentage: subnet.user_subnet_data.weight,
            founderAddress: subnet.subnet_data.founder,
          }));
          setDelegatedSubnetsFromDB(formattedSubnets);
        }
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      setIsSubmitting(false);
    }
  };

  function handleModuleClick() {
    setActiveTab("modules");
    router.push("/modules");
  }

  function handleSubnetClick() {
    setActiveTab("subnets");
    router.push("/subnets");
  }

  const hasZeroPercentage = () => {
    const items = activeTab === "modules" ? delegatedModules : delegatedSubnets;
    return items.some((item) => item.percentage === 0);
  };

  function getSubmitStatus() {
    if (!selectedAccount?.address) {
      return { disabled: true, message: "Please connect your wallet" };
    }
    if (totalPercentage !== 100) {
      return { disabled: true, message: "Total percentage must be 100%" };
    }
    if (hasZeroPercentage()) {
      return {
        disabled: true,
        message: "Remove or allocate weight to all items",
      };
    }
    if (isSubmitting) {
      return { disabled: true, message: "Submitting..." };
    }
    if (
      (activeTab === "modules" && hasUnsavedModuleChanges()) ||
      (activeTab === "subnets" && hasUnsavedSubnetChanges())
    ) {
      return { disabled: false, message: "You have unsaved changes" };
    }
    return { disabled: false, message: "All changes saved!" };
  }

  const handleRemoveAllWeight = async () => {
    if (!selectedAccount?.address) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "modules") {
        await deleteUserModuleData.mutateAsync({
          userKey: selectedAccount.address,
        });
        setDelegatedModulesFromDB([]);
      } else {
        await deleteUserSubnetData.mutateAsync({
          userKey: selectedAccount.address,
        });
        setDelegatedSubnetsFromDB([]);
      }

      // Refetch data after removal
      if (activeTab === "modules") {
        await refetchModules();
      } else {
        await refetchSubnets();
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error removing weight:", error);
      setIsSubmitting(false);
    }
  };

  const hasItemsToClear =
    activeTab === "modules"
      ? delegatedModules.length > 0
      : delegatedSubnets.length > 0;

  const submitStatus = getSubmitStatus();

  return (
    <div className={`${pathname === "/" ? "hidden" : "block"}`}>
      {selectedAccount?.address && (
        <div className="fixed bottom-0 right-0 z-50 mt-8 hidden w-full flex-col-reverse text-sm md:bottom-4 md:mr-4 md:flex md:w-fit">
          <div className="flex animate-fade-up items-center justify-between divide-white/20 rounded-full border border-white/20 bg-[#898989]/5 font-semibold text-white backdrop-blur-md">
            <div className="mx-1 flex gap-1 border-white/20 pr-1">
              <button
                onClick={handleModuleClick}
                className={`rounded-full px-3 py-2 ${
                  activeTab === "modules"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                Modules
              </button>
              <button
                onClick={handleSubnetClick}
                className={`rounded-full px-3 py-2 ${
                  activeTab === "subnets"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                Subnets
              </button>
            </div>
            <p className="border-x border-white/20 px-3">
              <b
                className={`${activeTab === "subnets" ? "text-cyan-500" : "text-green-500"}`}
              >
                {activeTab === "modules"
                  ? delegatedModules.length
                  : delegatedSubnets.length}
              </b>{" "}
              {activeTab === "modules" ? "Modules" : "Subnets"}
            </p>
            <span className="border-r border-white/20 px-3">
              <b
                className={`${
                  totalPercentage !== 100
                    ? "text-amber-500"
                    : `${activeTab === "subnets" ? "text-cyan-500" : "text-green-500"}`
                }`}
              >
                {totalPercentage}%
              </b>{" "}
              Weighted
            </span>
            <span className="px-3">
              <div className="flex gap-1 text-white">
                <b
                  className={`${activeTab === "subnets" ? "text-cyan-500" : "text-green-500"}`}
                >
                  {userStakeWeight}
                </b>{" "}
                COMAI
              </div>
            </span>
            <span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "relative flex w-fit items-center gap-1 text-nowrap rounded-full border px-5 py-3 font-semibold transition duration-200",
                  activeTab === "subnets"
                    ? "border-cyan-500 bg-cyan-600/15 text-cyan-500 hover:border-cyan-400 hover:bg-cyan-500/15 active:bg-cyan-500/50"
                    : "border-green-500 bg-green-600/15 text-green-500 hover:border-green-400 hover:bg-green-500/15 active:bg-green-500/50",
                )}
              >
                <span>{isOpen ? "COLLAPSE VIEW" : "EXPAND VIEW"}</span>
                <span>
                  <ChevronUpIcon
                    className={`h-5 w-5 transform transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
            </span>
          </div>
          {isOpen && (
            <div className="mb-2 flex animate-fade-up flex-col divide-white/20 rounded-3xl border border-white/20 bg-[#898989]/5 p-4 font-semibold text-white backdrop-blur-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {activeTab === "modules" ? "Module" : "Subnet"}
                    </TableHead>
                    <TableHead>
                      {activeTab === "modules" ? "Address" : "Founder"}
                    </TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === "modules" ? (
                    delegatedModules.length ? (
                      delegatedModules.map((module) => (
                        <TableRow key={module.id}>
                          <TableCell className="font-medium">
                            {module.name}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {smallAddress(module.address)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={module.percentage}
                                onChange={(e) =>
                                  handlePercentageChange(
                                    module.id,
                                    Number(e.target.value),
                                  )
                                }
                                className="mr-1 w-12 bg-[#898989]/10 p-1 text-white"
                                min="0"
                                max="100"
                              />
                              <span className="mr-2 text-white">%</span>
                              <button
                                onClick={() => removeModule(module.id)}
                                className="ml-2 flex items-center rounded-full bg-red-500/10 p-1 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No modules found. Select a module to allocate weight
                          through the modules page and they will appear here.
                        </TableCell>
                      </TableRow>
                    )
                  ) : delegatedSubnets.length ? (
                    delegatedSubnets.map((subnet) => (
                      <TableRow key={subnet.id}>
                        <TableCell className="font-medium">
                          {subnet.name}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {smallAddress(subnet.founderAddress)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={subnet.percentage}
                              onChange={(e) =>
                                handlePercentageChange(
                                  subnet.id,
                                  Number(e.target.value),
                                )
                              }
                              className="mr-1 w-12 bg-[#898989]/10 p-1 text-white"
                              min="0"
                              max="100"
                            />
                            <span className="mr-2 text-white">%</span>
                            <button
                              onClick={() => removeSubnet(subnet.id)}
                              className="ml-2 flex items-center rounded-full bg-red-500/10 p-1 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No subnets found. Select a subnet to allocate weight
                        through the subnets page and they will appear here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Separator />
              <div className="w-full justify-center py-4 text-center">
                <span
                  className={`text-base font-semibold ${
                    submitStatus.message === "You have unsaved changes"
                      ? "text-pink-500"
                      : submitStatus.message === "All changes saved!"
                        ? activeTab === "subnets"
                          ? "text-cyan-500"
                          : "text-green-500"
                        : "text-amber-500"
                  }`}
                >
                  {submitStatus.message}
                </span>
              </div>
              <Separator />
              <div className="flex flex-row gap-3">
                <button
                  onClick={handleAutoCompletePercentage}
                  className={cn(
                    "mt-2 w-fit animate-fade text-nowrap rounded-full border p-2 px-4 text-white backdrop-blur-md transition duration-200 animate-delay-300",
                    totalPercentage === 100
                      ? "cursor-not-allowed border-white/20 bg-[#898989]/5 text-white opacity-50"
                      : "border-purple-500 bg-purple-500/10 text-purple-500 hover:border-purple-500 hover:bg-purple-500/15",
                  )}
                  disabled={totalPercentage === 100}
                >
                  Auto-Complete to 100%
                </button>
                {hasItemsToClear && (
                  <button
                    onClick={handleRemoveAllWeight}
                    className={cn(
                      "mt-4 w-fit animate-fade text-nowrap rounded-full border p-2 px-4 text-white backdrop-blur-md transition duration-200 animate-delay-300",
                      "border-red-500 bg-red-500/10 text-red-500 hover:border-red-400 hover:bg-red-500/15 active:bg-red-500/50",
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Removing..."
                      : `Remove ${activeTab === "modules" ? "Modules" : "Subnets"}`}
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "mt-4 w-full animate-fade rounded-full border p-2 text-white backdrop-blur-md transition duration-200 animate-delay-300",
                    submitStatus.disabled
                      ? "cursor-not-allowed border-white/20 bg-[#898989]/5 opacity-50"
                      : activeTab === "subnets"
                        ? "border-cyan-500 bg-cyan-600/15 text-cyan-500 hover:border-cyan-400 hover:bg-cyan-500/15 active:bg-cyan-500/50"
                        : "border-green-500 bg-green-600/15 text-green-500 hover:border-green-400 hover:bg-green-500/15 active:bg-green-500/50",
                  )}
                  disabled={submitStatus.disabled}
                  title={submitStatus.disabled ? submitStatus.message : ""}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : activeTab === "modules"
                      ? "Submit Modules"
                      : "Submit Subnets"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
