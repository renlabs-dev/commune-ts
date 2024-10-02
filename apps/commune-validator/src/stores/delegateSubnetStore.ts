import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Subnet } from "~/utils/types";

interface DelegatedSubnet extends Subnet {
  percentage: number;
}

interface DelegateState {
  delegatedSubnets: DelegatedSubnet[];
  originalSubnets: DelegatedSubnet[];
  addSubnet: (Subnet: Omit<DelegatedSubnet, "percentage">) => void;
  removeSubnet: (id: number) => void;
  updatePercentage: (id: number, percentage: number) => void;
  getTotalPercentage: () => number;
  setDelegatedSubnetsFromDB: (Subnets: DelegatedSubnet[]) => void;
  hasUnsavedChanges: () => boolean;
  updateOriginalSubnets: () => void;
}

export const useDelegateSubnetStore = create<DelegateState>()(
  persist(
    (set, get) => ({
      delegatedSubnets: [],
      originalSubnets: [],
      addSubnet: (Subnet) =>
        set((state) => ({
          delegatedSubnets: [
            ...state.delegatedSubnets,
            { ...Subnet, percentage: 1 },
          ],
        })),
      removeSubnet: (id) =>
        set((state) => ({
          delegatedSubnets: state.delegatedSubnets.filter((m) => m.id !== id),
        })),
      updatePercentage: (id, percentage) =>
        set((state) => ({
          delegatedSubnets: state.delegatedSubnets.map((m) =>
            m.id === id ? { ...m, percentage } : m,
          ),
        })),
      getTotalPercentage: () => {
        return get().delegatedSubnets.reduce((sum, m) => sum + m.percentage, 0);
      },
      setDelegatedSubnetsFromDB: (Subnets) =>
        set(() => ({ delegatedSubnets: Subnets, originalSubnets: Subnets })),
      updateOriginalSubnets: () =>
        set((state) => ({ originalSubnets: [...state.delegatedSubnets] })),
      hasUnsavedChanges: () => {
        const state = get();
        if (state.delegatedSubnets.length !== state.originalSubnets.length) {
          return true;
        }
        return state.delegatedSubnets.some((Subnet, index) => {
          const originalSubnet = state.originalSubnets[index];
          return (
            Subnet.id !== originalSubnet?.id ||
            Subnet.percentage !== originalSubnet.percentage
          );
        });
      },
    }),
    {
      name: "delegate-subnet-storage",
    },
  ),
);
