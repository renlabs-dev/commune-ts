import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DelegatedModule {
  id: number;
  address: string;
  title: string;
  percentage: number;
}

interface DelegateState {
  delegatedModules: DelegatedModule[];
  addModule: (module: Omit<DelegatedModule, "percentage">) => void;
  removeModule: (id: number) => void;
  updatePercentage: (id: number, percentage: number) => void;
  getTotalPercentage: () => number;
  setDelegatedModules: (modules: DelegatedModule[]) => void;
  clearStorage: () => void;
}

export const useDelegateStore = create<DelegateState>()(
  persist(
    (set, get) => ({
      delegatedModules: [],
      addModule: (module) =>
        set((state) => ({
          delegatedModules: [
            ...state.delegatedModules,
            { ...module, percentage: 0 },
          ],
        })),
      removeModule: (id) =>
        set((state) => ({
          delegatedModules: state.delegatedModules.filter((m) => m.id !== id),
        })),
      updatePercentage: (id, percentage) =>
        set((state) => ({
          delegatedModules: state.delegatedModules.map((m) =>
            m.id === id ? { ...m, percentage } : m,
          ),
        })),
      getTotalPercentage: () => {
        return get().delegatedModules.reduce((sum, m) => sum + m.percentage, 0);
      },
      setDelegatedModules: (modules) =>
        set(() => ({ delegatedModules: modules })),
      clearStorage: () => set(() => ({ delegatedModules: [] })),
    }),
    {
      name: "delegate-storage",
    },
  ),
);
