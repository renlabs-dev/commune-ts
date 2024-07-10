import { create } from "zustand";

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
}

export const useDelegateStore = create<DelegateState>((set, get) => ({
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
}));
